package com.cdac.spark.userexam.controller;

import com.cdac.spark.userexam.dto.req.*;
import com.cdac.spark.userexam.dto.res.*;
import com.cdac.spark.userexam.service.interfaces.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private com.cdac.spark.userexam.security.JwtUtil jwtUtil;

    @MockBean
    private com.cdac.spark.userexam.security.CustomUserDetailsServiceImpl customUserDetailsService;

    private LoginRequest validLoginRequest;
    private LoginResponse loginResponse;

    @BeforeEach
    void setUp() {
        validLoginRequest = new LoginRequest("user@cdac.in", "Password123");
        loginResponse = new LoginResponse();
        loginResponse.setMessage("Login successful.");
        loginResponse.setToken("mock-jwt-token");
        loginResponse.setRole("STUDENT");
        loginResponse.setUserId("1");
        loginResponse.setFullName("John Doe");
        loginResponse.setEmail("user@cdac.in");
    }

    @Test
    @DisplayName("Login - Valid Credentials")
    void testLogin_ValidCredentials() throws Exception {
        // Arrange
        when(authService.login(any(LoginRequest.class))).thenReturn(loginResponse);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.message").value("Login successful."))
                .andExpect(jsonPath("$.email").value("user@cdac.in"));
    }

    @Test
    @DisplayName("Login - Invalid Credentials")
    void testLogin_InvalidCredentials() throws Exception {
        // Arrange
        LoginRequest invalidRequest = new LoginRequest("invalid@cdac.in", "WrongPass");
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    @DisplayName("Login - Wrong Password")
    void testLogin_WrongPassword() throws Exception {
        // Arrange
        LoginRequest wrongPassRequest = new LoginRequest("user@cdac.in", "WrongPassword");
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongPassRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    @DisplayName("Generate OTP - Forgot Password Request")
    void testGenerateOtp_Success() throws Exception {
        // Arrange
        ForgotPasswordRequest request = new ForgotPasswordRequest("user@cdac.in");
        ForgotPasswordResponse response = new ForgotPasswordResponse(true, "If the account exists, an OTP has been sent to the registered email address.");
        when(authService.forgotPassword(any(ForgotPasswordRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("OTP has been sent")));
    }

    @Test
    @DisplayName("Reset Password - Valid OTP")
    void testResetPassword_ValidOtp() throws Exception {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest("user@cdac.in", "1234", "NewPass123");
        ForgotPasswordResponse response = new ForgotPasswordResponse(true, "Password changed successfully. Please login with your new password.");
        when(authService.resetPassword(any(ResetPasswordRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Password changed successfully. Please login with your new password."));
    }

    @Test
    @DisplayName("Reset Password - Invalid OTP")
    void testResetPassword_InvalidOtp() throws Exception {
        // Arrange
        VerifyOtpRequest request = new VerifyOtpRequest("user@cdac.in", "9999");
        ForgotPasswordResponse response = new ForgotPasswordResponse(false, "Invalid OTP.");
        when(authService.verifyOtp(any(VerifyOtpRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid OTP."));
    }
}
