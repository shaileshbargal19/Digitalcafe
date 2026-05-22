package com.digitalcafe.repository;

import com.digitalcafe.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCategory(String category);
    List<MenuItem> findByOwnerId(Long ownerId);
    long countByOwnerId(Long ownerId);
}
