package com.cdac.spark.question.repository;

import com.cdac.spark.question.entity.DifficultyLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DifficultyLevelRepository extends JpaRepository<DifficultyLevel, Long> {
    Optional<DifficultyLevel> findByLevelNameIgnoreCase(String levelName);
}
