package com.digitalcafe.repository;

import com.digitalcafe.model.Order;
import com.digitalcafe.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer(User customer);
    List<Order> findByStatus(String status);
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    // Find all orders that contain at least one menu item owned by the given cafe owner
    @Query("SELECT DISTINCT o FROM Order o JOIN o.items oi JOIN oi.menuItem mi WHERE mi.owner.id = :ownerId ORDER BY o.createdAt DESC")
    List<Order> findByMenuItemOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.customer.id = :customerId AND o.status != 'CANCELLED'")
    Double calculateTotalSpendByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status != 'CANCELLED'")
    Double calculateTotalRevenue();

    List<Order> findFirst5ByOrderByCreatedAtDesc();
}
