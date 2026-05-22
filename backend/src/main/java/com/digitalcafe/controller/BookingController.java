package com.digitalcafe.controller;

import com.digitalcafe.model.Booking;
import com.digitalcafe.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /** Customer creates a booking */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        if (booking.getUserId() == null || booking.getCafeId() == null
                || booking.getBookingType() == null || booking.getBookingDate() == null
                || booking.getBookingTime() == null) {
            return ResponseEntity.badRequest().body("Required fields missing");
        }
        try {
            return ResponseEntity.ok(bookingService.createBooking(booking));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Booking failed: " + e.getMessage());
        }
    }

    /** Customer views their own bookings */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }

    /** Cafe owner views bookings at their cafe */
    @GetMapping("/cafe/{cafeId}")
    public ResponseEntity<List<Booking>> getCafeBookings(@PathVariable Long cafeId) {
        return ResponseEntity.ok(bookingService.getBookingsByCafe(cafeId));
    }

    /** Cancel a booking (customer) */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, @RequestParam Long userId) {
        bookingService.cancelBooking(id, userId);
        return ResponseEntity.ok("Booking cancelled");
    }

    /** Confirm or update status (cafe owner / admin) */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(bookingService.updateStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
