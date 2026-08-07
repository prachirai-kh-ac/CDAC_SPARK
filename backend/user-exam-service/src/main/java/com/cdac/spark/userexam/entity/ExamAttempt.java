package com.cdac.spark.userexam.entity;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "exam_attempt")
public class ExamAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attempt_id")
    private Long attemptId;
    
    @Column(name = "exam_id")
    private Long examId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User user;
    
    @Column(name = "exam_type")
    private String examType = "PRACTICE";
    
    private String status; // IN_PROGRESS, COMPLETED
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "current_difficulty_level")
    private Integer currentDifficultyLevel;
    
    @Column(name = "total_questions")
    private Integer totalQuestions;

    @OneToMany(mappedBy = "examAttempt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<AttemptResponse> responses;

    @OneToMany(mappedBy = "examAttempt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<AttemptTopicProgress> topicProgresses;

    @OneToMany(mappedBy = "examAttempt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<AttemptDifficultyStat> difficultyStats;

    @OneToMany(mappedBy = "examAttempt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<ExamViolation> violations;

    @Column(name = "ability_score")
    private Integer abilityScore = 500;
    
    @Column(name = "weighted_score")
    private Integer weightedScore = 0;
    
    @Column(name = "accuracy")
    private Double accuracy = 0.0;
    
    @Column(name = "percentage")
    private Double percentage = 0.0;
    
    @Column(name = "time_taken_seconds")
    private Long timeTakenSeconds = 0L;

    @Column(name = "easy_correct")
    private Integer easyCorrect = 0;
    
    @Column(name = "medium_correct")
    private Integer mediumCorrect = 0;
    
    @Column(name = "hard_correct")
    private Integer hardCorrect = 0;

    @Column(name = "easy_wrong")
    private Integer easyWrong = 0;
    
    @Column(name = "medium_wrong")
    private Integer mediumWrong = 0;
    
    @Column(name = "hard_wrong")
    private Integer hardWrong = 0;

    @Column(name = "easy_skipped")
    private Integer easySkipped = 0;
    
    @Column(name = "medium_skipped")
    private Integer mediumSkipped = 0;
    
    @Column(name = "hard_skipped")
    private Integer hardSkipped = 0;
}
