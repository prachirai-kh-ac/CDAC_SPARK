package com.cdac.spark.userexam.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResponseDetails {
    private Long responseId;
    private Long questionId;
    private String selectedAnswer;
    private Boolean isCorrect;
    private Integer timeTaken;
}
