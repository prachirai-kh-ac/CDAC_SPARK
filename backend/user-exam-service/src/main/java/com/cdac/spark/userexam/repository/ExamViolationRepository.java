package com.cdac.spark.userexam.repository;

import com.cdac.spark.userexam.entity.ExamViolation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamViolationRepository extends JpaRepository<ExamViolation, Long> {
}
