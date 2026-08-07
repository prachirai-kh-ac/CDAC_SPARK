package com.cdac.spark.question.controller;

import com.cdac.spark.question.dto.req.*;
import com.cdac.spark.question.dto.res.*;
import com.cdac.spark.question.service.interfaces.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    public ResponseEntity<QuestionResponse> addQuestion(@Valid @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionService.addQuestion(request));
    }

    @PostMapping("/upload-csv")
    public ResponseEntity<?> uploadQuestionsCsv(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(questionService.uploadQuestionsCsv(file));
    }

    @GetMapping
    public ResponseEntity<List<QuestionDetailsResponse>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<QuestionDetailsResponse> getQuestion(@PathVariable Long questionId) {
        return ResponseEntity.ok(questionService.getQuestion(questionId));
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<MessageResponse> updateQuestion(@PathVariable Long questionId, @Valid @RequestBody QuestionUpdateRequest request) {
        return ResponseEntity.ok(questionService.updateQuestion(questionId, request));
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<MessageResponse> deleteQuestion(@PathVariable Long questionId) {
        return ResponseEntity.ok(questionService.deleteQuestion(questionId));
    }

    @PostMapping("/search")
    public ResponseEntity<List<QuestionDetailsResponse>> searchQuestions(@Valid @RequestBody QuestionSearchRequest request) {
        return ResponseEntity.ok(questionService.searchQuestions(request));
    }

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }
}
