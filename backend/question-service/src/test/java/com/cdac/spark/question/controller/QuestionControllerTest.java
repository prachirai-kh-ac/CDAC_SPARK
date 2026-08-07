package com.cdac.spark.question.controller;

import com.cdac.spark.question.dto.req.QuestionRequest;
import com.cdac.spark.question.dto.req.QuestionUpdateRequest;
import com.cdac.spark.question.dto.res.MessageResponse;
import com.cdac.spark.question.dto.res.QuestionResponse;
import com.cdac.spark.question.service.interfaces.QuestionService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QuestionController.class)
@AutoConfigureMockMvc(addFilters = false)
class QuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private QuestionService questionService;

    private QuestionRequest validQuestionRequest;
    private QuestionUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        validQuestionRequest = new QuestionRequest(
                1L, 2L, 3L,
                "What is JVM?",
                "Java Virtual Machine",
                "Java Variable Method",
                "Joint Vector Map",
                "None",
                "A"
        );

        updateRequest = new QuestionUpdateRequest(
                "What is JVM updated?",
                "Java Virtual Machine",
                "Java Variable Method",
                "Joint Vector Map",
                "None",
                "A",
                "JVM executes java bytecode"
        );
    }

    @Test
    @DisplayName("Add Question - Success")
    void testAddQuestion_Success() throws Exception {
        // Arrange
        QuestionResponse response = new QuestionResponse();
        response.setMessage("Question added successfully.");
        response.setQuestionId(100L);

        when(questionService.addQuestion(any(QuestionRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/questions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validQuestionRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questionId").value(100))
                .andExpect(jsonPath("$.message").value("Question added successfully."));
    }

    @Test
    @DisplayName("Add Question - Validation Error")
    void testAddQuestion_ValidationError() throws Exception {
        // Arrange: Missing questionText and moduleId
        QuestionRequest invalidRequest = new QuestionRequest();

        // Act & Assert
        mockMvc.perform(post("/api/questions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Update Question - Success")
    void testUpdateQuestion_Success() throws Exception {
        // Arrange
        Long questionId = 100L;
        MessageResponse response = new MessageResponse("Question updated successfully.");
        when(questionService.updateQuestion(eq(questionId), any(QuestionUpdateRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/questions/{questionId}", questionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Question updated successfully."));
    }

    @Test
    @DisplayName("Delete Question - Success")
    void testDeleteQuestion_Success() throws Exception {
        // Arrange
        Long questionId = 100L;
        MessageResponse response = new MessageResponse("Question deleted successfully.");
        when(questionService.deleteQuestion(questionId)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(delete("/api/questions/{questionId}", questionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Question deleted successfully."));
    }
}
