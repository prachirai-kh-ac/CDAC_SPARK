package com.cdac.spark.userexam.dto.req;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ViolationRequest {
    private Long attemptId;
    private String type;
    private String details;
}
