package com.cdac.spark.userexam.service.interfaces;

import com.cdac.spark.userexam.dto.res.TopicProgressResponse;

import java.util.List;

public interface TopicProgressService {
    List<TopicProgressResponse> getTopicProgress(Long attemptId);
}
