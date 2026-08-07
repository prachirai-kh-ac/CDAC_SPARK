package com.cdac.spark.userexam.entity;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "full_name")
    private String fullName;
    
    @Column(unique = true)
    private String email;
    
    private String password;
    
    private String role;
    
    @Column(unique = true)
    private String prn;

    @Column(name = "status")
    private String status = "ACTIVE";

    @Column(name = "batch_name")
    private String batchName;

    @Column(name = "course_name")
    private String courseName;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(name = "suspension_reason")
    private String suspensionReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<ExamAttempt> examAttempts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<OtpVerification> otpVerifications;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
