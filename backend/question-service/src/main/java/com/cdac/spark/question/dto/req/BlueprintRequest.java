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
public class BlueprintRequest {
    @NotNull(message = "examId is required")
    private Long examId;
    
    @NotNull(message = "topicId is required")
    private Long topicId;
    
    @NotNull(message = "questionCount is required")
    private Integer questionCount;
}
