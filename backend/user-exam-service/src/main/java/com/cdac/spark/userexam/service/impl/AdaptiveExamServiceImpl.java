package com.cdac.spark.userexam.service.impl;

import com.cdac.spark.userexam.client.QuestionServiceClient;
import com.cdac.spark.userexam.dto.req.AdaptiveAnswerRequest;
import com.cdac.spark.userexam.dto.req.StartExamRequest;
import com.cdac.spark.userexam.dto.req.SubmitExamRequest;
import com.cdac.spark.userexam.dto.res.*;
import com.cdac.spark.userexam.entity.ExamAttempt;
import com.cdac.spark.userexam.entity.User;
import com.cdac.spark.userexam.exception.ResourceNotFoundException;
import com.cdac.spark.userexam.repository.ExamAttemptRepository;
import com.cdac.spark.userexam.repository.UserRepository;
import com.cdac.spark.userexam.service.interfaces.AdaptiveExamService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdaptiveExamServiceImpl implements AdaptiveExamService {

    private final ExamAttemptRepository examAttemptRepository;
    private final UserRepository userRepository;
    private final QuestionServiceClient questionServiceClient;
    private final com.cdac.spark.userexam.repository.AttemptResponseRepository attemptResponseRepository;
    private final com.cdac.spark.userexam.service.interfaces.AdaptiveQuestionSelector adaptiveQuestionSelector;
    private final com.cdac.spark.userexam.service.interfaces.ResultCalculationService resultCalculationService;

    @Override
    public StartAdaptiveExamResponse startAdaptive(Long examId, StartExamRequest request) {
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        String eType = request.getExamType() != null ? request.getExamType() : "PRACTICE";
        
        if ("LIVE".equalsIgnoreCase(eType)) {
            java.util.List<ExamAttempt> existingAttempts = examAttemptRepository.findByUser_UserId(student.getUserId());
            boolean alreadyCompleted = existingAttempts.stream().anyMatch(a -> a.getExamId().equals(examId) && "LIVE".equalsIgnoreCase(a.getExamType()) && "COMPLETED".equals(a.getStatus()));
            if (alreadyCompleted) {
                throw new IllegalStateException("You have already completed this exam.");
            }
            
            ExamAttempt inProgress = existingAttempts.stream().filter(a -> a.getExamId().equals(examId) && "LIVE".equalsIgnoreCase(a.getExamType()) && "IN_PROGRESS".equals(a.getStatus())).findFirst().orElse(null);
            if (inProgress != null) {
                StartAdaptiveExamResponse res = new StartAdaptiveExamResponse();
                res.setAttemptId(inProgress.getAttemptId());
                res.setMessage("Resuming existing attempt.");
                res.setCurrentDifficultyLevel(inProgress.getCurrentDifficultyLevel());
                res.setTotalQuestions(inProgress.getTotalQuestions());
                return res;
            }
        }

        ExamAttempt attempt = new ExamAttempt();
        attempt.setExamId(examId);
        attempt.setUser(student);
        attempt.setStatus("IN_PROGRESS");
        attempt.setCurrentDifficultyLevel(2); // 1=EASY, 2=MEDIUM, 3=HARD
        attempt.setStartTime(LocalDateTime.now());
        
        attempt.setExamType(eType);
        
        if ("LIVE".equalsIgnoreCase(eType)) {
            com.cdac.spark.userexam.dto.res.ExamDetailsResponse examDetails = questionServiceClient.getExamById(examId);
            attempt.setTotalQuestions(examDetails.getTotalQuestions() != null ? examDetails.getTotalQuestions() : 20);
        } else {
            attempt.setTotalQuestions(40); // default for practice
        }
        
        attempt = examAttemptRepository.save(attempt);

        StartAdaptiveExamResponse res = new StartAdaptiveExamResponse();
        res.setMessage("Adaptive assessment started successfully.");
        res.setAttemptId(attempt.getAttemptId());
        res.setCurrentDifficultyLevel(attempt.getCurrentDifficultyLevel());
        res.setTotalQuestions(attempt.getTotalQuestions());
        return res;
    }

    @Override
    public NextQuestionResponse getNextQuestion(Long examId, Long attemptId) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("No active attempt found for this exam"));

        QuestionDetailsDto q = adaptiveQuestionSelector.getNextQuestion(attempt);
        if (q == null) {
            throw new ResourceNotFoundException("No more questions available for this exam");
        }
        
        NextQuestionResponse res = new NextQuestionResponse();
        res.setQuestionId(q.getQuestionId());
        res.setTopicId(attempt.getExamId()); 
        res.setDifficultyLevel(attempt.getCurrentDifficultyLevel());
        res.setQuestionText(q.getQuestionText());
        res.setOptionA(q.getOptionA());
        res.setOptionB(q.getOptionB());
        res.setOptionC(q.getOptionC());
        res.setOptionD(q.getOptionD());
        return res;
    }

    @Override
    public AdaptiveAnswerResponse answerAdaptive(Long examId, AdaptiveAnswerRequest request) {
        ExamAttempt attempt = examAttemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        QuestionDetailsDto q = questionServiceClient.getQuestionById(request.getQuestionId());
        
        int questionDifficulty = attempt.getCurrentDifficultyLevel();
        if ("EASY".equalsIgnoreCase(q.getDifficulty())) questionDifficulty = 1;
        else if ("MEDIUM".equalsIgnoreCase(q.getDifficulty())) questionDifficulty = 2;
        else if ("HARD".equalsIgnoreCase(q.getDifficulty())) questionDifficulty = 3;

        boolean skipped = "SKIP".equalsIgnoreCase(request.getSelectedAnswer());
        boolean isCorrect = false;
        
        if (!skipped) {
            isCorrect = request.getSelectedAnswer().equalsIgnoreCase(q.getCorrectAnswer());
        }

        // Save Response
        com.cdac.spark.userexam.entity.AttemptResponse attemptResponse = new com.cdac.spark.userexam.entity.AttemptResponse();
        attemptResponse.setExamAttempt(attempt);
        attemptResponse.setQuestionId(request.getQuestionId());
        attemptResponse.setSelectedAnswer(request.getSelectedAnswer());
        attemptResponse.setIsCorrect(isCorrect);
        attemptResponse.setTimeTaken(request.getTimeTaken());
        attemptResponseRepository.save(attemptResponse);

        // Process Answer for Stats
        resultCalculationService.processAnswer(attempt, questionDifficulty, isCorrect, skipped);

        // Update Difficulty
        int nextDifficulty = adaptiveQuestionSelector.calculateNextDifficulty(attempt.getCurrentDifficultyLevel(), isCorrect, skipped);
        attempt.setCurrentDifficultyLevel(nextDifficulty);
        examAttemptRepository.save(attempt);

        AdaptiveAnswerResponse res = new AdaptiveAnswerResponse();
        res.setMessage("Answer submitted successfully.");
        res.setIsCorrect(isCorrect);
        res.setNextDifficultyLevel(nextDifficulty);
        
        long answeredCount = attemptResponseRepository.findByExamAttempt(attempt).size();
        res.setQuestionsRemaining(attempt.getTotalQuestions() - (int) answeredCount);
        
        return res;
    }

    @Override
    public SubmitExamResponse finishAdaptive(Long examId, SubmitExamRequest request) {
        ExamAttempt attempt = examAttemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        
        attempt.setStatus("COMPLETED");
        attempt.setSubmittedAt(LocalDateTime.now());
        
        long timeTakenSecs = java.time.Duration.between(attempt.getStartTime(), attempt.getSubmittedAt()).getSeconds();
        attempt.setTimeTakenSeconds(timeTakenSecs);

        resultCalculationService.finalizeAttempt(attempt);
        examAttemptRepository.save(attempt);

        SubmitExamResponse res = new SubmitExamResponse();
        res.setMessage("Adaptive assessment completed successfully.");
        res.setAttemptId(attempt.getAttemptId());
        res.setStatus(attempt.getStatus());
        res.setAbilityScore(attempt.getAbilityScore());
        res.setWeightedScore(attempt.getWeightedScore());
        res.setAccuracy(attempt.getAccuracy());
        res.setPercentage(attempt.getPercentage());
        res.setTimeTakenSeconds(attempt.getTimeTakenSeconds());
        res.setEasyCorrect(attempt.getEasyCorrect());
        res.setMediumCorrect(attempt.getMediumCorrect());
        res.setHardCorrect(attempt.getHardCorrect());

        java.util.List<com.cdac.spark.userexam.entity.AttemptResponse> savedResponses = attemptResponseRepository.findByExamAttempt(attempt);
        java.util.List<com.cdac.spark.userexam.dto.res.AttemptResponseDto> dtos = new java.util.ArrayList<>();
        for (com.cdac.spark.userexam.entity.AttemptResponse ar : savedResponses) {
            QuestionDetailsDto q = questionServiceClient.getQuestionById(ar.getQuestionId());
            com.cdac.spark.userexam.dto.res.AttemptResponseDto dto = new com.cdac.spark.userexam.dto.res.AttemptResponseDto();
            dto.setQuestionId(ar.getQuestionId());
            dto.setQuestionText(q.getQuestionText());
            dto.setSelectedAnswer(ar.getSelectedAnswer());
            dto.setCorrectAnswer(q.getCorrectAnswer());
            dto.setIsCorrect(ar.getIsCorrect());
            dto.setDifficulty(q.getDifficulty());
            dto.setOptionA(q.getOptionA());
            dto.setOptionB(q.getOptionB());
            dto.setOptionC(q.getOptionC());
            dto.setOptionD(q.getOptionD());
            dto.setExplanation(q.getExplanation());
            dtos.add(dto);
        }
        res.setResponses(dtos);

        return res;
    }

    public AdaptiveExamServiceImpl(ExamAttemptRepository examAttemptRepository, 
                                   UserRepository userRepository, 
                                   QuestionServiceClient questionServiceClient,
                                   com.cdac.spark.userexam.repository.AttemptResponseRepository attemptResponseRepository,
                                   com.cdac.spark.userexam.service.interfaces.AdaptiveQuestionSelector adaptiveQuestionSelector,
                                   com.cdac.spark.userexam.service.interfaces.ResultCalculationService resultCalculationService) {
        this.examAttemptRepository = examAttemptRepository;
        this.userRepository = userRepository;
        this.questionServiceClient = questionServiceClient;
        this.attemptResponseRepository = attemptResponseRepository;
        this.adaptiveQuestionSelector = adaptiveQuestionSelector;
        this.resultCalculationService = resultCalculationService;
    }
}
