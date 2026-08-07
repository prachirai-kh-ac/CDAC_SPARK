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
public class TopicRequest {
    @NotNull(message = "moduleId is required")
    private Long moduleId;
    
    @NotBlank(message = "topicName is required")
    private String topicName;
    
    @NotBlank(message = "description is required")
    private String description;
}
