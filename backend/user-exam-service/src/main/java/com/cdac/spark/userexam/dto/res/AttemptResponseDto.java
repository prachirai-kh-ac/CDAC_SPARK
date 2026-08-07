package com.cdac.spark.userexam.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResponseDto {
    private Long questionId;
    private String questionText;
    private String selectedAnswer;
    private String correctAnswer;
    private Boolean isCorrect;
    private String difficulty;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String explanation;
}
