package com.cdac.spark.userexam.dto.req;

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
public class SaveResponseRequest {
    @NotNull(message = "attemptId is required")
    private Long attemptId;
    
    @NotNull(message = "questionId is required")
    private Long questionId;
    
    @NotBlank(message = "selectedAnswer is required")
    private String selectedAnswer;
    
    @NotNull(message = "timeTaken is required")
    private Integer timeTaken;
}
