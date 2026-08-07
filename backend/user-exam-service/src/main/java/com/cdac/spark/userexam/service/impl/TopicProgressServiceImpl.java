package com.cdac.spark.userexam.service.impl;

import com.cdac.spark.userexam.dto.res.TopicProgressResponse;
import com.cdac.spark.userexam.repository.AttemptTopicProgressRepository;
import com.cdac.spark.userexam.service.interfaces.TopicProgressService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TopicProgressServiceImpl implements TopicProgressService {

    private final AttemptTopicProgressRepository progressRepository;

    public TopicProgressServiceImpl(AttemptTopicProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    @Override
    public List<TopicProgressResponse> getTopicProgress(Long attemptId) {
        return progressRepository.findByExamAttempt_AttemptId(attemptId).stream().map(p -> {
            TopicProgressResponse res = new TopicProgressResponse();
            res.setTopicId(p.getTopicId());
            res.setTopicName(p.getTopicName());
            res.setQuestionsAssigned(p.getQuestionsAssigned());
            res.setQuestionsAttempted(p.getQuestionsAttempted());
            res.setQuestionsRemaining(p.getQuestionsRemaining());
            return res;
        }).collect(Collectors.toList());
    }
}
