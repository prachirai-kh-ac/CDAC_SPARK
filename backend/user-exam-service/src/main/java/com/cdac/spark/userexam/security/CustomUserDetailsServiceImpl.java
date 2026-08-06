package com.cdac.spark.userexam.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cdac.spark.userexam.entity.User;
import com.cdac.spark.userexam.repository.UserRepository;

@Service
@Transactional
public class CustomUserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepo.findByEmailOrPrn(username, username)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid Email ID or PRN"));
        return new CustomUserDetailsImpl(user);
    }

    public CustomUserDetailsServiceImpl(UserRepository userRepo) {
        this.userRepo = userRepo;
    }
}
