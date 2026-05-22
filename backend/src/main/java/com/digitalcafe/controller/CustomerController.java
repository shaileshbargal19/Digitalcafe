package com.digitalcafe.controller;

import com.digitalcafe.model.Customer;
import com.digitalcafe.model.Order;
import com.digitalcafe.model.Voucher;
import com.digitalcafe.repository.CustomerRepository;
import com.digitalcafe.repository.OrderRepository;
import com.digitalcafe.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private VoucherRepository voucherRepository;

    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getDashboardStats(@PathVariable Long id) {
        Optional<Customer> customerOpt = customerRepository.findById(id);
        if (customerOpt.isEmpty()) return ResponseEntity.notFound().build();

        Customer customer = customerOpt.get();
        List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(id);
        List<Voucher> vouchers = voucherRepository.findByCustomerId(id);

        Map<String, Object> stats = new HashMap<>();
        stats.put("loyaltyPoints", customer.getLoyaltyPoints());
        stats.put("totalOrders", orders.size());

        // Calculate total spend efficiently using DB
        Double totalSpend = orderRepository.calculateTotalSpendByCustomerId(id);
        stats.put("monthlySpend", totalSpend != null ? totalSpend : 0.0);

        stats.put("activeVouchers", vouchers.stream().filter(v -> "active".equalsIgnoreCase(v.getStatus())).count());

        // Recent 5 orders
        stats.put("recentOrders", orders.stream().limit(5).collect(Collectors.toList()));

        // Spending data for chart (last 7 days)
        // Mock data for visual consistency in the chart
        List<Map<String, Object>> spendChart = Arrays.asList(
                createDayData("Mon", 450),
                createDayData("Tue", 0),
                createDayData("Wed", 280),
                createDayData("Thu", 620),
                createDayData("Fri", 350),
                createDayData("Sat", 890),
                createDayData("Sun", 150)
        );
        stats.put("spendChart", spendChart);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{id}/vouchers")
    public ResponseEntity<List<Voucher>> getVouchers(@PathVariable Long id) {
        return ResponseEntity.ok(voucherRepository.findByCustomerId(id));
    }

    private Map<String, Object> createDayData(String label, double value) {
        Map<String, Object> m = new HashMap<>();
        m.put("label", label);
        m.put("value", value);
        return m;
    }
}
