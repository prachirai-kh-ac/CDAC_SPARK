package com.cdac.spark.question.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionRequest {
    @NotNull(message = "moduleId is required")
    private Long moduleId;
    
    @NotNull(message = "topicId is required")
    private Long topicId;
    
    @NotNull(message = "difficultyLevelId is required")
    private Long difficultyLevelId;
    
    @NotBlank(message = "questionText is required")
    private String questionText;
    
    @NotBlank(message = "optionA is required")
    private String optionA;
    
    @NotBlank(message = "optionB is required")
    private String optionB;
    
    @NotBlank(message = "optionC is required")
    private String optionC;
    
    @NotBlank(message = "optionD is required")
    private String optionD;
    
    @NotBlank(message = "correctAnswer is required")
    private String correctAnswer;
}
