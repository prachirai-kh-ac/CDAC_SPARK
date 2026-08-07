package com.cdac.spark.question.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamRequest {
    @NotBlank(message = "examName is required")
    private String examName;
    
    private Long teacherId;
    private String description;
    
    @NotBlank(message = "batchName is required")
    private String batchName;
    
    @NotBlank(message = "examDate is required")
    private String examDate;
    
    @NotBlank(message = "examTime is required")
    private String examTime;
    
    @NotNull(message = "duration is required")
    private Integer duration;
    
    @NotNull(message = "moduleId is required")
    private Long moduleId;
    
    @NotNull(message = "topicIds are required")
    private List<Long> topicIds;
    
    private Map<Long, Integer> topicDistribution;
    
    @NotNull(message = "totalQuestions is required")
    private Integer totalQuestions;
}
