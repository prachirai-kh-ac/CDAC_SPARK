package com.cdac.spark.userexam.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
@Component
public class CustomJwtVerificationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            
            try {
                Claims claims = jwtUtil.validateToken(jwt);
                String email = claims.getSubject();
                String role = claims.get("user_role", String.class);
                
                String authRole = role != null && role.startsWith("ROLE_") ? role : "ROLE_" + role;
                List<GrantedAuthority> authorities = AuthorityUtils.createAuthorityList(authRole);
                
                UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(email, null, authorities);
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
            } catch (Exception e) {
                // Invalid token, do not authenticate
                System.out.println("JWT verification failed: " + e.getMessage());
            }
        }
        
        filterChain.doFilter(request, response);
    }

    public CustomJwtVerificationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
}
