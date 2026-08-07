package com.cdac.spark.userexam.repository;

import com.cdac.spark.userexam.entity.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    List<ExamAttempt> findByUser_UserId(Long userId);
    List<ExamAttempt> findByExamId(Long examId);
}
