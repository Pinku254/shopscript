package com.shopscript.backend.config;

import com.shopscript.backend.entity.Admin;
import com.shopscript.backend.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (adminRepository.findByUsername("admin").isEmpty()) {
                Admin admin = new Admin();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                // role defaults to ADMIN in entity logic or handled by UserDetails
                adminRepository.save(admin);
                System.out.println("Admin user created in Admin table: username=admin, password=admin123");
            }
        };
    }
}
