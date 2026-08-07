package com.cdac.spark.question.repository;

import com.cdac.spark.question.entity.TopicBlueprint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TopicBlueprintRepository extends JpaRepository<TopicBlueprint, Long> {
    List<TopicBlueprint> findByExam_ExamId(Long examId);
}
