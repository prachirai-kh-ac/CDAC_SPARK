package com.cdac.spark.question.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ModuleDetailsResponse {
    private Long moduleId;
    private String moduleName;
    private String moduleCode;
    private String description;
    private Long topicCount;
}
