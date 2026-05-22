package com.digitalcafe.repository;

import com.digitalcafe.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.role = :role")
    Optional<User> findByEmailAndRole(String email, String role);

    List<User> findByRole(String role);

    long countByRole(String role);

    List<User> findFirst5ByOrderByCreatedAtDesc();
}
