package com.cdac.spark.userexam.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.cdac.spark.userexam.entity.User;

public class CustomUserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;
    private User user;

    public CustomUserDetailsImpl(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String authRole = user.getRole() != null && user.getRole().startsWith("ROLE_") ? user.getRole() : "ROLE_" + user.getRole();
        return List.of(new SimpleGrantedAuthority(authRole));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    public User getUser() {
        return user;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.getStatus() != null && user.getStatus().equals("ACTIVE");
    }
}
