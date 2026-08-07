package com.cdac.spark.userexam.service.impl;

import com.cdac.spark.userexam.dto.req.StartExamRequest;
import com.cdac.spark.userexam.dto.req.SubmitExamRequest;
import com.cdac.spark.userexam.dto.res.AttemptDetailsResponse;
import com.cdac.spark.userexam.dto.res.StartExamResponse;
import com.cdac.spark.userexam.dto.res.SubmitExamResponse;
import com.cdac.spark.userexam.entity.ExamAttempt;
import com.cdac.spark.userexam.entity.User;
import com.cdac.spark.userexam.exception.ResourceNotFoundException;
import com.cdac.spark.userexam.repository.ExamAttemptRepository;
import com.cdac.spark.userexam.service.interfaces.ExamAttemptService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class ExamAttemptServiceImpl implements ExamAttemptService {

    private final ExamAttemptRepository examAttemptRepository;
    private final com.cdac.spark.userexam.repository.ExamViolationRepository examViolationRepository;

    public ExamAttemptServiceImpl(ExamAttemptRepository examAttemptRepository, com.cdac.spark.userexam.repository.ExamViolationRepository examViolationRepository) {
        this.examAttemptRepository = examAttemptRepository;
        this.examViolationRepository = examViolationRepository;
    }

    @Override
    public StartExamResponse startExam(Long examId, StartExamRequest request) {
        ExamAttempt attempt = new ExamAttempt();
        attempt.setExamId(examId);
        User student = new User();
        student.setUserId(request.getStudentId());
        attempt.setUser(student);
        attempt.setStatus("IN_PROGRESS");
        attempt.setStartTime(LocalDateTime.now());
        attempt = examAttemptRepository.save(attempt);

        StartExamResponse res = new StartExamResponse();
        res.setMessage("Exam started successfully.");
        res.setAttemptId(attempt.getAttemptId());
        res.setExamId(examId);
        res.setStartTime(attempt.getStartTime());
        return res;
    }

    @Override
    public AttemptDetailsResponse getAttempt(Long attemptId) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId).orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        AttemptDetailsResponse res = new AttemptDetailsResponse();
        res.setAttemptId(attempt.getAttemptId());
        res.setExamId(attempt.getExamId());
        res.setStudentId(attempt.getUser() != null ? attempt.getUser().getUserId() : null);
        res.setStatus(attempt.getStatus());
        res.setStartTime(attempt.getStartTime());
        return res;
    }

    @Override
    public SubmitExamResponse submitExam(Long examId, SubmitExamRequest request) {
        ExamAttempt attempt = examAttemptRepository.findById(request.getAttemptId()).orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        attempt.setStatus("COMPLETED");
        attempt.setSubmittedAt(LocalDateTime.now());
        examAttemptRepository.save(attempt);

        SubmitExamResponse res = new SubmitExamResponse();
        res.setMessage("Exam submitted successfully.");
        res.setAttemptId(attempt.getAttemptId());
        res.setStatus(attempt.getStatus());
        res.setSubmittedAt(attempt.getSubmittedAt());
        return res;
    }

    @Override
    public void recordViolation(com.cdac.spark.userexam.dto.req.ViolationRequest request) {
        ExamAttempt attempt = examAttemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        com.cdac.spark.userexam.entity.ExamViolation violation = new com.cdac.spark.userexam.entity.ExamViolation();
        violation.setExamAttempt(attempt);
        violation.setViolationType(request.getType());
        violation.setDetails(request.getDetails());
        examViolationRepository.save(violation);
    }
}
