package com.cdac.spark.userexam.entity;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attempt_topic_progress")
public class AttemptTopicProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id")
    private ExamAttempt examAttempt;
    
    @Column(name = "topic_id")
    private Long topicId;
    
    @Column(name = "topic_name")
    private String topicName;
    
    @Column(name = "questions_assigned")
    private Integer questionsAssigned;
    
    @Column(name = "questions_attempted")
    private Integer questionsAttempted;
    
    @Column(name = "questions_remaining")
    private Integer questionsRemaining;
}
