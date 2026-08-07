package com.cdac.spark.question.entity;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "exam")
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exam_id")
    private Long examId;
    
    @Column(name = "exam_name")
    private String examName;
    
    private String description;
    
    private Integer duration;
    
    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "batch_name")
    private String batchName;

    @Column(name = "exam_date")
    private LocalDate examDate;

    @Column(name = "exam_time")
    private LocalTime examTime;

    @Column(name = "teacher_id")
    private Long teacherId;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    private String status;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "exam_module",
        joinColumns = @JoinColumn(name = "exam_id"),
        inverseJoinColumns = @JoinColumn(name = "module_id")
    )
    private java.util.Set<Module> modules;

    @ElementCollection
    @CollectionTable(name = "exam_topic", joinColumns = @JoinColumn(name = "exam_id"))
    @Column(name = "topic_id")
    private java.util.Set<Long> topicIds;

    @ManyToMany
    @JoinTable(
        name = "exam_question",
        joinColumns = @JoinColumn(name = "exam_id"),
        inverseJoinColumns = @JoinColumn(name = "question_id")
    )
    private java.util.Set<Question> questions;
}
