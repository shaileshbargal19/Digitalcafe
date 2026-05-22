package com.digitalcafe.service;

import com.digitalcafe.dto.RegisterRequest;
import com.digitalcafe.model.*;
import com.digitalcafe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private DocumentVerificationService documentVerificationService;

    public PasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }

    public User registerUser(RegisterRequest req) {
        User user;
        String role = req.getRole() != null ? req.getRole().toUpperCase() : "";

        // Polymorphic instantiation from DTO
        switch (role) {
            case "ADMIN":
                Admin admin = new Admin();
                admin.setDocumentType(req.getDocumentType());
                admin.setDocumentPath(req.getDocumentPath());
                admin.setEducation(req.getEducation());
                admin.setGradeType(req.getGradeType());
                if (req.getGradeValue() != null && !req.getGradeValue().isEmpty()) {
                    try { admin.setGradeValue(Double.parseDouble(req.getGradeValue())); } catch (NumberFormatException ignored) {}
                }
                admin.setExperienceYears(req.getExperienceYears());
                user = admin;
                break;
            case "CUSTOMER":
                Customer customer = new Customer();
                customer.setFoodPreference(req.getRoleMetadata()); 
                customer.setDocumentType(req.getDocumentType());
                customer.setDocumentPath(req.getDocumentPath());
                customer.setEducation(req.getEducation());
                customer.setGradeType(req.getGradeType());
                if (req.getGradeValue() != null && !req.getGradeValue().isEmpty()) {
                    try { customer.setGradeValue(Double.parseDouble(req.getGradeValue())); } catch (NumberFormatException ignored) {}
                }
                customer.setExperienceYears(req.getExperienceYears());
                user = customer;
                break;
            case "CAFE_OWNER":
                CafeOwner owner = new CafeOwner();
                owner.setDocumentType(req.getDocumentType());
                owner.setDocumentPath(req.getDocumentPath());
                owner.setEducation(req.getEducation());
                owner.setGradeType(req.getGradeType());
                if (req.getGradeValue() != null && !req.getGradeValue().isEmpty()) {
                    try { owner.setGradeValue(Double.parseDouble(req.getGradeValue())); } catch (NumberFormatException ignored) {}
                }
                owner.setExperienceYears(req.getExperienceYears());
                owner.setRoleMetadata(req.getRoleMetadata()); 
                user = owner;
                break;
            default:
                Staff staff = new Staff();
                staff.setRoleMetadata(req.getRoleMetadata());
                user = staff;
        }

        // Copy common fields
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setGender(req.getGender());
        user.setDob(req.getDob());
        user.setAddress(req.getAddress());
        user.setCity(req.getCity());
        user.setPincode(req.getPincode());
        user.setState(req.getState());
        user.setCountry(req.getCountry());
        user.setRole(role);

        // Password handling: For Admins, we might set it now. 
        if ("ADMIN".equalsIgnoreCase(role)) {
            if (req.getPassword() == null || req.getPassword().isEmpty()) {
                String tempPassword = generateTempPassword();
                user.setPassword(passwordEncoder.encode(tempPassword));
                System.out.println("DEBUG: Generated password for ADMIN: " + tempPassword);
            } else {
                user.setPassword(passwordEncoder.encode(req.getPassword()));
            }
            user.setStatus("APPROVED");
        } else if ("CUSTOMER".equalsIgnoreCase(role) || "CAFE_OWNER".equalsIgnoreCase(role)) {
            // Set initial temp values
            user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            user.setStatus("PENDING");

            // Invoke automated AI Document Auto-Verification Model
            String docType = req.getDocumentType();
            String docPath = req.getDocumentPath();
            DocumentVerificationService.VerificationResult result = 
                documentVerificationService.verifyDocument(user, docType, docPath);

            user.setVerificationScore(result.getConfidenceScore());
            user.setVerificationNotes(result.getNotes());

            if (result.isVerified()) {
                user.setStatus("APPROVED");
                user.setApprovedBy(999L); // 999 denotes AI System Auto-Verification
                
                String tempPassword = generateRandomPassword();
                user.setPassword(passwordEncoder.encode(tempPassword));
                
                // Send approval credentials dynamically
                emailService.sendApprovalTempPassword(user.getEmail(), user.getFirstName(), tempPassword);
                System.out.println("[AI Auto-Verify] SUCCESS: User approved automatically. Confidence score: " + result.getConfidenceScore() + "%");
            } else {
                user.setStatus("REJECTED");
                emailService.sendRegistrationNotification(user.getEmail(), user.getFirstName());
                System.out.println("[AI Auto-Verify] REJECTED: Reason: " + result.getNotes());
            }
        } else {
            // Staff or others
            if (req.getPassword() == null || req.getPassword().isEmpty()) {
                 user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            } else {
                 user.setPassword(passwordEncoder.encode(req.getPassword()));
            }
            user.setStatus("PENDING");
        }

        return userRepository.save(user);
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public List<User> getCafes() {
        return userRepository.findByRole("CAFE_OWNER");
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByEmailAndRole(String email, String role) {
        return userRepository.findByEmailAndRole(email, role);
    }

    public User approveUser(Long userId, Long approverId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus("APPROVED");
            user.setApprovedBy(approverId);
            
            // Generate temporary password
            String tempPassword = generateRandomPassword();
            user.setPassword(passwordEncoder.encode(tempPassword));
            
            // Send Approval Email with Temporary Password
            emailService.sendApprovalTempPassword(user.getEmail(), user.getFirstName(), tempPassword);

            return userRepository.save(user);
        }
        return null;
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public boolean resetPassword(String email, String otp, String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (otp != null && otp.equals(user.getOtp())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setOtp(null); // Clear OTP after use
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    public User changePassword(Long userId, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            return userRepository.save(user);
        }
        return null;
    }

    public User addStaffByOwner(RegisterRequest staffReq, Long ownerId) {
        Staff staff = new Staff();
        // Copy common fields
        staff.setFirstName(staffReq.getFirstName());
        staff.setLastName(staffReq.getLastName());
        staff.setEmail(staffReq.getEmail());
        staff.setPhone(staffReq.getPhone());
        staff.setRole(staffReq.getRole());
        staff.setRoleMetadata(staffReq.getRoleMetadata());
        staff.setEducation(staffReq.getEducation());
        staff.setExperienceYears(staffReq.getExperienceYears());
        staff.setDocumentType(staffReq.getDocumentType());
        staff.setDocumentPath(staffReq.getDocumentPath());

        staff.setApprovedBy(ownerId);
        staff.setStatus("APPROVED");

        // Generate temporary password based on first name
        String firstName = staffReq.getFirstName();
        String tempPassword = (firstName != null && !firstName.isEmpty() ? firstName.toLowerCase() : "staff") + "@123";
        staff.setPassword(passwordEncoder.encode(tempPassword));

        System.out.println("DEBUG: Created staff " + staff.getEmail() + " with password: " + tempPassword);

        User savedStaff = userRepository.save(staff);

        // Send email with credentials
        emailService.sendCredentials(savedStaff.getEmail(), tempPassword, "Directly added by Owner");

        return savedStaff;
    }

    public User updateUser(Long id, RegisterRequest req) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User existingUser = userOpt.get();
            
            // Common fields
            existingUser.setFirstName(req.getFirstName());
            existingUser.setLastName(req.getLastName());
            existingUser.setPhone(req.getPhone());
            existingUser.setGender(req.getGender());
            existingUser.setDob(req.getDob());
            existingUser.setAddress(req.getAddress());
            existingUser.setCity(req.getCity());
            existingUser.setPincode(req.getPincode());
            existingUser.setState(req.getState());
            existingUser.setCountry(req.getCountry());

            // Handle role-specific fields safely
            if (existingUser instanceof Customer) {
                // If roleMetadata is provided (e.g. food preference), update it in the specialized field
                if (req.getRoleMetadata() != null) {
                    ((Customer) existingUser).setFoodPreference(req.getRoleMetadata());
                }
                if (req.getEducation() != null) ((Customer) existingUser).setEducation(req.getEducation());
                if (req.getExperienceYears() != null) ((Customer) existingUser).setExperienceYears(req.getExperienceYears());
                if (req.getDocumentType() != null) ((Customer) existingUser).setDocumentType(req.getDocumentType());
                if (req.getGradeType() != null) ((Customer) existingUser).setGradeType(req.getGradeType());
            } else if (existingUser instanceof Staff) {
                Staff staff = (Staff) existingUser;
                if (req.getRoleMetadata() != null) staff.setRoleMetadata(req.getRoleMetadata());
                if (req.getEducation() != null) staff.setEducation(req.getEducation());
                if (req.getExperienceYears() != null) staff.setExperienceYears(req.getExperienceYears());
                if (req.getGradeType() != null) staff.setGradeType(req.getGradeType());
            } else if (existingUser instanceof CafeOwner) {
                CafeOwner owner = (CafeOwner) existingUser;
                if (req.getRoleMetadata() != null) owner.setRoleMetadata(req.getRoleMetadata());
                if (req.getExperienceYears() != null) owner.setExperienceYears(req.getExperienceYears());
                if (req.getEducation() != null) owner.setEducation(req.getEducation());
                if (req.getDocumentType() != null) owner.setDocumentType(req.getDocumentType());
            } else if (existingUser instanceof Admin) {
                // Admin ID/Staff code stored in some shared field if needed, or in a specific one if added
                // For now, if we want to store something, we can use a generic field or skip if none.
                // Assuming admin might want to store their ID in a future field or just use base.
            }

            // Only update password if provided
            if (req.getPassword() != null && !req.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(req.getPassword()));
            }

            return userRepository.save(existingUser);
        }
        return null;
    }

    public void updateUserOtp(Long id, String otp) {
        userRepository.findById(id).ifPresent(u -> {
            u.setOtp(otp);
            userRepository.save(u);
        });
    }

    public void sendManualOtp(String email, String name, String otp) {
        emailService.sendPasswordResetOTP(email, name, otp);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
