package com.cdac.spark.userexam.service;

import com.cdac.spark.userexam.dto.req.*;
import com.cdac.spark.userexam.dto.res.*;
import com.cdac.spark.userexam.entity.OtpVerification;
import com.cdac.spark.userexam.entity.User;
import com.cdac.spark.userexam.exception.BadRequestException;
import com.cdac.spark.userexam.repository.OtpVerificationRepository;
import com.cdac.spark.userexam.repository.UserRepository;
import com.cdac.spark.userexam.security.CustomUserDetailsImpl;
import com.cdac.spark.userexam.security.JwtUtil;
import com.cdac.spark.userexam.service.impl.AuthServiceImpl;
import com.cdac.spark.userexam.service.interfaces.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private OtpVerificationRepository otpRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setEmail("user@cdac.in");
        testUser.setPrn("240011");
        testUser.setFullName("John Doe");
        testUser.setRole("ROLE_STUDENT");
        testUser.setStatus("ACTIVE");
        testUser.setPassword("encodedPassword");
    }

    @Test
    @DisplayName("Service Login - Success")
    void testLogin_Success() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("user@cdac.in", "Password123");
        Authentication authentication = mock(Authentication.class);
        CustomUserDetailsImpl userDetails = mock(CustomUserDetailsImpl.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtil.generateJwt(userDetails)).thenReturn("generated-jwt-token");
        when(userRepository.findByEmail("user@cdac.in")).thenReturn(Optional.of(testUser));

        // Act
        LoginResponse response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("generated-jwt-token", response.getToken());
        assertEquals("Login successful.", response.getMessage());
        assertEquals("STUDENT", response.getRole());
        assertEquals("user@cdac.in", response.getEmail());
        verify(userRepository, times(1)).findByEmail("user@cdac.in");
    }

    @Test
    @DisplayName("Service Login - Suspended User Throws Exception")
    void testLogin_SuspendedUser_ThrowsBadRequest() {
        // Arrange
        testUser.setStatus("SUSPENDED");
        LoginRequest loginRequest = new LoginRequest("user@cdac.in", "Password123");
        Authentication authentication = mock(Authentication.class);
        CustomUserDetailsImpl userDetails = mock(CustomUserDetailsImpl.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findByEmail("user@cdac.in")).thenReturn(Optional.of(testUser));

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.login(loginRequest));
        assertTrue(exception.getMessage().contains("suspended"));
    }

    @Test
    @DisplayName("Service Forgot Password - Success")
    void testForgotPassword_Success() {
        // Arrange
        ForgotPasswordRequest request = new ForgotPasswordRequest("user@cdac.in");
        when(userRepository.findByEmail("user@cdac.in")).thenReturn(Optional.of(testUser));
        when(otpRepository.findTopByUser_UserIdAndActiveTrueOrderByCreatedAtDesc(1L)).thenReturn(Optional.empty());

        // Act
        ForgotPasswordResponse response = authService.forgotPassword(request);

        // Assert
        assertTrue(response.isSuccess());
        verify(otpRepository, times(1)).save(any(OtpVerification.class));
        verify(emailService, times(1)).sendOtpEmail(eq("user@cdac.in"), anyString());
    }

    @Test
    @DisplayName("Service Verify OTP - Valid OTP")
    void testVerifyOtp_Valid() {
        // Arrange
        VerifyOtpRequest request = new VerifyOtpRequest("user@cdac.in", "1234");
        OtpVerification otpVer = new OtpVerification();
        otpVer.setUser(testUser);
        otpVer.setOtp("1234");
        otpVer.setActive(true);
        otpVer.setAttempts(0);
        otpVer.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByEmail("user@cdac.in")).thenReturn(Optional.of(testUser));
        when(otpRepository.findTopByUser_UserIdAndActiveTrueOrderByCreatedAtDesc(1L)).thenReturn(Optional.of(otpVer));

        // Act
        ForgotPasswordResponse response = authService.verifyOtp(request);

        // Assert
        assertTrue(response.isSuccess());
        assertTrue(otpVer.isVerified());
        verify(otpRepository, times(1)).save(otpVer);
    }

    @Test
    @DisplayName("Service Verify OTP - Invalid OTP")
    void testVerifyOtp_Invalid() {
        // Arrange
        VerifyOtpRequest request = new VerifyOtpRequest("user@cdac.in", "9999");
        OtpVerification otpVer = new OtpVerification();
        otpVer.setUser(testUser);
        otpVer.setOtp("1234");
        otpVer.setActive(true);
        otpVer.setAttempts(0);
        otpVer.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByEmail("user@cdac.in")).thenReturn(Optional.of(testUser));
        when(otpRepository.findTopByUser_UserIdAndActiveTrueOrderByCreatedAtDesc(1L)).thenReturn(Optional.of(otpVer));

        // Act
        ForgotPasswordResponse response = authService.verifyOtp(request);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals(1, otpVer.getAttempts());
        verify(otpRepository, times(1)).save(otpVer);
    }

    @Test
    @DisplayName("Service Reset Password - Success")
    void testResetPassword_Success() {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest("user@cdac.in", "1234", "NewPass123");
        OtpVerification otpVer = new OtpVerification();
        otpVer.setUser(testUser);
        otpVer.setOtp("1234");
        otpVer.setVerified(true);
        otpVer.setActive(true);
        otpVer.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByEmail("user@cdac.in")).thenReturn(Optional.of(testUser));
        when(otpRepository.findTopByUser_UserIdAndActiveTrueOrderByCreatedAtDesc(1L)).thenReturn(Optional.of(otpVer));
        when(passwordEncoder.encode("NewPass123")).thenReturn("encodedNewPassword");

        // Act
        ForgotPasswordResponse response = authService.resetPassword(request);

        // Assert
        assertTrue(response.isSuccess());
        verify(passwordEncoder, times(1)).encode("NewPass123");
        verify(userRepository, times(1)).save(testUser);
        assertFalse(otpVer.isActive());
    }
}
