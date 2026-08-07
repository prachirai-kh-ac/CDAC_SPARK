package com.cdac.spark.question.service.impl;

import com.cdac.spark.question.dto.req.BlueprintRequest;
import com.cdac.spark.question.dto.req.BlueprintUpdateRequest;
import com.cdac.spark.question.dto.res.BlueprintDetailsResponse;
import com.cdac.spark.question.dto.res.BlueprintResponse;
import com.cdac.spark.question.dto.res.MessageResponse;
import com.cdac.spark.question.entity.Exam;
import com.cdac.spark.question.entity.Topic;
import com.cdac.spark.question.entity.TopicBlueprint;
import com.cdac.spark.question.exception.ResourceNotFoundException;
import com.cdac.spark.question.repository.ExamRepository;
import com.cdac.spark.question.repository.TopicBlueprintRepository;
import com.cdac.spark.question.repository.TopicRepository;
import com.cdac.spark.question.service.interfaces.TopicBlueprintService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TopicBlueprintServiceImpl implements TopicBlueprintService {

    private final TopicBlueprintRepository blueprintRepository;
    private final ExamRepository examRepository;
    private final TopicRepository topicRepository;

    @Override
    public BlueprintResponse createBlueprint(BlueprintRequest request) {
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        TopicBlueprint tb = new TopicBlueprint();
        tb.setExam(exam);
        tb.setTopic(topic);
        tb.setQuestionCount(request.getQuestionCount());
        tb = blueprintRepository.save(tb);

        BlueprintResponse res = new BlueprintResponse();
        res.setMessage("Topic blueprint created successfully.");
        res.setBlueprintId(tb.getBlueprintId());
        return res;
    }

    @Override
    public List<BlueprintDetailsResponse> getBlueprint(Long examId) {
        return blueprintRepository.findByExam_ExamId(examId).stream().map(tb -> {
            BlueprintDetailsResponse res = new BlueprintDetailsResponse();
            res.setBlueprintId(tb.getBlueprintId());
            res.setTopicId(tb.getTopic().getTopicId());
            res.setTopicName(tb.getTopic().getTopicName());
            res.setQuestionCount(tb.getQuestionCount());
            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public MessageResponse updateBlueprint(Long id, BlueprintUpdateRequest request) {
        TopicBlueprint tb = blueprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blueprint not found"));
        tb.setQuestionCount(request.getQuestionCount());
        blueprintRepository.save(tb);
        return new MessageResponse("Topic blueprint updated successfully.");
    }

    @Override
    public MessageResponse deleteBlueprint(Long id) {
        blueprintRepository.deleteById(id);
        return new MessageResponse("Topic blueprint deleted successfully.");
    }

    public TopicBlueprintServiceImpl(TopicBlueprintRepository blueprintRepository, ExamRepository examRepository, TopicRepository topicRepository) {
        this.blueprintRepository = blueprintRepository;
        this.examRepository = examRepository;
        this.topicRepository = topicRepository;
    }
}
