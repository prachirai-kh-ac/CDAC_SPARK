package com.cdac.spark.question.dto.req;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionSearchRequest {
    private Long moduleId;
    
    @NotNull(message = "topicId is required")
    private Long topicId;
    
    private Long difficultyLevelId;
}
