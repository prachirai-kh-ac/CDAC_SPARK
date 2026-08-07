package com.cdac.spark.userexam.dto.req;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmitExamRequest {
    @NotNull(message = "attemptId is required")
    private Long attemptId;
}
