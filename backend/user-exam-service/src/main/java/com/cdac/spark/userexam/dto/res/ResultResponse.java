package com.cdac.spark.userexam.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResultResponse {
    private Long attemptId;
    private Long studentId;
    private Long examId;
    private Integer abilityScore;
    private Integer weightedScore;
    private Double accuracy;
    private Double percentage;
    private Integer rank;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer incorrectAnswers;
    private String timeTaken;
    private String status;
    private List<ViolationDto> violations;
    private Integer totalViolations;
}
