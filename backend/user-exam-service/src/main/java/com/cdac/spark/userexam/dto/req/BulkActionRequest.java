package com.cdac.spark.userexam.dto.req;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BulkActionRequest {
    private List<Long> studentIds;
    private List<Long> teacherIds;
    private String reason;
}
