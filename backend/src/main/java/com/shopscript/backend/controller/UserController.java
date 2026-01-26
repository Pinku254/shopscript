package com.shopscript.backend.controller;

import com.shopscript.backend.dto.JwtResponse;
import com.shopscript.backend.dto.LoginRequest;
import com.shopscript.backend.entity.User;
import com.shopscript.backend.security.JwtUtils;
import java.util.Optional;
import com.shopscript.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userService.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        // Force USER role for public registration
        user.setRole(User.Role.USER);

        String rawPassword = user.getPassword();
        User registeredUser = userService.registerUser(user);

        // Auto-login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), rawPassword));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        return ResponseEntity.ok(new JwtResponse(jwt,
                registeredUser.getId(),
                registeredUser.getUsername(),
                registeredUser.getRole().name()));
    }

    @PostMapping("/create")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (userService.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }
        // Allow role to be set by the admin (passed in request body)
        // Default to USER if null, but Admin panel will send ADMIN
        if (user.getRole() == null) {
            user.setRole(User.Role.USER);
        }

        User registeredUser = userService.registerUser(user);
        return ResponseEntity.ok(registeredUser);
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public java.util.List<User> getAllUsers() {
        // Need to add findAll to UserService or direct repo access?
        // Better to use Service if available, but Repo is private in Controller
        // usually?
        // Controller has userService, check if it has findAll.
        // If not, we might need to add it or just use Repository if injected (not
        // filtered).
        // Let's assume we need to add findAll to UserService first.
        return userService.findAll();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("Login attempt for username: " + loginRequest.getUsername());

        // Check if user exists first (both User and Admin tables)
        if (userService.findByUsername(loginRequest.getUsername()).isEmpty() &&
                userService.findAdminByUsername(loginRequest.getUsername()).isEmpty()) {
            return ResponseEntity.status(404).body("User not registered. Please create an account first.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            System.out.println("Authentication successful for: " + loginRequest.getUsername());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            System.out.println(
                    "Principal: " + userDetails.getUsername() + ", Authorities: " + userDetails.getAuthorities());

            // Check if Admin
            java.util.Optional<com.shopscript.backend.entity.Admin> admin = userService
                    .findAdminByUsername(userDetails.getUsername());
            if (admin.isPresent()) {
                System.out.println("User identified as Admin");
                return ResponseEntity.ok(new JwtResponse(jwt,
                        admin.get().getId(), // Uses Admin ID
                        admin.get().getUsername(),
                        "ADMIN"));
            }

            // check user
            System.out.println("Checking for regular user");
            User user = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("User identified as Regular User: " + user.getRole());
            return ResponseEntity.ok(new JwtResponse(jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getRole().name()));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid password. Please try again.");
        } catch (Exception e) {
            System.out.println("Login failed for unknown reason: " + loginRequest.getUsername());
            System.out.println("Exception message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    @PostMapping("/forgot-password/get-question")
    public ResponseEntity<?> getSecurityQuestion(@RequestBody java.util.Map<String, String> request) {
        String username = request.get("username");
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required");
        }

        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();
        if (user.getSecurityQuestion() == null || user.getSecurityQuestion().isEmpty()) {
            return ResponseEntity.badRequest().body("No security question set for this account");
        }

        return ResponseEntity.ok(java.util.Map.of("securityQuestion", user.getSecurityQuestion()));
    }

    @PostMapping("/forgot-password/reset-with-answer")
    public ResponseEntity<?> resetPasswordWithSecurityAnswer(@RequestBody java.util.Map<String, String> request) {
        String username = request.get("username");
        String answer = request.get("answer");
        String newPassword = request.get("newPassword");

        if (username == null || answer == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();
        if (user.getSecurityAnswer() == null || !user.getSecurityAnswer().equalsIgnoreCase(answer.trim())) {
            return ResponseEntity.status(400).body("Incorrect security answer");
        }

        userService.updatePassword(user, newPassword);

        return ResponseEntity.ok("Password reset successfully");
    }
}
