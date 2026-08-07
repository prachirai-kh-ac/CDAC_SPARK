package com.cdac.spark.userexam.controller;

import com.cdac.spark.userexam.dto.req.*;
import com.cdac.spark.userexam.dto.res.*;
import com.cdac.spark.userexam.service.interfaces.AdaptiveExamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exams/{examId}/adaptive")
public class AdaptiveExamController {

    private final AdaptiveExamService adaptiveExamService;

    @PostMapping("/start")
    public ResponseEntity<StartAdaptiveExamResponse> startAdaptive(@PathVariable Long examId, @RequestBody StartExamRequest request) {
        return ResponseEntity.ok(adaptiveExamService.startAdaptive(examId, request));
    }

    @GetMapping("/next-question")
    public ResponseEntity<NextQuestionResponse> getNextQuestion(@PathVariable Long examId, @RequestParam Long attemptId) {
        return ResponseEntity.ok(adaptiveExamService.getNextQuestion(examId, attemptId));
    }

    @PostMapping("/answer")
    public ResponseEntity<AdaptiveAnswerResponse> answerAdaptive(@PathVariable Long examId, @RequestBody AdaptiveAnswerRequest request) {
        return ResponseEntity.ok(adaptiveExamService.answerAdaptive(examId, request));
    }

    @PostMapping("/finish")
    public ResponseEntity<SubmitExamResponse> finishAdaptive(@PathVariable Long examId, @RequestBody SubmitExamRequest request) {
        return ResponseEntity.ok(adaptiveExamService.finishAdaptive(examId, request));
    }

    public AdaptiveExamController(AdaptiveExamService adaptiveExamService) {
        this.adaptiveExamService = adaptiveExamService;
    }
}
