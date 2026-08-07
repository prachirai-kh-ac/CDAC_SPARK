package com.cdac.spark.userexam.client;

import com.cdac.spark.userexam.dto.res.QuestionDetailsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "question-service", url = "http://localhost:8081/api")
public interface QuestionServiceClient {

    @GetMapping("/questions/{questionId}")
    QuestionDetailsDto getQuestionById(@PathVariable("questionId") Long questionId);

    @GetMapping("/questions")
    List<QuestionDetailsDto> getAllQuestions();

    @org.springframework.web.bind.annotation.PostMapping("/questions/search")
    List<QuestionDetailsDto> searchQuestions(@org.springframework.web.bind.annotation.RequestBody com.cdac.spark.userexam.dto.req.QuestionSearchRequest request);

    @GetMapping("/exams/{examId}")
    com.cdac.spark.userexam.dto.res.ExamDetailsResponse getExamById(@PathVariable("examId") Long examId);

    @GetMapping("/exams/{examId}/blueprint")
    List<com.cdac.spark.userexam.dto.res.BlueprintDetailsResponse> getBlueprint(@PathVariable("examId") Long examId);

    @GetMapping("/exams")
    List<com.cdac.spark.userexam.dto.res.ExamDetailsResponse> getAllExams();
}
