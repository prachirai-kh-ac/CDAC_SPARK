package com.cdac.spark.userexam.controller;

import com.cdac.spark.userexam.dto.res.TopicProgressResponse;
import com.cdac.spark.userexam.service.interfaces.TopicProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topic-progress")
public class TopicProgressController {

    private final TopicProgressService topicProgressService;

    public TopicProgressController(TopicProgressService topicProgressService) {
        this.topicProgressService = topicProgressService;
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<List<TopicProgressResponse>> getTopicProgress(@PathVariable Long attemptId) {
        return ResponseEntity.ok(topicProgressService.getTopicProgress(attemptId));
    }
}
