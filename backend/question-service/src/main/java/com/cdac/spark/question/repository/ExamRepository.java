package com.cdac.spark.question.repository;

import com.cdac.spark.question.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepository extends JpaRepository<Exam, Long> {
}
