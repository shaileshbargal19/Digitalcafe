package com.digitalcafe.service;

import com.digitalcafe.model.Booking;
import com.digitalcafe.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public Booking createBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Booking> getBookingsByCafe(Long cafeId) {
        return bookingRepository.findByCafeIdOrderByCreatedAtDesc(cafeId);
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public Booking updateStatus(Long id, String status) {
        return bookingRepository.findById(id).map(b -> {
            b.setStatus(status);
            return bookingRepository.save(b);
        }).orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public void cancelBooking(Long id, Long userId) {
        bookingRepository.findById(id).ifPresent(b -> {
            if (b.getUserId().equals(userId)) {
                b.setStatus("CANCELLED");
                bookingRepository.save(b);
            }
        });
    }
}
