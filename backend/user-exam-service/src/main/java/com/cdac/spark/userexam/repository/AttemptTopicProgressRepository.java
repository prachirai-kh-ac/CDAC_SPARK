package com.cdac.spark.userexam.repository;

import com.cdac.spark.userexam.entity.AttemptTopicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttemptTopicProgressRepository extends JpaRepository<AttemptTopicProgress, Long> {
    List<AttemptTopicProgress> findByExamAttempt_AttemptId(Long attemptId);
}
