package com.digitalcafe.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendRegistrationNotification(String toEmail, String name) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Registration Received - Digital Cafe");
        
        String body = "Hello " + name + ",\n\n" +
                      "Thank you for registering with Digital Cafe.\n" +
                      "Your application is currently under review by our administration team.\n\n" +
                      "Once approved, you will receive another email containing your temporary login credentials and a verification OTP.\n\n" +
                      "Please wait for the approval confirmation.\n\n" +
                      "Best Regards,\n" +
                      "Admin Team";
        
        message.setText(body);
        
        try {
            mailSender.send(message);
            System.out.println("LOG: Registration acknowledgement sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send registration email to " + toEmail + ". Error: " + e.getMessage());
        }
    }

    @Async
    public void sendApprovalTempPassword(String toEmail, String name, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Account Approved - Your Temporary Password");
        
        String body = "Congratulations " + name + ",\n\n" +
                      "Your Digital Cafe account has been approved by the Administrator.\n\n" +
                      "To finalize your setup, please log in with your temporary password or use the Forgot Password process to set a new one:\n\n" +
                      "Temporary Password: " + tempPassword + "\n\n" +
                      "How to set your personalized password:\n" +
                      "1. Visit the 'Forgot Password' page on our website.\n" +
                      "2. Enter your email and follow the OTP verification process.\n" +
                      "3. Choose your new secure password.\n\n" +
                      "Best Regards,\n" +
                      "Digital Cafe Administration";
        
        message.setText(body);
        
        try {
            mailSender.send(message);
            System.out.println("LOG: Approval Temp Password sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send approval email to " + toEmail + ". Error: " + e.getMessage());
            System.out.println("CRITICAL BACKUP: TEMP PASSWORD FOR " + toEmail + " IS: " + tempPassword);
        }
    }

    @Async
    public void sendPasswordResetOTP(String toEmail, String name, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP - Digital Cafe");
        
        String body = "Hello " + name + ",\n\n" +
                      "You have requested to reset your password for your Digital Cafe account.\n\n" +
                      "Please use the Verification OTP below to proceed:\n\n" +
                      "Verification OTP: " + otp + "\n\n" +
                      "If you did not request a password reset, please ignore this email.\n\n" +
                      "Best Regards,\n" +
                      "Digital Cafe Administration";
        
        message.setText(body);
        
        try {
            mailSender.send(message);
            System.out.println("LOG: Password Reset OTP sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send reset email to " + toEmail + ". Error: " + e.getMessage());
            System.out.println("CRITICAL BACKUP: OTP FOR " + toEmail + " IS: " + otp);
        }
    }


    @Async
    public void sendCredentials(String toEmail, String temporaryPassword, String otp) {
        // Keeping this for Staff Registration (Owner adding Chef/Waiter)
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome to Digital Cafe - Your Staff Credentials");
        
        String body = "Welcome aboard!\n\n" +
                      "You have been added to the Digital Cafe personnel roster.\n" +
                      "Please log in using these temporary credentials:\n\n" +
                      "Email: " + toEmail + "\n" +
                      "Temporary Password: " + temporaryPassword + "\n\n" +
                      "Security Note: Please update your password immediately after logging in.\n\n" +
                      "Best Regards,\n" +
                      "Management Team";
        
        message.setText(body);
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.out.println("BACKUP FOR STAFF " + toEmail + ": PWD=" + temporaryPassword);
        }
    }
}
