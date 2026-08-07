package com.cdac.spark.question.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamDetailsResponse {
    private Long id; // We will map examId to this
    private Long teacherId;
    private String title; // examName
    private String description;
    private String batchName;
    private Integer durationMinutes; // duration
    private Integer totalQuestions;
    private String scheduledAt; // computed
    private String status;
    private String moduleName;
    private List<Long> topicIds;
}
