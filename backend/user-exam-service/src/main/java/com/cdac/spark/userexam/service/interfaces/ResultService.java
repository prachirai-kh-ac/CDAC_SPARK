package com.cdac.spark.userexam.service.interfaces;

import com.cdac.spark.userexam.dto.res.ResultResponse;

public interface ResultService {
    ResultResponse getResult(Long attemptId);
    java.util.List<java.util.Map<String, Object>> getExamResults(Long examId);
    java.util.List<java.util.Map<String, Object>> getStudentResults(Long studentId);
    java.util.Map<String, Object> getStudentDashboard(Long studentId);
    java.util.List<java.util.Map<String, Object>> getGlobalLeaderboard(String batchName);
    java.util.Map<String, Object> getExamAnalytics(Long examId);
}
