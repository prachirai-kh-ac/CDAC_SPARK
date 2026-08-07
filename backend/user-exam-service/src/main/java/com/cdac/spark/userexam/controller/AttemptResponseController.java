package com.cdac.spark.userexam.controller;

import com.cdac.spark.userexam.dto.req.*;
import com.cdac.spark.userexam.dto.res.*;
import com.cdac.spark.userexam.service.interfaces.AttemptResponseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attempt-response")
public class AttemptResponseController {

    private final AttemptResponseService attemptResponseService;

    public AttemptResponseController(AttemptResponseService attemptResponseService) {
        this.attemptResponseService = attemptResponseService;
    }

    @PostMapping
    public ResponseEntity<SaveResponseResult> saveResponse(@RequestBody SaveResponseRequest request) {
        return ResponseEntity.ok(attemptResponseService.saveResponse(request));
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<List<AttemptResponseDetails>> getResponses(@PathVariable Long attemptId) {
        return ResponseEntity.ok(attemptResponseService.getResponses(attemptId));
    }
}
