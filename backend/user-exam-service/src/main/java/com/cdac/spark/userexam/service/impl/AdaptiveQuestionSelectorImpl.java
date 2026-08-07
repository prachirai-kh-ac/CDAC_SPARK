package com.cdac.spark.userexam.service.impl;

import com.cdac.spark.userexam.client.QuestionServiceClient;
import com.cdac.spark.userexam.dto.req.QuestionSearchRequest;
import com.cdac.spark.userexam.dto.res.QuestionDetailsDto;
import com.cdac.spark.userexam.entity.AttemptResponse;
import com.cdac.spark.userexam.entity.ExamAttempt;
import com.cdac.spark.userexam.repository.AttemptResponseRepository;
import com.cdac.spark.userexam.service.interfaces.AdaptiveQuestionSelector;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdaptiveQuestionSelectorImpl implements AdaptiveQuestionSelector {

    private final QuestionServiceClient questionServiceClient;
    private final AttemptResponseRepository attemptResponseRepository;

    public AdaptiveQuestionSelectorImpl(QuestionServiceClient questionServiceClient, AttemptResponseRepository attemptResponseRepository) {
        this.questionServiceClient = questionServiceClient;
        this.attemptResponseRepository = attemptResponseRepository;
    }

    @Override
    public QuestionDetailsDto getNextQuestion(ExamAttempt attempt) {
        // Find already served questions
        List<AttemptResponse> previousResponses = attemptResponseRepository.findByExamAttempt(attempt);
        List<Long> servedQuestionIds = previousResponses.stream()
                .map(AttemptResponse::getQuestionId)
                .collect(Collectors.toList());

        Long topicId = null;
        int targetDifficulty = attempt.getCurrentDifficultyLevel(); // 1=EASY, 2=MEDIUM, 3=HARD
        
        if ("LIVE".equalsIgnoreCase(attempt.getExamType())) {
            // For LIVE exams, examId is the real exam ID.
            Long realExamId = attempt.getExamId();
            // Fetch blueprint
            List<com.cdac.spark.userexam.dto.res.BlueprintDetailsResponse> blueprints = questionServiceClient.getBlueprint(realExamId);
            
            // Count how many questions served per topic based on previous responses
            // Since AttemptResponse doesn't store topicId directly, we have to look up the question details
            // For efficiency, it's better to fetch all served questions and count their topics, or just guess based on random selection
            // Let's find a topic from blueprint that hasn't reached its limit.
            java.util.Map<String, Long> servedTopicsCount = new java.util.HashMap<>();
            for (AttemptResponse ar : previousResponses) {
                QuestionDetailsDto qd = questionServiceClient.getQuestionById(ar.getQuestionId());
                if (qd != null && qd.getTopic() != null) {
                    servedTopicsCount.put(qd.getTopic(), servedTopicsCount.getOrDefault(qd.getTopic(), 0L) + 1);
                }
            }

            for (com.cdac.spark.userexam.dto.res.BlueprintDetailsResponse bp : blueprints) {
                long servedCount = servedTopicsCount.getOrDefault(bp.getTopicName(), 0L);
                if (servedCount < bp.getQuestionCount()) {
                    topicId = bp.getTopicId();
                    break;
                }
            }
            if (topicId == null) {
                if (!blueprints.isEmpty()) {
                    topicId = blueprints.get(0).getTopicId(); // fallback
                } else {
                    // Fallback to topicIds from ExamDetails
                    com.cdac.spark.userexam.dto.res.ExamDetailsResponse examDetails = questionServiceClient.getExamById(realExamId);
                    if (examDetails != null && examDetails.getTopicIds() != null && !examDetails.getTopicIds().isEmpty()) {
                        // Pick a random topic from the exam's assigned topics
                        java.util.List<Long> availableTopics = new java.util.ArrayList<>(examDetails.getTopicIds());
                        java.util.Collections.shuffle(availableTopics);
                        
                        // We could also check servedCounts here, but random is okay for fallback
                        topicId = availableTopics.get(0);
                    }
                }
            }
        } else {
            // For PRACTICE exams, examId is the topicId.
            topicId = attempt.getExamId(); 
        }
        
        QuestionDetailsDto nextQuestion = null;
        
        java.util.List<Long> topicsToTry = new java.util.ArrayList<>();
        if ("LIVE".equalsIgnoreCase(attempt.getExamType())) {
            if (topicId != null) {
                topicsToTry.add(topicId); // Try the selected one first
            }
            // Add all other topics to fallback list
            try {
                com.cdac.spark.userexam.dto.res.ExamDetailsResponse examDetails = questionServiceClient.getExamById(attempt.getExamId());
                if (examDetails != null && examDetails.getTopicIds() != null) {
                    for (Long tId : examDetails.getTopicIds()) {
                        if (!topicsToTry.contains(tId)) {
                            topicsToTry.add(tId);
                        }
                    }
                }
            } catch (Exception e) {}
        } else {
            if (topicId != null) topicsToTry.add(topicId);
        }

        // Try topics one by one
        for (Long tId : topicsToTry) {
            nextQuestion = findUnservedQuestion(tId, targetDifficulty, servedQuestionIds);
            
            // Fallback Logic for difficulty
            if (nextQuestion == null) {
                if (targetDifficulty == 3) {
                    nextQuestion = findUnservedQuestion(tId, 2, servedQuestionIds);
                    if (nextQuestion == null) {
                        nextQuestion = findUnservedQuestion(tId, 1, servedQuestionIds);
                    }
                } else if (targetDifficulty == 2) {
                    nextQuestion = findUnservedQuestion(tId, 1, servedQuestionIds);
                    if (nextQuestion == null) {
                        nextQuestion = findUnservedQuestion(tId, 3, servedQuestionIds);
                    }
                } else if (targetDifficulty == 1) {
                    nextQuestion = findUnservedQuestion(tId, 2, servedQuestionIds);
                    if (nextQuestion == null) {
                        nextQuestion = findUnservedQuestion(tId, 3, servedQuestionIds);
                    }
                }
            }
            
            if (nextQuestion != null) {
                break; // Found a question!
            }
        }
        
        return nextQuestion;
    }

    private QuestionDetailsDto findUnservedQuestion(Long topicId, int difficulty, List<Long> servedIds) {
        // Create search request. We might need moduleId, but question-service might fail if null.
        // We will pass 1L as a dummy module ID if question-service doesn't strictly check it, 
        // or we need to update question-service QuestionSearchRequest to allow null moduleId.
        QuestionSearchRequest req = new QuestionSearchRequest();
        req.setTopicId(topicId);

        String targetDifficultyName = difficulty == 1 ? "EASY" : difficulty == 2 ? "MEDIUM" : "HARD";

        try {
            List<QuestionDetailsDto> questions = questionServiceClient.searchQuestions(req);
            
            // Randomize questions to ensure a different sequence on each attempt
            java.util.Collections.shuffle(questions);
            
            for (QuestionDetailsDto q : questions) {
                if (targetDifficultyName.equalsIgnoreCase(q.getDifficulty())) {
                    if (!servedIds.contains(q.getQuestionId())) {
                        return q;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch questions for CAT: " + e.getMessage());
        }
        return null;
    }

    @Override
    public int calculateNextDifficulty(int currentDifficulty, boolean isCorrect, boolean skipped) {
        if (skipped) return currentDifficulty;
        
        if (isCorrect) {
            if (currentDifficulty == 1) return 2; // EASY -> MEDIUM
            if (currentDifficulty == 2) return 3; // MEDIUM -> HARD
            if (currentDifficulty == 3) return 3; // HARD -> HARD
        } else {
            if (currentDifficulty == 3) return 2; // HARD -> MEDIUM
            if (currentDifficulty == 2) return 1; // MEDIUM -> EASY
            if (currentDifficulty == 1) return 1; // EASY -> EASY
        }
        return currentDifficulty;
    }
}
