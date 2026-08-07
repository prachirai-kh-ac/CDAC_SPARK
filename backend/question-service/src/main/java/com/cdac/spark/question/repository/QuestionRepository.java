package com.cdac.spark.question.repository;

import com.cdac.spark.question.entity.Question;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long>, JpaSpecificationExecutor<Question> {

    Long countByTopic_TopicId(Long topicId);

    @Query(value = "SELECT * FROM question WHERE topic_id IN (:topicIds) ORDER BY RAND()", nativeQuery = true)
    List<Question> findRandomQuestionsByTopics(@Param("topicIds") List<Long> topicIds, Pageable pageable);

    @Query(value = "SELECT * FROM question WHERE topic_id = :topicId ORDER BY RAND()", nativeQuery = true)
    List<Question> findRandomQuestionsByTopic(@Param("topicId") Long topicId, Pageable pageable);

    default List<Question> findRandomQuestionsByTopics(List<Long> topicIds, int limit) {
        return findRandomQuestionsByTopics(topicIds, PageRequest.of(0, limit));
    }

    default List<Question> findRandomQuestionsByTopic(Long topicId, int limit) {
        return findRandomQuestionsByTopic(topicId, PageRequest.of(0, limit));
    }
}