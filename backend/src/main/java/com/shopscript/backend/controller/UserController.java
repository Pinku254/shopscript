package com.shopscript.backend.controller;

import com.shopscript.backend.dto.JwtResponse;
import com.shopscript.backend.dto.LoginRequest;
import com.shopscript.backend.entity.User;
import com.shopscript.backend.security.JwtUtils;
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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Check if Admin
        java.util.Optional<com.shopscript.backend.entity.Admin> admin = userService
                .findAdminByUsername(userDetails.getUsername());
        if (admin.isPresent()) {
            return ResponseEntity.ok(new JwtResponse(jwt,
                    admin.get().getId(), // Uses Admin ID (might overlap with User ID but usually separate context)
                    admin.get().getUsername(),
                    "ADMIN"));
        }

        // Must be normal user
        User user = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new JwtResponse(jwt,
                user.getId(),
                user.getUsername(),
                user.getRole().name()));
    }
}
