package com.cdac.spark.userexam.service.interfaces;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otp);
}
