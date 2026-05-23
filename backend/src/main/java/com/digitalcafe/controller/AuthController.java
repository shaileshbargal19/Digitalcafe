package com.digitalcafe.controller;

import com.digitalcafe.dto.LoginRequest;
import com.digitalcafe.dto.RegisterRequest;
import com.digitalcafe.model.User;
import com.digitalcafe.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @GetMapping("/cafes")
    public ResponseEntity<?> getCafes() {
        return ResponseEntity.ok(userService.getCafes());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.getRole() == null || req.getRole().isEmpty()) {
            return ResponseEntity.badRequest().body("Role is required for registration.");
        }
        String role = req.getRole().toUpperCase();
        if (!"ADMIN".equals(role) && !"CUSTOMER".equals(role) && !"CAFE_OWNER".equals(role)) {
            return ResponseEntity.badRequest().body("Permission Denied: Public registration is not permitted for this role.");
        }

        if (userService.findByEmailAndRole(req.getEmail(), req.getRole()).isPresent()) {
            return ResponseEntity.badRequest().body("User with this email already exists for role: " + req.getRole());
        }


        try {
            User registered = userService.registerUser(req);
            if ("REJECTED".equalsIgnoreCase(registered.getStatus())) {
                return ResponseEntity.badRequest().body("Registration Rejected: AI document verification failed.");
            }
            return ResponseEntity.ok(registered);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt;

        if (loginRequest.getRole() != null && !loginRequest.getRole().isEmpty()) {
            userOpt = userService.findByEmailAndRole(loginRequest.getEmail(), loginRequest.getRole());
        } else {
            userOpt = userService.findByEmail(loginRequest.getEmail());
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            boolean isMatch = userService.getPasswordEncoder().matches(loginRequest.getPassword(), user.getPassword());

            // Dynamic rule check: If credentials don't match, check if CHEF or WAITER password matches `<firstname>@123`
            if (!isMatch && ("CHEF".equalsIgnoreCase(user.getRole()) || "WAITER".equalsIgnoreCase(user.getRole()))) {
                String expectedPassword = (user.getFirstName() != null && !user.getFirstName().isEmpty()
                        ? user.getFirstName().toLowerCase() : "staff") + "@123";
                if (expectedPassword.equals(loginRequest.getPassword())) {
                    // Automatically update/migrate their password in DB
                    userService.changePassword(user.getId(), expectedPassword);
                    isMatch = true;
                }
            }

            if (isMatch) {
                if (!"APPROVED".equalsIgnoreCase(user.getStatus())) {
                    return ResponseEntity.status(403).body("Access Denied: Your account (" + user.getRole() + ") is pending approval.");
                }
                return ResponseEntity.ok(user);
            }
        }

        return ResponseEntity.status(401).body("Invalid email, password, or role selection");
    }

    @PutMapping("/approve/{userId}")
    public ResponseEntity<?> approveUser(@PathVariable Long userId, @RequestParam Long approverId) {
        Optional<User> approverOpt = userService.findById(approverId);
        Optional<User> targetOpt = userService.findById(userId);

        if (approverOpt.isEmpty() || targetOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User approver = approverOpt.get();
        User target = targetOpt.get();

        boolean canApprove = false;

        // Logic: Admin approves Owners/Customers. Owners approve Staff.
        if ("ADMIN".equalsIgnoreCase(approver.getRole())) {
            if ("CAFE_OWNER".equalsIgnoreCase(target.getRole()) || "CUSTOMER".equalsIgnoreCase(target.getRole())) {
                canApprove = true;
            }
        } else if ("CAFE_OWNER".equalsIgnoreCase(approver.getRole())) {
            if ("CHEF".equalsIgnoreCase(target.getRole()) || "WAITER".equalsIgnoreCase(target.getRole())) {
                canApprove = true;
            }
        }

        if (canApprove) {
            User approved = userService.approveUser(userId, approverId);
            return ResponseEntity.ok(approved);
        } else {
            return ResponseEntity.status(403).body("Permission Denied: You cannot approve this role.");
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (otp.equals(user.getOtp())) {
                user.setOtp(null); // Clear OTP after use
                return ResponseEntity.ok("OTP Verified Successfully");
            }
        }
        return ResponseEntity.status(401).body("Invalid OTP");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Generate NEW OTP
            String otp = String.format("%06d", new java.util.Random().nextInt(999999));
            user.setOtp(otp);
            userService.updateUserOtp(user.getId(), otp); // I'll add this helper to UserService
            
            // Reuse approval email service or specific forgot pass email
            // For now, let's just trigger the same Approval OTP email but with different context
            userService.sendManualOtp(user.getEmail(), user.getFirstName(), otp);
            
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "OTP sent successfully to " + email);
            response.put("otpBackup", otp);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body("User not found");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, @RequestParam String otp, @RequestParam String newPassword) {
        boolean success = userService.resetPassword(email, otp, newPassword);
        if (success) {
            return ResponseEntity.ok("Password reset successfully. You can now login.");
        }
        return ResponseEntity.badRequest().body("Invalid OTP or Email");
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestParam Long userId, @RequestParam String newPassword) {
        User updated = userService.changePassword(userId, newPassword);
        if (updated != null) {
            return ResponseEntity.ok("Password updated successfully");
        }
        return ResponseEntity.badRequest().body("User not found");
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PostMapping("/add-staff")
    public ResponseEntity<?> addStaff(@RequestBody RegisterRequest staffReq, @RequestParam Long ownerId) {
        Optional<User> ownerOpt = userService.findById(ownerId);
        if (ownerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Owner not found");
        }

        User owner = ownerOpt.get();
        if (!"CAFE_OWNER".equalsIgnoreCase(owner.getRole())) {
            return ResponseEntity.status(403).body("Only Cafe Owners can add staff.");
        }

        if (!"CHEF".equalsIgnoreCase(staffReq.getRole()) && !"WAITER".equalsIgnoreCase(staffReq.getRole())) {
            return ResponseEntity.badRequest().body("Invalid staff role. Must be CHEF or WAITER.");
        }

        if (userService.findByEmail(staffReq.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User savedStaff = userService.addStaffByOwner(staffReq, ownerId);
        return ResponseEntity.ok(savedStaff);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestParam Long requesterId) {
        Optional<User> requesterOpt = userService.findById(requesterId);
        Optional<User> targetOpt = userService.findById(id);

        if (requesterOpt.isEmpty() || targetOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User requester = requesterOpt.get();
        User target = targetOpt.get();

        boolean canDelete = false;

        // Admin can delete anyone except other admins? (Simple logic for now)
        if ("ADMIN".equalsIgnoreCase(requester.getRole())) {
            canDelete = true;
        } 
        // Owners can delete CHEFs and WAITERs
        else if ("CAFE_OWNER".equalsIgnoreCase(requester.getRole())) {
            if ("CHEF".equalsIgnoreCase(target.getRole()) || "WAITER".equalsIgnoreCase(target.getRole())) {
                canDelete = true;
            }
        }

        if (canDelete) {
            userService.deleteUser(id);
            return ResponseEntity.ok("User removed successfully");
        } else {
            return ResponseEntity.status(403).body("Permission Denied: You cannot remove this role.");
        }
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody RegisterRequest req) {
        User updated = userService.updateUser(id, req);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.badRequest().body("User not found");
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Clear sensitive fields
            user.setPassword(null);
            user.setOtp(null);
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.badRequest().body("User not found");
    }
}
