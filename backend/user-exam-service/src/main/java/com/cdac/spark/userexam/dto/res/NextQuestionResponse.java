package com.cdac.spark.userexam.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NextQuestionResponse {
    private Long questionId;
    private Long topicId;
    private Integer difficultyLevel;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
}
