package com.cdac.spark.userexam.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmitExamResponse {
    private String message;
    private List<AttemptResponseDto> responses;
    private Long attemptId;
    private String status;
    private LocalDateTime submittedAt;
    private Integer abilityScore;
    private Integer weightedScore;
    private Double accuracy;
    private Double percentage;
    private Long timeTakenSeconds;
    private Integer easyCorrect;
    private Integer mediumCorrect;
    private Integer hardCorrect;
}
