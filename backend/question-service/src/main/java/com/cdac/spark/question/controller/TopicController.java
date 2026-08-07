package com.cdac.spark.question.controller;

import com.cdac.spark.question.dto.req.*;
import com.cdac.spark.question.dto.res.*;
import com.cdac.spark.question.service.interfaces.TopicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
public class TopicController {

    private final TopicService topicService;

    @PostMapping("/topics")
    public ResponseEntity<TopicResponse> createTopic(@Valid @RequestBody TopicRequest request) {
        return ResponseEntity.ok(topicService.createTopic(request));
    }

    @GetMapping("/modules/{moduleId}/topics")
    public ResponseEntity<List<TopicDetailsResponse>> getTopicsOfModule(@PathVariable Long moduleId) {
        return ResponseEntity.ok(topicService.getTopicsOfModule(moduleId));
    }

    @PutMapping("/topics/{topicId}")
    public ResponseEntity<MessageResponse> updateTopic(@PathVariable Long topicId, @Valid @RequestBody TopicUpdateRequest request) {
        return ResponseEntity.ok(topicService.updateTopic(topicId, request));
    }

    @DeleteMapping("/topics/{topicId}")
    public ResponseEntity<MessageResponse> deleteTopic(@PathVariable Long topicId) {
        return ResponseEntity.ok(topicService.deleteTopic(topicId));
    }

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }
}
