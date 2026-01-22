package com.shopscript.backend.service;

import com.shopscript.backend.entity.Order;
import com.shopscript.backend.entity.User;
import com.shopscript.backend.repository.OrderRepository;
import com.shopscript.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    public Order createOrder(Long userId, Order order) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        order.setUser(user);

        if (order.getItems() != null) {
            for (com.shopscript.backend.entity.OrderItem item : order.getItems()) {
                item.setOrder(order);
            }
        }

        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order updateOrderStatus(Long id, Order.Status status) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
