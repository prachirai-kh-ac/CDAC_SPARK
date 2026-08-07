package com.cdac.spark.userexam.repository;

import com.cdac.spark.userexam.entity.AttemptResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttemptResponseRepository extends JpaRepository<AttemptResponse, Long> {
    List<AttemptResponse> findByExamAttempt_AttemptId(Long attemptId);
    List<AttemptResponse> findByExamAttempt(com.cdac.spark.userexam.entity.ExamAttempt attempt);
}
