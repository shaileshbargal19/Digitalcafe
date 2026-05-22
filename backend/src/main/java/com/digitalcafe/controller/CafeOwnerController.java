package com.digitalcafe.controller;

import com.digitalcafe.model.Order;
import com.digitalcafe.model.User;
import com.digitalcafe.repository.MenuItemRepository;
import com.digitalcafe.repository.OrderRepository;
import com.digitalcafe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cafe")
@CrossOrigin
public class CafeOwnerController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/cafe/{ownerId}/stats
     * Dashboard summary for the cafe owner
     */
    @GetMapping("/{ownerId}/stats")
    public ResponseEntity<?> getCafeStats(@PathVariable Long ownerId) {
        try {
            // Orders for this cafe
            List<Order> cafeOrders = orderRepository.findByMenuItemOwnerId(ownerId);

            // Today's orders
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            List<Order> todayOrders = cafeOrders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfDay))
                    .collect(Collectors.toList());

            // Revenue today
            double todayRevenue = todayOrders.stream()
                    .filter(o -> !"CANCELLED".equals(o.getStatus()))
                    .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0)
                    .sum();

            // Pending / active orders
            long activeOrders = cafeOrders.stream()
                    .filter(o -> "PENDING".equals(o.getStatus()) || "PREPARING".equals(o.getStatus()))
                    .count();

            // Menu item count
            long menuCount = menuItemRepository.countByOwnerId(ownerId);

            // Staff count (users where approvedBy = ownerId)
            long staffCount = userRepository.findAll().stream()
                    .filter(u -> ownerId.equals(u.getApprovedBy()) &&
                            ("CHEF".equals(u.getRole()) || "WAITER".equals(u.getRole())))
                    .count();

            // Weekly revenue for chart (last 7 days)
            List<Map<String, Object>> weeklyRevenue = new ArrayList<>();
            for (int i = 6; i >= 0; i--) {
                LocalDateTime dayStart = LocalDate.now().minusDays(i).atStartOfDay();
                LocalDateTime dayEnd = dayStart.plusDays(1);
                String dayLabel = LocalDate.now().minusDays(i).getDayOfWeek().name().substring(0, 3);
                double rev = cafeOrders.stream()
                        .filter(o -> o.getCreatedAt() != null
                                && o.getCreatedAt().isAfter(dayStart)
                                && o.getCreatedAt().isBefore(dayEnd)
                                && !"CANCELLED".equals(o.getStatus()))
                        .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0)
                        .sum();
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("label", dayLabel);
                entry.put("value", rev);
                weeklyRevenue.add(entry);
            }

            // Orders trend (last 7 days)
            List<Map<String, Object>> weeklyOrders = new ArrayList<>();
            for (int i = 6; i >= 0; i--) {
                LocalDateTime dayStart = LocalDate.now().minusDays(i).atStartOfDay();
                LocalDateTime dayEnd = dayStart.plusDays(1);
                String dayLabel = LocalDate.now().minusDays(i).getDayOfWeek().name().substring(0, 3);
                long cnt = cafeOrders.stream()
                        .filter(o -> o.getCreatedAt() != null
                                && o.getCreatedAt().isAfter(dayStart)
                                && o.getCreatedAt().isBefore(dayEnd))
                        .count();
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("label", dayLabel);
                entry.put("value", cnt);
                weeklyOrders.add(entry);
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("todayOrders", todayOrders.size());
            result.put("todayRevenue", todayRevenue);
            result.put("activeOrders", activeOrders);
            result.put("totalOrders", cafeOrders.size());
            result.put("menuCount", menuCount);
            result.put("staffCount", staffCount);
            result.put("weeklyRevenue", weeklyRevenue);
            result.put("weeklyOrders", weeklyOrders);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching stats: " + e.getMessage());
        }
    }

    /**
     * GET /api/cafe/{ownerId}/orders
     * All orders for this cafe owner's menu
     */
    @GetMapping("/{ownerId}/orders")
    public ResponseEntity<?> getCafeOrders(@PathVariable Long ownerId) {
        try {
            List<Order> orders = orderRepository.findByMenuItemOwnerId(ownerId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching orders: " + e.getMessage());
        }
    }

    /**
     * GET /api/cafe/{ownerId}/staff
     * Staff approved by this cafe owner
     */
    @GetMapping("/{ownerId}/staff")
    public ResponseEntity<?> getCafeStaff(@PathVariable Long ownerId) {
        try {
            List<User> staff = userRepository.findAll().stream()
                    .filter(u -> ownerId.equals(u.getApprovedBy()) &&
                            ("CHEF".equals(u.getRole()) || "WAITER".equals(u.getRole())))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching staff: " + e.getMessage());
        }
    }
}
