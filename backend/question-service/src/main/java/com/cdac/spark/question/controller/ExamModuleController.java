package com.cdac.spark.question.controller;

import com.cdac.spark.question.dto.req.*;
import com.cdac.spark.question.dto.res.*;
import com.cdac.spark.question.service.interfaces.ExamModuleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/exams/{examId}/modules")
public class ExamModuleController {

    private final ExamModuleService examModuleService;

    @PostMapping
    public ResponseEntity<MessageResponse> assignModule(@PathVariable Long examId, @Valid @RequestBody AssignModuleRequest request) {
        return ResponseEntity.ok(examModuleService.assignModule(examId, request));
    }

    @GetMapping
    public ResponseEntity<List<ExamModuleResponse>> getExamModules(@PathVariable Long examId) {
        return ResponseEntity.ok(examModuleService.getExamModules(examId));
    }

    @DeleteMapping("/{moduleId}")
    public ResponseEntity<MessageResponse> removeModule(@PathVariable Long examId, @PathVariable Long moduleId) {
        return ResponseEntity.ok(examModuleService.removeModule(examId, moduleId));
    }

    public ExamModuleController(ExamModuleService examModuleService) {
        this.examModuleService = examModuleService;
    }
}
