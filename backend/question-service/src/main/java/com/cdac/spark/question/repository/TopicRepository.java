package com.cdac.spark.question.repository;

import com.cdac.spark.question.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByModule_ModuleId(Long moduleId);
    Long countByModule_ModuleId(Long moduleId);
    Optional<Topic> findByTopicNameIgnoreCaseAndModule_ModuleId(String topicName, Long moduleId);
}
