package com.cdac.spark.userexam.security;

import com.cdac.spark.userexam.entity.User;
import com.cdac.spark.userexam.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        User admin = userRepository.findByEmail("Admin@gmail.com").orElse(new User());
        admin.setEmail("Admin@gmail.com");
        admin.setFullName("Default Admin");
        admin.setPassword(passwordEncoder.encode("Admin123"));
        admin.setRole("ROLE_ADMIN");
        userRepository.save(admin);
    }
}
