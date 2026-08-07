package com.cdac.spark.userexam.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StartAdaptiveExamResponse {
    private String message;
    private Long attemptId;
    private Integer currentDifficultyLevel;
    private Integer totalQuestions;
}
