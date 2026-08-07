package com.cdac.spark.userexam.service.impl;

import com.cdac.spark.userexam.client.QuestionServiceClient;
import com.cdac.spark.userexam.dto.res.ExamDetailsResponse;
import com.cdac.spark.userexam.dto.res.ResultResponse;
import com.cdac.spark.userexam.entity.AttemptResponse;
import com.cdac.spark.userexam.entity.AttemptTopicProgress;
import com.cdac.spark.userexam.entity.ExamAttempt;
import com.cdac.spark.userexam.entity.User;
import com.cdac.spark.userexam.exception.ResourceNotFoundException;
import com.cdac.spark.userexam.repository.AttemptResponseRepository;
import com.cdac.spark.userexam.repository.ExamAttemptRepository;
import com.cdac.spark.userexam.repository.UserRepository;
import com.cdac.spark.userexam.service.interfaces.ResultService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ResultServiceImpl implements ResultService {

    private final ExamAttemptRepository examAttemptRepository;
    private final AttemptResponseRepository attemptResponseRepository;
    private final UserRepository userRepository;
    private final QuestionServiceClient questionServiceClient;

    public ResultServiceImpl(ExamAttemptRepository examAttemptRepository,
                             AttemptResponseRepository attemptResponseRepository,
                             UserRepository userRepository,
                             QuestionServiceClient questionServiceClient) {
        this.examAttemptRepository = examAttemptRepository;
        this.attemptResponseRepository = attemptResponseRepository;
        this.userRepository = userRepository;
        this.questionServiceClient = questionServiceClient;
    }

    @Override
    public ResultResponse getResult(Long attemptId) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId).orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        List<AttemptResponse> responses = attemptResponseRepository.findByExamAttempt_AttemptId(attemptId);
        
        int totalQuestions = attempt.getTotalQuestions() != null ? attempt.getTotalQuestions() : responses.size();
        int correctAnswers = (int) responses.stream().filter(r -> r.getIsCorrect() != null && r.getIsCorrect()).count();
        int incorrectAnswers = responses.size() - correctAnswers;
        
        double accuracy = responses.isEmpty() ? 0 : ((double) correctAnswers / responses.size()) * 100;
        double percentage = totalQuestions == 0 ? 0 : ((double) correctAnswers / totalQuestions) * 100;

        ResultResponse res = new ResultResponse();
        res.setAttemptId(attemptId);
        res.setStudentId(attempt.getUser() != null ? attempt.getUser().getUserId() : null);
        res.setExamId(attempt.getExamId());
        res.setAbilityScore(attempt.getAbilityScore() != null ? attempt.getAbilityScore() : 500);
        res.setWeightedScore(attempt.getWeightedScore() != null ? attempt.getWeightedScore() : 0);
        res.setAccuracy(attempt.getAccuracy() != null ? attempt.getAccuracy() : accuracy);
        res.setPercentage(attempt.getPercentage() != null ? attempt.getPercentage() : percentage);
        res.setRank(1);
        res.setTotalQuestions(totalQuestions);
        res.setCorrectAnswers(correctAnswers);
        res.setIncorrectAnswers(incorrectAnswers);
        
        long seconds = attempt.getTimeTakenSeconds() != null ? attempt.getTimeTakenSeconds() : 1800;
        String formattedTime = String.format("%02d:%02d:%02d", seconds / 3600, (seconds % 3600) / 60, seconds % 60);
        res.setTimeTaken(formattedTime);
        res.setStatus(attempt.getStatus());

        if (attempt.getViolations() != null) {
            java.util.List<com.cdac.spark.userexam.dto.res.ViolationDto> violationDtos = attempt.getViolations().stream()
                .map(v -> new com.cdac.spark.userexam.dto.res.ViolationDto(v.getViolationType(), v.getDetails(), v.getCreatedAt()))
                .collect(Collectors.toList());
            res.setViolations(violationDtos);
            res.setTotalViolations(violationDtos.size());
        } else {
            res.setViolations(new ArrayList<>());
            res.setTotalViolations(0);
        }

        return res;
    }

    @Override
    public List<Map<String, Object>> getExamResults(Long examId) {
        List<ExamAttempt> attempts = examAttemptRepository.findByExamId(examId).stream()
            .filter(a -> "COMPLETED".equals(a.getStatus()))
            .filter(a -> a.getUser() != null && "ROLE_STUDENT".equals(a.getUser().getRole()))
            .collect(Collectors.toList());
        
        List<Map<String, Object>> results = new ArrayList<>();
        for (ExamAttempt attempt : attempts) {
            Map<String, Object> map = new HashMap<>();
            map.put("attemptId", attempt.getAttemptId());
            map.put("studentName", attempt.getUser() != null ? attempt.getUser().getFullName() : "Unknown");
            map.put("prn", attempt.getUser() != null ? attempt.getUser().getPrn() : "N/A");
            map.put("abilityScore", attempt.getAbilityScore());
            map.put("weightedScore", attempt.getWeightedScore());
            map.put("accuracy", attempt.getAccuracy());
            map.put("percentage", attempt.getPercentage());
            map.put("timeTakenSeconds", attempt.getTimeTakenSeconds());
            map.put("status", attempt.getStatus());
            map.put("submittedAt", attempt.getSubmittedAt());
            
            int totalViolations = attempt.getViolations() != null ? attempt.getViolations().size() : 0;
            map.put("totalViolations", totalViolations);
            
            results.add(map);
        }

        // Sort: Ability DESC, Weighted DESC, Accuracy DESC, TimeTaken ASC
        results.sort((a, b) -> {
            Integer aAbility = (Integer) a.getOrDefault("abilityScore", 0);
            Integer bAbility = (Integer) b.getOrDefault("abilityScore", 0);
            if (!aAbility.equals(bAbility)) return bAbility.compareTo(aAbility);
            
            Integer aWeighted = (Integer) a.getOrDefault("weightedScore", 0);
            Integer bWeighted = (Integer) b.getOrDefault("weightedScore", 0);
            if (!aWeighted.equals(bWeighted)) return bWeighted.compareTo(aWeighted);
            
            Double aAccuracy = (Double) a.getOrDefault("accuracy", 0.0);
            Double bAccuracy = (Double) b.getOrDefault("accuracy", 0.0);
            if (!aAccuracy.equals(bAccuracy)) return bAccuracy.compareTo(aAccuracy);
            
            Long aTime = (Long) a.getOrDefault("timeTakenSeconds", Long.MAX_VALUE);
            Long bTime = (Long) b.getOrDefault("timeTakenSeconds", Long.MAX_VALUE);
            return aTime.compareTo(bTime);
        });

        // Assign rank
        for (int i = 0; i < results.size(); i++) {
            results.get(i).put("rank", i + 1);
        }

        return results;
    }

    @Override
    public List<Map<String, Object>> getStudentResults(Long studentId) {
        List<ExamAttempt> attempts = examAttemptRepository.findByUser_UserId(studentId);
        List<Map<String, Object>> results = new ArrayList<>();
        
        for (ExamAttempt attempt : attempts) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", attempt.getAttemptId());
            map.put("attemptId", attempt.getAttemptId());
            map.put("examId", attempt.getExamId());
            map.put("examTitle", "Exam " + attempt.getExamId());
            map.put("score", attempt.getAbilityScore() != null ? attempt.getAbilityScore() : 500);
            map.put("percentage", attempt.getPercentage() != null ? attempt.getPercentage() : 0.0);
            map.put("submittedAt", attempt.getSubmittedAt());
            map.put("status", attempt.getStatus());
            map.put("easyCorrect", attempt.getEasyCorrect() != null ? attempt.getEasyCorrect() : 0);
            map.put("easyWrong", attempt.getEasyWrong() != null ? attempt.getEasyWrong() : 0);
            map.put("easySkipped", attempt.getEasySkipped() != null ? attempt.getEasySkipped() : 0);
            map.put("mediumCorrect", attempt.getMediumCorrect() != null ? attempt.getMediumCorrect() : 0);
            map.put("mediumWrong", attempt.getMediumWrong() != null ? attempt.getMediumWrong() : 0);
            map.put("mediumSkipped", attempt.getMediumSkipped() != null ? attempt.getMediumSkipped() : 0);
            map.put("hardCorrect", attempt.getHardCorrect() != null ? attempt.getHardCorrect() : 0);
            map.put("hardWrong", attempt.getHardWrong() != null ? attempt.getHardWrong() : 0);
            map.put("hardSkipped", attempt.getHardSkipped() != null ? attempt.getHardSkipped() : 0);
            map.put("totalQuestions", attempt.getTotalQuestions() != null ? attempt.getTotalQuestions() : 0);
            results.add(map);
        }
        return results;
    }

    @Override
    public Map<String, Object> getStudentDashboard(Long studentId) {
        List<ExamAttempt> attempts = examAttemptRepository.findByUser_UserId(studentId);
        List<ExamAttempt> completedAttempts = attempts.stream()
                .filter(a -> "COMPLETED".equals(a.getStatus()))
                .collect(Collectors.toList());

        long examsCompleted = completedAttempts.size();
        long practiceDone = completedAttempts.stream().filter(a -> "PRACTICE".equals(a.getExamType())).count();

        double totalScore = completedAttempts.stream().mapToDouble(a -> a.getPercentage() != null ? a.getPercentage() : 0.0).sum();
        long overallScore = completedAttempts.isEmpty() ? 0 : Math.round(totalScore / completedAttempts.size());

        // Performance Trend
        List<ExamAttempt> recentCompleted = completedAttempts.stream()
                .sorted((a, b) -> {
                    if (a.getSubmittedAt() == null && b.getSubmittedAt() == null) return 0;
                    if (a.getSubmittedAt() == null) return -1;
                    if (b.getSubmittedAt() == null) return 1;
                    return a.getSubmittedAt().compareTo(b.getSubmittedAt());
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> performanceData = new ArrayList<>();
        int startIndex = Math.max(0, recentCompleted.size() - 5);
        for (int i = startIndex; i < recentCompleted.size(); i++) {
            ExamAttempt a = recentCompleted.get(i);
            Map<String, Object> p = new HashMap<>();
            p.put("name", "Test " + (i - startIndex + 1));
            p.put("score", Math.round(a.getPercentage() != null ? a.getPercentage() : 0.0));
            performanceData.add(p);
        }

        // Accuracy by Difficulty
        long easyCorrect = 0, easyTotal = 0;
        long mediumCorrect = 0, mediumTotal = 0;
        long hardCorrect = 0, hardTotal = 0;

        for (ExamAttempt a : completedAttempts) {
            easyCorrect += (a.getEasyCorrect() != null ? a.getEasyCorrect() : 0);
            easyTotal += (a.getEasyCorrect() != null ? a.getEasyCorrect() : 0) + (a.getEasyWrong() != null ? a.getEasyWrong() : 0) + (a.getEasySkipped() != null ? a.getEasySkipped() : 0);

            mediumCorrect += (a.getMediumCorrect() != null ? a.getMediumCorrect() : 0);
            mediumTotal += (a.getMediumCorrect() != null ? a.getMediumCorrect() : 0) + (a.getMediumWrong() != null ? a.getMediumWrong() : 0) + (a.getMediumSkipped() != null ? a.getMediumSkipped() : 0);

            hardCorrect += (a.getHardCorrect() != null ? a.getHardCorrect() : 0);
            hardTotal += (a.getHardCorrect() != null ? a.getHardCorrect() : 0) + (a.getHardWrong() != null ? a.getHardWrong() : 0) + (a.getHardSkipped() != null ? a.getHardSkipped() : 0);
        }

        List<Map<String, Object>> accuracyData = new ArrayList<>();
        if (easyTotal > 0) accuracyData.add(Map.of("name", "Easy", "value", Math.round((double) easyCorrect / easyTotal * 100), "color", "#34d399"));
        if (mediumTotal > 0) accuracyData.add(Map.of("name", "Medium", "value", Math.round((double) mediumCorrect / mediumTotal * 100), "color", "#fbbf24"));
        if (hardTotal > 0) accuracyData.add(Map.of("name", "Hard", "value", Math.round((double) hardCorrect / hardTotal * 100), "color", "#f87171"));

        // Subject Strengths
        Map<String, double[]> subjectMap = new HashMap<>();
        for (ExamAttempt a : completedAttempts) {
            if (a.getTopicProgresses() != null && !a.getTopicProgresses().isEmpty()) {
                for (AttemptTopicProgress tp : a.getTopicProgresses()) {
                    String sub = "Topic " + tp.getTopicId();
                    subjectMap.putIfAbsent(sub, new double[]{0.0, 0.0});
                    subjectMap.get(sub)[0] += (a.getPercentage() != null ? a.getPercentage() : 0.0);
                    subjectMap.get(sub)[1] += 1;
                }
            } else {
                String sub = "Exam " + a.getExamId();
                subjectMap.putIfAbsent(sub, new double[]{0.0, 0.0});
                subjectMap.get(sub)[0] += (a.getPercentage() != null ? a.getPercentage() : 0.0);
                subjectMap.get(sub)[1] += 1;
            }
        }

        List<Map<String, Object>> subjectData = new ArrayList<>();
        for (Map.Entry<String, double[]> entry : subjectMap.entrySet()) {
            subjectData.add(Map.of("subject", entry.getKey(), "score", Math.round(entry.getValue()[0] / entry.getValue()[1])));
        }

        // Recent Results
        List<Map<String, Object>> recentResults = new ArrayList<>();
        List<ExamAttempt> recentDesc = new ArrayList<>(completedAttempts);
        recentDesc.sort((a, b) -> {
            if (a.getSubmittedAt() == null && b.getSubmittedAt() == null) return 0;
            if (a.getSubmittedAt() == null) return -1;
            if (b.getSubmittedAt() == null) return 1;
            return b.getSubmittedAt().compareTo(a.getSubmittedAt());
        });
        
        for (int i = 0; i < Math.min(3, recentDesc.size()); i++) {
            ExamAttempt a = recentDesc.get(i);
            int totalQ = a.getTotalQuestions() != null ? a.getTotalQuestions() : 0;
            int correctQ = (a.getEasyCorrect() != null ? a.getEasyCorrect() : 0) + (a.getMediumCorrect() != null ? a.getMediumCorrect() : 0) + (a.getHardCorrect() != null ? a.getHardCorrect() : 0);
            recentResults.add(Map.of(
                "subject", "Exam " + a.getExamId(),
                "score", Math.round(a.getPercentage() != null ? a.getPercentage() : 0.0),
                "correct", correctQ,
                "total", totalQ,
                "date", a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : "N/A"
            ));
        }

        Map<String, Object> data = new HashMap<>();
        data.put("overallScore", overallScore);
        data.put("examsCompleted", examsCompleted);
        data.put("practiceDone", practiceDone);
        
        // Find rank from leaderboard
        String batchName = !attempts.isEmpty() && attempts.get(0).getUser() != null ? attempts.get(0).getUser().getBatchName() : null;
        List<Map<String, Object>> leaderboard = getGlobalLeaderboard(batchName);
        Object rank = "-";
        for (Map<String, Object> student : leaderboard) {
            if (studentId.equals(student.get("userId"))) {
                rank = student.get("rank");
                break;
            }
        }
        data.put("rank", rank);
        data.put("performanceData", performanceData);
        data.put("accuracyData", accuracyData);
        data.put("subjectData", subjectData);
        data.put("recentResults", recentResults);

        return data;
    }

    private boolean isBatchMatch(String queryBatch, String studentBatch) {
        if (queryBatch == null || queryBatch.trim().isEmpty() || "All".equalsIgnoreCase(queryBatch.trim()) || "All Batches".equalsIgnoreCase(queryBatch.trim())) return true;
        if (studentBatch == null || studentBatch.trim().isEmpty()) return true;
        
        String trimmedQuery = queryBatch.trim();
        String trimmedStudent = studentBatch.trim();
        if (trimmedQuery.equalsIgnoreCase(trimmedStudent)) return true;

        String normQuery = trimmedQuery.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        String normStudent = trimmedStudent.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        return normQuery.equals(normStudent) || normQuery.contains(normStudent) || normStudent.contains(normQuery);
    }

    @Override
    public List<Map<String, Object>> getGlobalLeaderboard(String batchName) {
        // Fetch published exam IDs from question-service
        Set<Long> publishedExamIds = new HashSet<>();
        try {
            List<ExamDetailsResponse> allExams = questionServiceClient.getAllExams();
            if (allExams != null) {
                for (ExamDetailsResponse e : allExams) {
                    if ("Published".equalsIgnoreCase(e.getStatus()) || "PUBLISHED".equalsIgnoreCase(e.getStatus())) {
                        publishedExamIds.add(e.getId());
                    }
                }
            }
        } catch (Exception e) {
            // Logging or fallback if question service call fails
        }

        List<ExamAttempt> allAttempts = examAttemptRepository.findAll();
        
        // Group completed attempts for PUBLISHED exams by userId
        Map<Long, List<ExamAttempt>> userAttempts = new HashMap<>();
        for (ExamAttempt attempt : allAttempts) {
            if ("COMPLETED".equals(attempt.getStatus())
                    && attempt.getUser() != null
                    && "ROLE_STUDENT".equals(attempt.getUser().getRole())
                    && attempt.getExamId() != null
                    && publishedExamIds.contains(attempt.getExamId())) {
                
                if (isBatchMatch(batchName, attempt.getUser().getBatchName())) {
                    userAttempts.computeIfAbsent(attempt.getUser().getUserId(), k -> new ArrayList<>()).add(attempt);
                }
            }
        }

        // Get all registered students in the batch
        List<User> allStudents = userRepository.findAll().stream()
                .filter(u -> "ROLE_STUDENT".equalsIgnoreCase(u.getRole()))
                .filter(u -> isBatchMatch(batchName, u.getBatchName()))
                .collect(Collectors.toList());

        List<Map<String, Object>> leaderboard = new ArrayList<>();

        for (User u : allStudents) {
            List<ExamAttempt> attempts = userAttempts.get(u.getUserId());
            
            Map<String, Object> stat = new HashMap<>();
            stat.put("userId", u.getUserId());
            stat.put("fullName", u.getFullName());
            stat.put("prn", u.getPrn());
            stat.put("email", u.getEmail());
            stat.put("batchName", u.getBatchName());

            if (attempts != null && !attempts.isEmpty()) {
                int totalAttempts = attempts.size();
                attempts.sort((a, b) -> {
                    if (a.getSubmittedAt() == null && b.getSubmittedAt() == null) return 0;
                    if (a.getSubmittedAt() == null) return 1;
                    if (b.getSubmittedAt() == null) return -1;
                    return b.getSubmittedAt().compareTo(a.getSubmittedAt());
                });

                ExamAttempt latestAttempt = attempts.get(0);
                stat.put("abilityScore", latestAttempt.getAbilityScore() != null ? latestAttempt.getAbilityScore() : 0);
                stat.put("weightedScore", latestAttempt.getWeightedScore() != null ? latestAttempt.getWeightedScore() : 0);
                stat.put("accuracy", latestAttempt.getAccuracy() != null ? latestAttempt.getAccuracy() : 0.0);
                stat.put("percentage", latestAttempt.getPercentage() != null ? latestAttempt.getPercentage() : 0.0);
                stat.put("timeTaken", latestAttempt.getTimeTakenSeconds() != null ? latestAttempt.getTimeTakenSeconds() : 0L);
                stat.put("passFail", latestAttempt.getPercentage() != null && latestAttempt.getPercentage() >= 40 ? "Pass" : "Fail");
                stat.put("totalAttempts", totalAttempts);
                stat.put("averageScore", latestAttempt.getPercentage() != null ? latestAttempt.getPercentage() : 0.0);
                stat.put("hasAttempted", true);
            } else {
                stat.put("abilityScore", 0);
                stat.put("weightedScore", 0);
                stat.put("accuracy", 0.0);
                stat.put("percentage", 0.0);
                stat.put("timeTaken", 0L);
                stat.put("passFail", "Unattempted");
                stat.put("totalAttempts", 0);
                stat.put("averageScore", 0.0);
                stat.put("hasAttempted", false);
            }

            leaderboard.add(stat);
        }

        // Sort leaderboard:
        // 1. Students with published attempts come before unattempted students
        // 2. Ability Score (descending)
        // 3. Percentage (descending)
        // 4. Accuracy (descending)
        // 5. Time Taken (ascending)
        // 6. Full Name (ascending)
        leaderboard.sort((a, b) -> {
            Boolean aHas = (Boolean) a.get("hasAttempted");
            Boolean bHas = (Boolean) b.get("hasAttempted");
            if (aHas != null && bHas != null && !aHas.equals(bHas)) {
                return bHas.compareTo(aHas);
            }

            Integer aAbility = (Integer) a.get("abilityScore");
            Integer bAbility = (Integer) b.get("abilityScore");
            if (aAbility != null && bAbility != null && !aAbility.equals(bAbility)) return bAbility.compareTo(aAbility);

            Double aPerc = (Double) a.get("percentage");
            Double bPerc = (Double) b.get("percentage");
            if (aPerc != null && bPerc != null && Math.abs(aPerc - bPerc) > 0.0001) return bPerc.compareTo(aPerc);

            Double aAccuracy = (Double) a.get("accuracy");
            Double bAccuracy = (Double) b.get("accuracy");
            if (aAccuracy != null && bAccuracy != null && Math.abs(aAccuracy - bAccuracy) > 0.0001) return bAccuracy.compareTo(aAccuracy);

            Long aTime = (Long) a.get("timeTaken");
            Long bTime = (Long) b.get("timeTaken");
            if (aTime != null && bTime != null && !aTime.equals(bTime)) {
                return aTime.compareTo(bTime);
            }

            String aName = (String) a.get("fullName");
            String bName = (String) b.get("fullName");
            if (aName != null && bName != null) {
                return aName.compareToIgnoreCase(bName);
            }

            return 0;
        });

        for (int i = 0; i < leaderboard.size(); i++) {
            leaderboard.get(i).put("rank", i + 1);
        }

        return leaderboard;
    }

    @Override
    public Map<String, Object> getExamAnalytics(Long examId) {
        List<ExamAttempt> attempts = examAttemptRepository.findByExamId(examId).stream()
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()))
                .collect(Collectors.toList());

        int totalAppeared = attempts.size();
        int passCount = 0;
        int failCount = 0;
        double totalPercentageSum = 0;

        for (ExamAttempt a : attempts) {
            double perc = a.getPercentage() != null ? a.getPercentage() : 0.0;
            totalPercentageSum += perc;
            if (perc >= 40) {
                passCount++;
            } else {
                failCount++;
            }
        }

        double averageScore = totalAppeared > 0 ? Math.round(totalPercentageSum / totalAppeared) : 0;
        double passRate = totalAppeared > 0 ? Math.round(((double) passCount / totalAppeared) * 100) : 0;

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalAppeared", totalAppeared);
        analytics.put("averageScore", averageScore);
        analytics.put("passRate", passRate);
        analytics.put("passCount", passCount);
        analytics.put("failCount", failCount);
        analytics.put("redFlags", new ArrayList<>());
        analytics.put("batchTrajectory", new ArrayList<>());

        return analytics;
    }
}
