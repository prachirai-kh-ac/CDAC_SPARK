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
@Table(name = "attempt_difficulty_stat")
public class AttemptDifficultyStat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id")
    private ExamAttempt examAttempt;
    
    @Column(name = "difficulty_level")
    private String difficultyLevel;
    
    @Column(name = "questions_attempted")
    private Integer questionsAttempted;
    
    @Column(name = "correct_answers")
    private Integer correctAnswers;
    
    @Column(name = "incorrect_answers")
    private Integer incorrectAnswers;
}
