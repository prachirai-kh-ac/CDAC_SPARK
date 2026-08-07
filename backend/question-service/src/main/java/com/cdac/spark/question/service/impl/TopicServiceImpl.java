package com.cdac.spark.question.service.impl;

import com.cdac.spark.question.dto.req.TopicRequest;
import com.cdac.spark.question.dto.req.TopicUpdateRequest;
import com.cdac.spark.question.dto.res.MessageResponse;
import com.cdac.spark.question.dto.res.TopicDetailsResponse;
import com.cdac.spark.question.dto.res.TopicResponse;
import com.cdac.spark.question.entity.Module;
import com.cdac.spark.question.entity.Topic;
import com.cdac.spark.question.exception.ResourceNotFoundException;
import com.cdac.spark.question.repository.ModuleRepository;
import com.cdac.spark.question.repository.QuestionRepository;
import com.cdac.spark.question.repository.TopicRepository;
import com.cdac.spark.question.service.interfaces.TopicService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;
    private final ModuleRepository moduleRepository;
    private final QuestionRepository questionRepository;

    @Override
    public TopicResponse createTopic(TopicRequest request) {
        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        Topic topic = new Topic();
        topic.setModule(module);
        topic.setTopicName(request.getTopicName());
        topic.setDescription(request.getDescription());
        topic = topicRepository.save(topic);

        TopicResponse res = new TopicResponse();
        res.setMessage("Topic created successfully.");
        res.setTopicId(topic.getTopicId());
        return res;
    }

    @Override
    public List<TopicDetailsResponse> getTopicsOfModule(Long moduleId) {
        return topicRepository.findByModule_ModuleId(moduleId).stream().map(t -> {
            TopicDetailsResponse res = new TopicDetailsResponse();
            res.setTopicId(t.getTopicId());
            res.setTopicName(t.getTopicName());
            res.setQuestionCount(questionRepository.countByTopic_TopicId(t.getTopicId()));
            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public MessageResponse updateTopic(Long topicId, TopicUpdateRequest request) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
        topic.setTopicName(request.getTopicName());
        topic.setDescription(request.getDescription());
        topicRepository.save(topic);
        return new MessageResponse("Topic updated successfully.");
    }

    @Override
    public MessageResponse deleteTopic(Long topicId) {
        topicRepository.deleteById(topicId);
        return new MessageResponse("Topic deleted successfully.");
    }

    public TopicServiceImpl(TopicRepository topicRepository, ModuleRepository moduleRepository, QuestionRepository questionRepository) {
        this.topicRepository = topicRepository;
        this.moduleRepository = moduleRepository;
        this.questionRepository = questionRepository;
    }
}
