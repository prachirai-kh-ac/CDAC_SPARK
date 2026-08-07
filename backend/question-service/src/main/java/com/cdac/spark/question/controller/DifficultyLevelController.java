package com.cdac.spark.question.controller;

import com.cdac.spark.question.entity.DifficultyLevel;
import com.cdac.spark.question.service.interfaces.DifficultyLevelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/difficulty-levels")
public class DifficultyLevelController {

    private final DifficultyLevelService difficultyLevelService;

    @GetMapping
    public ResponseEntity<List<DifficultyLevel>> getDifficultyLevels() {
        return ResponseEntity.ok(difficultyLevelService.getAllDifficultyLevels());
    }

    public DifficultyLevelController(DifficultyLevelService difficultyLevelService) {
        this.difficultyLevelService = difficultyLevelService;
    }
}
