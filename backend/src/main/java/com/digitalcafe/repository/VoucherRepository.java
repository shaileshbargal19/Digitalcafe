package com.digitalcafe.repository;

import com.digitalcafe.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    List<Voucher> findByCustomerId(Long customerId);
    List<Voucher> findByCustomerIdAndStatus(Long customerId, String status);
}
