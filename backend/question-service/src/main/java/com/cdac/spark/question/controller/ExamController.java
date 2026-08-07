package com.cdac.spark.question.controller;

import com.cdac.spark.question.dto.req.*;
import com.cdac.spark.question.dto.res.*;
import com.cdac.spark.question.service.interfaces.ExamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @PostMapping
    public ResponseEntity<ExamResponse> createExam(@Valid @RequestBody ExamRequest request) {
        return ResponseEntity.ok(examService.createExam(request));
    }

    @GetMapping
    public ResponseEntity<List<ExamDetailsResponse>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/{examId}")
    public ResponseEntity<ExamDetailsResponse> getExam(@PathVariable Long examId) {
        return ResponseEntity.ok(examService.getExam(examId));
    }

    @PutMapping("/{examId}")
    public ResponseEntity<MessageResponse> updateExam(@PathVariable Long examId, @Valid @RequestBody ExamRequest request) {
        return ResponseEntity.ok(examService.updateExam(examId, request));
    }

    @PutMapping("/{examId}/status")
    public ResponseEntity<MessageResponse> updateExamStatus(@PathVariable Long examId, @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(examService.updateExamStatus(examId, body.get("status")));
    }

    @DeleteMapping("/{examId}")
    public ResponseEntity<MessageResponse> deleteExam(@PathVariable Long examId) {
        return ResponseEntity.ok(examService.deleteExam(examId));
    }
}
