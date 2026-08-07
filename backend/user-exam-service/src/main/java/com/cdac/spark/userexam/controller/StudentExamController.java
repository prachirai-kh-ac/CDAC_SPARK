package com.cdac.spark.userexam.controller;

import com.cdac.spark.userexam.client.QuestionServiceClient;
import com.cdac.spark.userexam.dto.res.ExamDetailsResponse;
import com.cdac.spark.userexam.entity.User;
import com.cdac.spark.userexam.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
public class StudentExamController {

    private final QuestionServiceClient questionServiceClient;
    private final UserRepository userRepository;

    public StudentExamController(QuestionServiceClient questionServiceClient, UserRepository userRepository) {
        this.questionServiceClient = questionServiceClient;
        this.userRepository = userRepository;
    }

    private boolean isBatchMatch(String examBatch, String studentBatch) {
        if (examBatch == null || examBatch.trim().isEmpty()) return true;
        if (studentBatch == null || studentBatch.trim().isEmpty()) return true;
        
        String trimmedExam = examBatch.trim();
        String trimmedStudent = studentBatch.trim();

        if ("All Batches".equalsIgnoreCase(trimmedExam) || "All".equalsIgnoreCase(trimmedExam)) return true;
        if ("All Batches".equalsIgnoreCase(trimmedStudent) || "All".equalsIgnoreCase(trimmedStudent)) return true;

        if (trimmedExam.equalsIgnoreCase(trimmedStudent)) return true;

        // Compare normalized alphanumeric strings to handle variations like "Feb - 2026" vs "Feb 2026"
        String normExam = trimmedExam.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        String normStudent = trimmedStudent.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        
        return normExam.equals(normStudent) || normExam.contains(normStudent) || normStudent.contains(normExam);
    }

    @GetMapping("/exams/live")
    public ResponseEntity<List<ExamDetailsResponse>> getActiveLiveExams() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User student = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<ExamDetailsResponse> allExams = questionServiceClient.getAllExams();
        LocalDateTime now = LocalDateTime.now();

        List<ExamDetailsResponse> activeExams = allExams.stream()
                .filter(exam -> {
                    // 1. Flexible batch matching
                    if (!isBatchMatch(exam.getBatchName(), student.getBatchName())) {
                        return false;
                    }

                    // 2. Filter out terminated / draft / archived / stopped / completed exams
                    String status = exam.getStatus();
                    if ("Stopped".equalsIgnoreCase(status) || "Draft".equalsIgnoreCase(status) 
                        || "Completed".equalsIgnoreCase(status) || "Archived".equalsIgnoreCase(status)) {
                        return false;
                    }

                    // 3. If teacher manually started exam early, status is Live/ACTIVE/Published -> immediately active!
                    if ("Live".equalsIgnoreCase(status) || "ACTIVE".equalsIgnoreCase(status) || "Published".equalsIgnoreCase(status)) {
                        return true;
                    }

                    // 4. Otherwise, check if current time is within scheduled window
                    if (exam.getScheduledAt() != null && !exam.getScheduledAt().isEmpty()) {
                        try {
                            LocalDateTime startDateTime = LocalDateTime.parse(exam.getScheduledAt());
                            int durationMinutes = exam.getDurationMinutes() != null ? exam.getDurationMinutes() : 60;
                            LocalDateTime endDateTime = startDateTime.plusMinutes(durationMinutes);

                            return !now.isBefore(startDateTime) && now.isBefore(endDateTime);
                        } catch (Exception e) {
                            return true;
                        }
                    }

                    return true;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(activeExams);
    }
    
    @GetMapping("/exams/upcoming")
    public ResponseEntity<List<ExamDetailsResponse>> getUpcomingExams() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User student = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<ExamDetailsResponse> allExams = questionServiceClient.getAllExams();
        LocalDateTime now = LocalDateTime.now();

        List<ExamDetailsResponse> upcomingExams = allExams.stream()
                .filter(exam -> {
                    // 1. Flexible batch matching
                    if (!isBatchMatch(exam.getBatchName(), student.getBatchName())) {
                        return false;
                    }

                    // 2. Filter out active/live/completed/stopped/draft
                    String status = exam.getStatus();
                    if ("Stopped".equalsIgnoreCase(status) || "Draft".equalsIgnoreCase(status) 
                        || "Completed".equalsIgnoreCase(status) || "Archived".equalsIgnoreCase(status)
                        || "Live".equalsIgnoreCase(status) || "ACTIVE".equalsIgnoreCase(status)
                        || "Published".equalsIgnoreCase(status)) {
                        return false;
                    }

                    if (exam.getScheduledAt() == null || exam.getScheduledAt().isEmpty()) {
                        return false;
                    }

                    try {
                        LocalDateTime startDateTime = LocalDateTime.parse(exam.getScheduledAt());
                        // Upcoming only if now < start time
                        return now.isBefore(startDateTime);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(upcomingExams);
    }
}
