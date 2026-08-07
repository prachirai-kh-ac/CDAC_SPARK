package com.cdac.spark.userexam.service.impl;

import com.cdac.spark.userexam.client.QuestionServiceClient;
import com.cdac.spark.userexam.dto.req.SaveResponseRequest;
import com.cdac.spark.userexam.dto.res.AttemptResponseDetails;
import com.cdac.spark.userexam.dto.res.QuestionDetailsDto;
import com.cdac.spark.userexam.dto.res.SaveResponseResult;
import com.cdac.spark.userexam.entity.AttemptResponse;
import com.cdac.spark.userexam.entity.ExamAttempt;
import com.cdac.spark.userexam.repository.AttemptResponseRepository;
import com.cdac.spark.userexam.service.interfaces.AttemptResponseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttemptResponseServiceImpl implements AttemptResponseService {

    private final AttemptResponseRepository attemptResponseRepository;
    private final QuestionServiceClient questionServiceClient;

    public AttemptResponseServiceImpl(AttemptResponseRepository attemptResponseRepository, QuestionServiceClient questionServiceClient) {
        this.attemptResponseRepository = attemptResponseRepository;
        this.questionServiceClient = questionServiceClient;
    }

    @Override
    public SaveResponseResult saveResponse(SaveResponseRequest request) {
        AttemptResponse ar = new AttemptResponse();
        ExamAttempt attempt = new ExamAttempt();
        attempt.setAttemptId(request.getAttemptId());
        ar.setExamAttempt(attempt);
        ar.setQuestionId(request.getQuestionId());
        ar.setSelectedAnswer(request.getSelectedAnswer());
        ar.setTimeTaken(request.getTimeTaken());
        
        QuestionDetailsDto q = questionServiceClient.getQuestionById(request.getQuestionId());
        ar.setIsCorrect(q.getCorrectAnswer().equalsIgnoreCase(request.getSelectedAnswer())); 
        
        ar = attemptResponseRepository.save(ar);

        SaveResponseResult res = new SaveResponseResult();
        res.setMessage("Response saved successfully.");
        res.setResponseId(ar.getResponseId());
        return res;
    }

    @Override
    public List<AttemptResponseDetails> getResponses(Long attemptId) {
        return attemptResponseRepository.findByExamAttempt_AttemptId(attemptId).stream().map(ar -> {
            AttemptResponseDetails res = new AttemptResponseDetails();
            res.setResponseId(ar.getResponseId());
            res.setQuestionId(ar.getQuestionId());
            res.setSelectedAnswer(ar.getSelectedAnswer());
            res.setIsCorrect(ar.getIsCorrect());
            res.setTimeTaken(ar.getTimeTaken());
            return res;
        }).collect(Collectors.toList());
    }
}
