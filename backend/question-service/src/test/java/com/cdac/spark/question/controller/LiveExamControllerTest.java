package com.cdac.spark.question.controller;

import com.cdac.spark.question.dto.req.ExamRequest;
import com.cdac.spark.question.dto.res.ExamResponse;
import com.cdac.spark.question.dto.res.MessageResponse;
import com.cdac.spark.question.service.interfaces.ExamService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExamController.class)
@AutoConfigureMockMvc(addFilters = false)
class LiveExamControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExamService examService;

    private ExamRequest liveExamRequest;

    @BeforeEach
    void setUp() {
        liveExamRequest = new ExamRequest();
        liveExamRequest.setExamName("Java Standard Live Exam");
        liveExamRequest.setBatchName("DAC-2026");
        liveExamRequest.setExamDate("2026-08-10");
        liveExamRequest.setExamTime("10:00");
        liveExamRequest.setDuration(60);
        liveExamRequest.setModuleId(1L);
        liveExamRequest.setTopicIds(List.of(10L, 11L));
        liveExamRequest.setTotalQuestions(30);
    }

    @Test
    @DisplayName("Create Live Exam - Success")
    void testCreateLiveExam_Success() throws Exception {
        // Arrange
        ExamResponse response = new ExamResponse("Live Exam created successfully.", 50L);
        when(examService.createExam(any(ExamRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/exams")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(liveExamRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.examId").value(50))
                .andExpect(jsonPath("$.message").value("Live Exam created successfully."));
    }

    @Test
    @DisplayName("Publish Live Exam - Success")
    void testPublishLiveExam_Success() throws Exception {
        // Arrange
        Long examId = 50L;
        Map<String, String> statusBody = new HashMap<>();
        statusBody.put("status", "PUBLISHED");

        MessageResponse response = new MessageResponse("Exam status updated successfully.");
        when(examService.updateExamStatus(eq(examId), eq("PUBLISHED"))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/exams/{examId}/status", examId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Exam status updated successfully."));
    }

    @Test
    @DisplayName("Stop Live Exam - Success")
    void testStopLiveExam_Success() throws Exception {
        // Arrange
        Long examId = 50L;
        Map<String, String> statusBody = new HashMap<>();
        statusBody.put("status", "STOPPED");

        MessageResponse response = new MessageResponse("Exam status updated successfully.");
        when(examService.updateExamStatus(eq(examId), eq("STOPPED"))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/exams/{examId}/status", examId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Exam status updated successfully."));
    }
}
