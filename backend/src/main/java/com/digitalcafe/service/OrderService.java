package com.digitalcafe.service;

import com.digitalcafe.model.Order;
import com.digitalcafe.model.User;
import com.digitalcafe.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public Order placeOrder(Order order) {
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByCustomer(User customer) {
        return orderRepository.findByCustomer(customer);
    }

    public List<Order> getOrdersByCustomerId(Long customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByCafeOwnerId(Long ownerId) {
        return orderRepository.findByMenuItemOwnerId(ownerId);
    }

    public Order updateStatus(Long orderId, String status) {
        try {
            Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
            order.setStatus(status);
            return orderRepository.save(order);
        } catch (Exception e) {
            System.err.println("Error updating order status: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
