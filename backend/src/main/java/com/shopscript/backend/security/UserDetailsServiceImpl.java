package com.shopscript.backend.security;

import com.shopscript.backend.entity.User;
import com.shopscript.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopscript.backend.entity.Admin;
import com.shopscript.backend.repository.AdminRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    AdminRepository adminRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Check Admin table first
        java.util.Optional<Admin> admin = adminRepository.findByUsername(username);
        if (admin.isPresent()) {
            return org.springframework.security.core.userdetails.User
                    .withUsername(admin.get().getUsername())
                    .password(admin.get().getPassword())
                    .roles("ADMIN")
                    .build();
        }

        // Check User table
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }
}
