package com.cdac.spark.userexam.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TopicProgressResponse {
    private Long topicId;
    private String topicName;
    private Integer questionsAssigned;
    private Integer questionsAttempted;
    private Integer questionsRemaining;
}
