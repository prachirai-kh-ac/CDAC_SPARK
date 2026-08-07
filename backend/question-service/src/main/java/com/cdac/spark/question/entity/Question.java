package com.cdac.spark.question.entity;

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
@Table(name = "question")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long questionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "difficulty_level_id")
    private DifficultyLevel difficultyLevel;
    
    @Column(name = "question_text")
    private String questionText;
    
    @Column(name = "option_a")
    private String optionA;
    
    @Column(name = "option_b")
    private String optionB;
    
    @Column(name = "option_c")
    private String optionC;
    
    @Column(name = "option_d")
    private String optionD;
    
    @Column(name = "correct_answer")
    private String correctAnswer;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;
}
