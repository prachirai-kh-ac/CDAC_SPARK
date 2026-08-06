package com.cdac.spark.userexam;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class UserExamServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserExamServiceApplication.class, args);
    }
}
