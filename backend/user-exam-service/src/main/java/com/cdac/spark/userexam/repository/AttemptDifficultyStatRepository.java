package com.cdac.spark.userexam.repository;

import com.cdac.spark.userexam.entity.AttemptDifficultyStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttemptDifficultyStatRepository extends JpaRepository<AttemptDifficultyStat, Long> {
    List<AttemptDifficultyStat> findByExamAttempt_AttemptId(Long attemptId);
}
