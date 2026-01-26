package com.shopscript.backend.service;

import com.shopscript.backend.entity.User;
import com.shopscript.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public void updatePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByMobile(String mobile) {
        return userRepository.findByMobile(mobile);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public java.util.List<User> findAll() {
        return userRepository.findAll();
    }

    @Autowired
    private com.shopscript.backend.repository.AdminRepository adminRepository;

    public java.util.Optional<com.shopscript.backend.entity.Admin> findAdminByUsername(String username) {
        return adminRepository.findByUsername(username);
    }

    public com.shopscript.backend.entity.Admin registerAdmin(com.shopscript.backend.entity.Admin admin) {
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        return adminRepository.save(admin);
    }
}
