package com.shopscript.backend.controller;

import com.shopscript.backend.entity.Order;
import com.shopscript.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @PostMapping("/user/{userId}")
    public Order createOrder(@PathVariable Long userId, @RequestBody Order order) {
        return orderService.createOrder(userId, order);
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/user/{userId}")
    public List<Order> getUserOrders(@PathVariable Long userId) {
        return orderService.getUserOrders(userId);
    }

    @PutMapping("/{id}/status")
    public Order updateStatus(@PathVariable Long id, @RequestParam Order.Status status) {
        return orderService.updateOrderStatus(id, status);
    }
}
