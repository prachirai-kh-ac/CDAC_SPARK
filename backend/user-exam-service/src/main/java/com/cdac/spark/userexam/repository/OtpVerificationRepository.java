package com.cdac.spark.userexam.repository;

import com.cdac.spark.userexam.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByUser_UserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);
}
