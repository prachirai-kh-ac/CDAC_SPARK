package com.cdac.spark.question.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TopicDetailsResponse {
    private Long topicId;
    private String topicName;
    private Long questionCount;
}
