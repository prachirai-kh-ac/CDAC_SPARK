package com.cdac.spark.userexam.dto.res;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String message;
    private String token;
    private String role;
    private String userId;
    private String fullName;
    private String email;
    private String prn;
    private String batchName;
    private String courseName;
    private String expiresAt;
}
