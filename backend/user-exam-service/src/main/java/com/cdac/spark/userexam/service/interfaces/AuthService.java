package com.cdac.spark.userexam.service.interfaces;

import com.cdac.spark.userexam.dto.req.LoginRequest;
import com.cdac.spark.userexam.dto.res.LoginResponse;
import com.cdac.spark.userexam.dto.res.ProfileResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    ProfileResponse getProfile(String email);
    com.cdac.spark.userexam.dto.res.ForgotPasswordResponse forgotPassword(com.cdac.spark.userexam.dto.req.ForgotPasswordRequest request);
    com.cdac.spark.userexam.dto.res.ForgotPasswordResponse verifyOtp(com.cdac.spark.userexam.dto.req.VerifyOtpRequest request);
    com.cdac.spark.userexam.dto.res.ForgotPasswordResponse resetPassword(com.cdac.spark.userexam.dto.req.ResetPasswordRequest request);
}
