package com.cdac.spark.userexam.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttemptDetailsResponse {
    private Long attemptId;
    private Long examId;
    private Long studentId;
    private String status;
    private LocalDateTime startTime;
}
