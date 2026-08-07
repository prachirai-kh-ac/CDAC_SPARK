package com.cdac.spark.userexam.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeacherCreateRequest {
    @NotBlank(message = "fullName is required")
    private String fullName;
    
    @NotBlank(message = "email is required")
    private String email;
    
    @NotBlank(message = "password is required")
    private String password;
    
    private String phoneNumber;
}
