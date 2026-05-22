package com.digitalcafe.controller;

import com.digitalcafe.model.Order;
import com.digitalcafe.model.User;
import com.digitalcafe.repository.ComplaintRepository;
import com.digitalcafe.repository.OrderRepository;
import com.digitalcafe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.digitalcafe.service.UserService;
import com.digitalcafe.service.EmailService;
import com.digitalcafe.service.DocumentVerificationService;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private DocumentVerificationService documentVerificationService;

    @PostMapping("/ai-verify-all")
    public ResponseEntity<?> runAiVerificationScan() {
        List<User> allUsers = userRepository.findAll();
        int scanned = 0;
        int approved = 0;
        int rejected = 0;

        for (User user : allUsers) {
            if ("PENDING".equalsIgnoreCase(user.getStatus())) {
                try {
                    scanned++;
                    
                    String docType = null;
                    String docPath = null;
                    
                    if (user instanceof com.digitalcafe.model.Customer) {
                        docType = ((com.digitalcafe.model.Customer) user).getDocumentType();
                        docPath = ((com.digitalcafe.model.Customer) user).getDocumentPath();
                    } else if (user instanceof com.digitalcafe.model.CafeOwner) {
                        docType = ((com.digitalcafe.model.CafeOwner) user).getDocumentType();
                        docPath = ((com.digitalcafe.model.CafeOwner) user).getDocumentPath();
                    } else if (user instanceof com.digitalcafe.model.Staff) {
                        docType = ((com.digitalcafe.model.Staff) user).getDocumentType();
                        docPath = ((com.digitalcafe.model.Staff) user).getDocumentPath();
                    } else if (user instanceof com.digitalcafe.model.Admin) {
                        docType = ((com.digitalcafe.model.Admin) user).getDocumentType();
                        docPath = ((com.digitalcafe.model.Admin) user).getDocumentPath();
                    }

                    DocumentVerificationService.VerificationResult result = 
                        documentVerificationService.verifyDocument(user, docType, docPath);

                    user.setVerificationScore(result.getConfidenceScore());
                    user.setVerificationNotes(result.getNotes());

                    if (result.isVerified()) {
                        user.setStatus("APPROVED");
                        user.setApprovedBy(999L);
                        
                        // Generate temp password and encrypt
                        String tempPassword = generateRandomPassword();
                        user.setPassword(userService.getPasswordEncoder().encode(tempPassword));
                        
                        // Send Email
                        try {
                            emailService.sendApprovalTempPassword(user.getEmail(), user.getFirstName(), tempPassword);
                        } catch (Exception e) {
                            System.err.println("Email failed for " + user.getEmail() + ": " + e.getMessage());
                        }
                        approved++;
                    } else {
                        user.setStatus("REJECTED");
                        rejected++;
                    }
                    userRepository.save(user);
                } catch (Exception ex) {
                    System.err.println("Failed to process user ID: " + user.getId() + ". Error: " + ex.getMessage());
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("scanned", scanned);
        response.put("approved", approved);
        response.put("rejected", rejected);
        return ResponseEntity.ok(response);
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.countByRole("CUSTOMER");
        long totalCafes = userRepository.countByRole("CAFE_OWNER");
        long totalOrdersCount = orderRepository.count();
        
        Double totalRev = orderRepository.calculateTotalRevenue();
        double totalRevenue = totalRev != null ? totalRev : 0.0;
        
        long totalComplaints = complaintRepository.count();

        stats.put("totalUsers", totalUsers);
        stats.put("totalCafes", totalCafes);
        stats.put("totalOrders", totalOrdersCount);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalComplaints", totalComplaints);
        
        // Recent 5 orders and users for dashboard tables
        List<Order> recentOrders = orderRepository.findFirst5ByOrderByCreatedAtDesc();
        List<User> recentUsers = userRepository.findFirst5ByOrderByCreatedAtDesc();

        stats.put("recentOrders", recentOrders);
        stats.put("recentUsers", recentUsers);
        
        return stats;
    }

    @GetMapping("/analytics/{range}")
    public Map<String, Object> getAnalytics(@PathVariable String range) {
        Map<String, Object> result = new HashMap<>();

        // ── Totals ──
        result.put("totalUsers", userRepository.countByRole("CUSTOMER"));
        result.put("totalCafes", userRepository.countByRole("CAFE_OWNER"));
        result.put("totalOrders", orderRepository.count());
        
        Double totalRev = orderRepository.calculateTotalRevenue();
        result.put("totalRevenue", totalRev != null ? totalRev : 0.0);

        // ── Chart Data Aggregation (Simplified) ──
        // In a real app, we'd use DB grouping. Here we'll map Mon-Sun for the current week.
        List<String> labels = Arrays.asList("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");
        
        // Mocking distribution for visuals if no data exists, otherwise we'd group by day
        result.put("labels", labels);
        result.put("userTrend", Arrays.asList(2, 5, 3, 6, 4, 3, 2));
        result.put("cafeTrend", Arrays.asList(1, 0, 1, 0, 2, 1, 0));
        result.put("revenueTrend", Arrays.asList(1200, 2500, 1800, 3100, 4500, 5200, 3800));
        
        // Goals (Mocked)
        result.put("userGoal", 75);
        result.put("cafeGoal", 60);

        return result;
    }
}
