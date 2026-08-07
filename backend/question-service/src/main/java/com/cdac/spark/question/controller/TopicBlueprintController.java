package com.cdac.spark.question.controller;

import com.cdac.spark.question.dto.req.*;
import com.cdac.spark.question.dto.res.*;
import com.cdac.spark.question.service.interfaces.TopicBlueprintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
public class TopicBlueprintController {

    private final TopicBlueprintService blueprintService;

    @PostMapping("/blueprint")
    public ResponseEntity<BlueprintResponse> createBlueprint(@Valid @RequestBody BlueprintRequest request) {
        return ResponseEntity.ok(blueprintService.createBlueprint(request));
    }

    @GetMapping("/exams/{examId}/blueprint")
    public ResponseEntity<List<BlueprintDetailsResponse>> getBlueprint(@PathVariable Long examId) {
        return ResponseEntity.ok(blueprintService.getBlueprint(examId));
    }

    @PutMapping("/blueprint/{id}")
    public ResponseEntity<MessageResponse> updateBlueprint(@PathVariable Long id, @Valid @RequestBody BlueprintUpdateRequest request) {
        return ResponseEntity.ok(blueprintService.updateBlueprint(id, request));
    }

    @DeleteMapping("/blueprint/{id}")
    public ResponseEntity<MessageResponse> deleteBlueprint(@PathVariable Long id) {
        return ResponseEntity.ok(blueprintService.deleteBlueprint(id));
    }

    public TopicBlueprintController(TopicBlueprintService blueprintService) {
        this.blueprintService = blueprintService;
    }
}
