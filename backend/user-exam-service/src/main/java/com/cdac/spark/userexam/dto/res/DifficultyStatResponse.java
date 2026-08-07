package com.cdac.spark.userexam.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DifficultyStatResponse {
    private String difficultyLevel;
    private Integer questionsAttempted;
    private Integer correctAnswers;
    private Integer incorrectAnswers;
}
