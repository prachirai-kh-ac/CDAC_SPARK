package com.cdac.spark.userexam.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamDetailsResponse {
    private Long id;
    private String title;
    private String description;
    private String batchName;
    private Integer durationMinutes;
    private Integer totalQuestions;
    private String scheduledAt;
    private String status;
    private String moduleName;
    private java.util.List<Long> topicIds;
}
