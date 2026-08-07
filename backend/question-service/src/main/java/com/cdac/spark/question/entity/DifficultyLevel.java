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
@Table(name = "difficulty_level")
public class DifficultyLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "difficulty_level_id")
    private Long difficultyLevelId;
    
    @Column(name = "level_name")
    private String levelName;
    
    private String description;
    
    private Integer weightage;

    @OneToMany(mappedBy = "difficultyLevel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<Question> questions;
}
