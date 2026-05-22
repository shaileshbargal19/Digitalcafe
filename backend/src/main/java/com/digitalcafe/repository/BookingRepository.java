package com.digitalcafe.repository;

import com.digitalcafe.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Booking> findByCafeIdOrderByCreatedAtDesc(Long cafeId);
    List<Booking> findByUserIdAndBookingType(Long userId, String bookingType);
}
