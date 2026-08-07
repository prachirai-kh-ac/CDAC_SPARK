package com.cdac.spark.userexam.service.interfaces;

import com.cdac.spark.userexam.dto.req.StartExamRequest;
import com.cdac.spark.userexam.dto.req.SubmitExamRequest;
import com.cdac.spark.userexam.dto.res.AttemptDetailsResponse;
import com.cdac.spark.userexam.dto.res.StartExamResponse;
import com.cdac.spark.userexam.dto.res.SubmitExamResponse;

public interface ExamAttemptService {
    StartExamResponse startExam(Long examId, StartExamRequest request);
    AttemptDetailsResponse getAttempt(Long attemptId);
    SubmitExamResponse submitExam(Long examId, SubmitExamRequest request);
    void recordViolation(com.cdac.spark.userexam.dto.req.ViolationRequest request);
}
