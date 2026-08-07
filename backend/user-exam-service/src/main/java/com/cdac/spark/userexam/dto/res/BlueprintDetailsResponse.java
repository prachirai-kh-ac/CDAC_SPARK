package com.cdac.spark.userexam.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlueprintDetailsResponse {
    private Long blueprintId;
    private Long topicId;
    private String topicName;
    private Integer questionCount;
    private Integer weightage;
}
