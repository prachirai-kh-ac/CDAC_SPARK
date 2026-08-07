package com.cdac.spark.userexam.service.impl;

import com.cdac.spark.userexam.service.interfaces.EmailService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.util.StreamUtils;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("classpath:templates/otp-email.html")
    private Resource otpTemplate;

    

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            String htmlTemplate = StreamUtils.copyToString(otpTemplate.getInputStream(), StandardCharsets.UTF_8);
            String htmlContent = htmlTemplate.replace("{{OTP}}", otp);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "CDAC Spark");
            helper.setTo(toEmail);
            helper.setSubject("CDAC Spark | Password Reset OTP");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send HTML email: " + e.getMessage());
        }
    }
}
