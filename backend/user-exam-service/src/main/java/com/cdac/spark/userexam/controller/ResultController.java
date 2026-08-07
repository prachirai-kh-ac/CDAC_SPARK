package com.cdac.spark.userexam.controller;

import com.cdac.spark.userexam.dto.res.ResultResponse;
import com.cdac.spark.userexam.service.interfaces.ResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/result")
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<ResultResponse> getResult(@PathVariable Long attemptId) {
        return ResponseEntity.ok(resultService.getResult(attemptId));
    }

    @GetMapping("/teacher/exams/{examId}/results")
    public ResponseEntity<java.util.Map<String, Object>> getExamResults(@PathVariable Long examId) {
        return ResponseEntity.ok(java.util.Map.of("success", true, "data", resultService.getExamResults(examId)));
    }

    @GetMapping("/student/{studentId}/results")
    public ResponseEntity<java.util.Map<String, Object>> getStudentResults(@PathVariable Long studentId) {
        return ResponseEntity.ok(java.util.Map.of("success", true, "data", resultService.getStudentResults(studentId)));
    }

    @GetMapping("/student/{studentId}/dashboard")
    public ResponseEntity<java.util.Map<String, Object>> getStudentDashboard(@PathVariable Long studentId) {
        return ResponseEntity.ok(java.util.Map.of("success", true, "data", resultService.getStudentDashboard(studentId)));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<java.util.Map<String, Object>> getGlobalLeaderboard(@RequestParam(required = false) String batchName) {
        return ResponseEntity.ok(java.util.Map.of("success", true, "data", resultService.getGlobalLeaderboard(batchName)));
    }

    @GetMapping("/teacher/exams/{examId}/analytics")
    public ResponseEntity<java.util.Map<String, Object>> getExamAnalytics(@PathVariable Long examId) {
        return ResponseEntity.ok(resultService.getExamAnalytics(examId));
    }
}
