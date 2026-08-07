package com.cdac.spark.question.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ModuleRequest {
    @NotBlank(message = "moduleName is required")
    private String moduleName;
    
    @NotBlank(message = "moduleCode is required")
    private String moduleCode;
    
    @NotBlank(message = "description is required")
    private String description;
}
