package com.cdac.spark.userexam.controller;

import com.cdac.spark.userexam.dto.res.DifficultyStatResponse;
import com.cdac.spark.userexam.service.interfaces.DifficultyStatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/difficulty-stat")
public class DifficultyStatController {

    private final DifficultyStatService difficultyStatService;

    public DifficultyStatController(DifficultyStatService difficultyStatService) {
        this.difficultyStatService = difficultyStatService;
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<List<DifficultyStatResponse>> getDifficultyStat(@PathVariable Long attemptId) {
        return ResponseEntity.ok(difficultyStatService.getDifficultyStat(attemptId));
    }
}
