package com.cdac.spark.userexam.service.impl;

import com.cdac.spark.userexam.dto.req.LoginRequest;
import com.cdac.spark.userexam.dto.res.LoginResponse;
import com.cdac.spark.userexam.dto.res.ProfileResponse;
import com.cdac.spark.userexam.entity.User;
import com.cdac.spark.userexam.exception.BadRequestException;
import com.cdac.spark.userexam.exception.ResourceNotFoundException;
import com.cdac.spark.userexam.repository.UserRepository;
import com.cdac.spark.userexam.security.JwtUtil;
import com.cdac.spark.userexam.service.interfaces.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.cdac.spark.userexam.repository.OtpVerificationRepository;
import com.cdac.spark.userexam.service.interfaces.EmailService;
import com.cdac.spark.userexam.entity.OtpVerification;
import com.cdac.spark.userexam.dto.req.*;
import com.cdac.spark.userexam.dto.res.*;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthServiceImpl(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserRepository userRepository,
                           PasswordEncoder passwordEncoder, OtpVerificationRepository otpRepository, EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtil.generateJwt((com.cdac.spark.userexam.security.CustomUserDetailsImpl) userDetails);
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> userRepository.findByPrn(request.getEmail())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        
        if ("SUSPENDED".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Your account has been suspended. Please contact the administrator.");
        }

        LoginResponse res = new LoginResponse();
        res.setMessage("Login successful.");
        res.setToken(jwt);
        res.setRole(user.getRole().replace("ROLE_", ""));
        res.setUserId(user.getUserId().toString());
        res.setFullName(user.getFullName());
        res.setEmail(user.getEmail());
        res.setPrn(user.getPrn());
        res.setBatchName(user.getBatchName());
        res.setCourseName(user.getCourseName());
        res.setExpiresAt(java.time.LocalDateTime.now().plusHours(10).toString());
        
        return res;
    }

    @Override
    public ProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        ProfileResponse res = new ProfileResponse();
        res.setUserId(user.getUserId());
        res.setFullName(user.getFullName());
        res.setEmail(user.getEmail());
        res.setRole(user.getRole().replace("ROLE_", ""));
        res.setPrn(user.getPrn());
        res.setPhone(user.getMobileNumber());
        res.setBatchName(user.getBatchName());
        res.setCourseName(user.getCourseName());
        return res;
    }

    @Override
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getUsername());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPrn(request.getUsername());
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getEmail() != null) {
                // Invalidate existing active OTPs
                Optional<OtpVerification> existingOpt = otpRepository.findTopByUser_UserIdAndActiveTrueOrderByCreatedAtDesc(user.getUserId());
                if (existingOpt.isPresent()) {
                    OtpVerification existing = existingOpt.get();
                    existing.setActive(false);
                    otpRepository.save(existing);
                }

                // Generate new 4-digit OTP
                String otp = String.format("%04d", secureRandom.nextInt(10000));
                
                OtpVerification otpVer = new OtpVerification();
                otpVer.setUser(user);
                otpVer.setOtp(otp);
                otpVer.setCreatedAt(LocalDateTime.now());
                otpVer.setExpiresAt(LocalDateTime.now().plusMinutes(5));
                otpRepository.save(otpVer);

                // For local testing: Print the OTP to the console
                System.out.println("======================================");
                System.out.println("OTP for " + user.getEmail() + " is: " + otp);
                System.out.println("======================================");

                try {
                    emailService.sendOtpEmail(user.getEmail(), otp);
                } catch (Exception e) {
                    System.err.println("Failed to send email: " + e.getMessage());
                }
            }
        }
        
        return new ForgotPasswordResponse(true, "If the account exists, an OTP has been sent to the registered email address.");
    }

    @Override
    public ForgotPasswordResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getUsername())
                .orElseGet(() -> userRepository.findByPrn(request.getUsername()).orElse(null));

        if (user == null) {
            return new ForgotPasswordResponse(false, "Invalid OTP.");
        }

        Optional<OtpVerification> otpOpt = otpRepository.findTopByUser_UserIdAndActiveTrueOrderByCreatedAtDesc(user.getUserId());
        if (otpOpt.isEmpty()) {
            return new ForgotPasswordResponse(false, "Invalid OTP.");
        }

        OtpVerification otpVer = otpOpt.get();
        
        if (otpVer.getAttempts() >= 3) {
            otpVer.setActive(false);
            otpRepository.save(otpVer);
            return new ForgotPasswordResponse(false, "Maximum attempts reached. Please request a new OTP.");
        }

        if (otpVer.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpVer.setActive(false);
            otpRepository.save(otpVer);
            return new ForgotPasswordResponse(false, "OTP has expired. Please request a new OTP.");
        }

        if (!otpVer.getOtp().equals(request.getOtp())) {
            otpVer.setAttempts(otpVer.getAttempts() + 1);
            otpRepository.save(otpVer);
            return new ForgotPasswordResponse(false, "Invalid OTP.");
        }

        otpVer.setVerified(true);
        otpRepository.save(otpVer);

        return new ForgotPasswordResponse(true, "OTP verified successfully.");
    }

    @Override
    public ForgotPasswordResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getUsername())
                .orElseGet(() -> userRepository.findByPrn(request.getUsername()).orElse(null));

        if (user == null) {
            return new ForgotPasswordResponse(false, "Invalid request.");
        }

        Optional<OtpVerification> otpOpt = otpRepository.findTopByUser_UserIdAndActiveTrueOrderByCreatedAtDesc(user.getUserId());
        if (otpOpt.isEmpty() || !otpOpt.get().isVerified()) {
            return new ForgotPasswordResponse(false, "OTP verification required.");
        }

        OtpVerification otpVer = otpOpt.get();
        if (otpVer.getExpiresAt().isBefore(LocalDateTime.now())) {
            return new ForgotPasswordResponse(false, "Session expired. Please request a new OTP.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpVer.setActive(false);
        otpRepository.save(otpVer);

        return new ForgotPasswordResponse(true, "Password changed successfully. Please login with your new password.");
    }
}
