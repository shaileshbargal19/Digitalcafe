package com.digitalcafe.controller;

import com.digitalcafe.model.Order;
import com.digitalcafe.repository.OrderRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin
public class PaymentController {

    // Use Razorpay test keys. For production, move to application.properties
    @Value("${razorpay.key.id}")
    private String rzpKeyId;

    @Value("${razorpay.key.secret}")
    private String rzpKeySecret;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Step 1: Create a Razorpay order.
     * Body: { amount (in paise), currency, receipt, orderId (our DB order id) }
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        System.out.println("DEBUG: createOrder called with body: " + body);
        try {
            long amountPaise = Long.parseLong(body.get("amount").toString());
            String currency = body.getOrDefault("currency", "INR").toString();
            String receipt = body.getOrDefault("receipt", "rcpt_" + System.currentTimeMillis()).toString();

            System.out.println("DEBUG: Using Key ID: " + rzpKeyId);
            RazorpayClient client = new RazorpayClient(rzpKeyId, rzpKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountPaise);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receipt);
            orderRequest.put("payment_capture", 1);

            com.razorpay.Order rzpOrder = client.orders.create(orderRequest);
            System.out.println("DEBUG: Razorpay Order created: " + rzpOrder.get("id"));

            if (body.containsKey("orderId")) {
                Long dbOrderId = Long.parseLong(body.get("orderId").toString());
                Optional<Order> optOrder = orderRepository.findById(dbOrderId);
                optOrder.ifPresent(o -> {
                    o.setRazorpayOrderId(rzpOrder.get("id"));
                    orderRepository.save(o);
                });
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", rzpOrder.get("id"));
            response.put("amount", rzpOrder.get("amount"));
            response.put("currency", rzpOrder.get("currency"));
            response.put("keyId", rzpKeyId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("ERROR: createOrder failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Payment initialization failed: " + e.getMessage());
        }
    }

    /**
     * Step 2: Verify the Razorpay payment signature and mark order as PAID.
     * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId }
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> body) {
        System.out.println("DEBUG: verifyPayment called with: " + body);
        try {
            String rzpOrderId = body.get("razorpay_order_id").toString();
            String rzpPaymentId = body.get("razorpay_payment_id").toString();
            String rzpSignature = body.get("razorpay_signature").toString();
            Long dbOrderId = Long.parseLong(body.get("dbOrderId").toString());

            // 1. Manual Signature Verification (Most robust for debugging)
            String data = rzpOrderId + "|" + rzpPaymentId;
            String generatedSig = calculateHmacSha256(data, rzpKeySecret);

            System.out.println("DEBUG: Data String: " + data);
            System.out.println("DEBUG: Generated Sig: " + generatedSig);
            System.out.println("DEBUG: Received Sig:  " + rzpSignature);

            if (!generatedSig.equals(rzpSignature)) {
                System.err.println("CRITICAL: Signature Mismatch!");
                return ResponseEntity.badRequest().body("Signature Mismatch. Check your Secret Key.");
            }

            // 2. Update DB order
            Order order = orderRepository.findById(dbOrderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + dbOrderId));
            order.setPaymentId(rzpPaymentId);
            order.setPaymentStatus("PAID");
            // DO NOT set status to CONFIRMED here. Let the Cafe Owner do it manually.
            orderRepository.save(order);

            System.out.println("SUCCESS: Order " + dbOrderId + " marked as PAID");
            return ResponseEntity.ok(Map.of("success", true));

        } catch (Exception e) {
            System.err.println("ERROR: Verification error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Verification error: " + e.getMessage());
        }
    }

    private String calculateHmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
