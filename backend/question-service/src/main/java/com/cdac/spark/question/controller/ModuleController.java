package com.cdac.spark.question.controller;

import com.cdac.spark.question.dto.req.*;
import com.cdac.spark.question.dto.res.*;
import com.cdac.spark.question.service.interfaces.ModuleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/modules")
public class ModuleController {

    private final ModuleService moduleService;

    @PostMapping
    public ResponseEntity<ModuleResponse> createModule(@Valid @RequestBody ModuleRequest request) {
        return ResponseEntity.ok(moduleService.createModule(request));
    }

    @GetMapping
    public ResponseEntity<List<ModuleDetailsResponse>> getAllModules() {
        return ResponseEntity.ok(moduleService.getAllModules());
    }

    @GetMapping("/{moduleId}")
    public ResponseEntity<ModuleDetailsResponse> getModule(@PathVariable Long moduleId) {
        return ResponseEntity.ok(moduleService.getModule(moduleId));
    }

    @PutMapping("/{moduleId}")
    public ResponseEntity<MessageResponse> updateModule(@PathVariable Long moduleId, @Valid @RequestBody ModuleRequest request) {
        return ResponseEntity.ok(moduleService.updateModule(moduleId, request));
    }

    @DeleteMapping("/{moduleId}")
    public ResponseEntity<MessageResponse> deleteModule(@PathVariable Long moduleId) {
        return ResponseEntity.ok(moduleService.deleteModule(moduleId));
    }

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }
}
