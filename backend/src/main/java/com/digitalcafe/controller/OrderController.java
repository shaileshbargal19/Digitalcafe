package com.digitalcafe.controller;

import com.digitalcafe.model.Order;
import com.digitalcafe.model.OrderItem;
import com.digitalcafe.model.User;
import com.digitalcafe.repository.MenuItemRepository;
import com.digitalcafe.repository.UserRepository;
import com.digitalcafe.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    /** Legacy endpoint – full Order object */
    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody Order order) {
        return ResponseEntity.ok(orderService.placeOrder(order));
    }

    /**
     * Simple place-order endpoint.
     * Body: { customerId, cafeId, serviceType, items: [{menuItemId, quantity, price}] }
     */
    @PostMapping("/place")
    public ResponseEntity<?> placeOrderSimple(@RequestBody Map<String, Object> body) {
        try {
            Long customerId = Long.valueOf(body.get("customerId").toString());
            String serviceType = body.getOrDefault("serviceType", "DINE_IN").toString();

            User customer = userRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) body.get("items");

            List<OrderItem> orderItems = new ArrayList<>();
            double total = 0;

            for (Map<String, Object> itemMap : itemsData) {
                Long menuItemId = Long.valueOf(itemMap.get("menuItemId").toString());
                int qty = Integer.parseInt(itemMap.get("quantity").toString());
                double price = Double.parseDouble(itemMap.get("price").toString());

                OrderItem oi = new OrderItem();
                oi.setQuantity(qty);
                oi.setPrice(price);
                menuItemRepository.findById(menuItemId).ifPresent(oi::setMenuItem);
                orderItems.add(oi);
                total += qty * price;
            }

            Order order = new Order();
            order.setCustomer(customer);
            order.setItems(orderItems);
            order.setTotalAmount(total);
            order.setServiceType(serviceType);
            order.setStatus("PENDING");

            Order saved = orderService.placeOrder(order);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Order failed: " + e.getMessage());
        }
    }

    /** Customer views their own order history */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getCustomerOrders(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomerId(customerId));
    }

    @GetMapping("/admin")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    /** View live orders for a particular staff member's associated cafe */
    @GetMapping("/staff/{staffId}")
    public ResponseEntity<?> getStaffCafeOrders(@PathVariable Long staffId) {
        try {
            User staff = userRepository.findById(staffId)
                    .orElseThrow(() -> new RuntimeException("Staff member not found"));

            if (staff.getApprovedBy() == null) {
                return ResponseEntity.badRequest().body("Staff member is not assigned to any cafe.");
            }

            // Fetch orders for the cafe owner who approved this staff member
            List<Order> cafeOrders = orderService.getOrdersByCafeOwnerId(staff.getApprovedBy());
            return ResponseEntity.ok(cafeOrders);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching staff orders: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            System.out.println("Updating Order ID: " + id + " to Status: " + status);
            orderService.updateStatus(id, status);
            return ResponseEntity.ok(Map.of("success", true, "message", "Order status updated to " + status));
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            return ResponseEntity.status(500).body("Error: " + e.getMessage() + "\nStackTrace: " + sw.toString());
        }
    }
}
