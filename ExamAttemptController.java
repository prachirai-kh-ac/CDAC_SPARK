package com.cdac.spark.userexam.controller;

import com.cdac.spark.userexam.dto.req.*;
import com.cdac.spark.userexam.dto.res.*;
import com.cdac.spark.userexam.service.interfaces.ExamAttemptService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exams")
public class ExamAttemptController {

    private final ExamAttemptService examAttemptService;

    public ExamAttemptController(ExamAttemptService examAttemptService) {
        this.examAttemptService = examAttemptService;
    }

    @PostMapping("/{examId}/start")
    public ResponseEntity<StartExamResponse> startExam(@PathVariable Long examId, @RequestBody StartExamRequest request) {
        return ResponseEntity.ok(examAttemptService.startExam(examId, request));
    }

    @GetMapping("/attempt/{attemptId}")
    public ResponseEntity<AttemptDetailsResponse> getAttempt(@PathVariable Long attemptId) {
        return ResponseEntity.ok(examAttemptService.getAttempt(attemptId));
    }

    @PostMapping("/{examId}/submit")
    public ResponseEntity<SubmitExamResponse> submitExam(@PathVariable Long examId, @RequestBody SubmitExamRequest request) {
        return ResponseEntity.ok(examAttemptService.submitExam(examId, request));
    }

    @PostMapping("/violation")
    public ResponseEntity<?> recordViolation(@RequestBody ViolationRequest request) {
        examAttemptService.recordViolation(request);
        return ResponseEntity.ok().build();
    }
}
