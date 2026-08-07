package com.cdac.spark.userexam.dto.req;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionSearchRequest {
    private Long moduleId;
    private Long topicId;
    private Long difficultyLevelId;
}
