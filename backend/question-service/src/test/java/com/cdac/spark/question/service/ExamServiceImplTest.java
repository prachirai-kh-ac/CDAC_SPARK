package com.cdac.spark.question.service;

import com.cdac.spark.question.dto.req.ExamRequest;
import com.cdac.spark.question.dto.res.ExamResponse;
import com.cdac.spark.question.dto.res.MessageResponse;
import com.cdac.spark.question.entity.Exam;
import com.cdac.spark.question.entity.Module;
import com.cdac.spark.question.entity.Question;
import com.cdac.spark.question.exception.ResourceNotFoundException;
import com.cdac.spark.question.repository.ExamRepository;
import com.cdac.spark.question.repository.ModuleRepository;
import com.cdac.spark.question.repository.QuestionRepository;
import com.cdac.spark.question.service.impl.ExamServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExamServiceImplTest {

    @Mock
    private ExamRepository examRepository;

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private ExamServiceImpl examService;

    private Module module;
    private Exam exam;
    private ExamRequest examRequest;

    @BeforeEach
    void setUp() {
        module = new Module();
        module.setModuleId(1L);
        module.setModuleName("Java");

        exam = new Exam();
        exam.setExamId(50L);
        exam.setExamName("Java Standard Live Exam");
        exam.setStatus("Scheduled");

        examRequest = new ExamRequest();
        examRequest.setExamName("Java Standard Live Exam");
        examRequest.setBatchName("DAC-2026");
        examRequest.setExamDate("2026-08-10");
        examRequest.setExamTime("10:00");
        examRequest.setDuration(60);
        examRequest.setModuleId(1L);
        examRequest.setTopicIds(List.of(10L, 11L));
        examRequest.setTotalQuestions(2);
    }

    @Test
    @DisplayName("Create Exam - Success")
    void testCreateExam_Success() {
        // Arrange
        Question q1 = new Question();
        q1.setQuestionId(1L);
        Question q2 = new Question();
        q2.setQuestionId(2L);

        when(moduleRepository.findById(1L)).thenReturn(Optional.of(module));
        when(questionRepository.findRandomQuestionsByTopics(any(), eq(2))).thenReturn(List.of(q1, q2));
        when(examRepository.save(any(Exam.class))).thenReturn(exam);

        // Act
        ExamResponse response = examService.createExam(examRequest);

        // Assert
        assertNotNull(response);
        assertEquals(50L, response.getExamId());
        assertEquals("Exam created successfully.", response.getMessage());
        verify(examRepository, times(1)).save(any(Exam.class));
    }

    @Test
    @DisplayName("Create Exam - Module Not Found")
    void testCreateExam_ModuleNotFound() {
        // Arrange
        when(moduleRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> examService.createExam(examRequest));
        verify(examRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update Exam Status - Publish Success")
    void testUpdateExamStatus_PublishSuccess() {
        // Arrange
        when(examRepository.findById(50L)).thenReturn(Optional.of(exam));

        // Act
        MessageResponse response = examService.updateExamStatus(50L, "PUBLISHED");

        // Assert
        assertNotNull(response);
        assertEquals("Exam status updated successfully.", response.getMessage());
        assertEquals("PUBLISHED", exam.getStatus());
        verify(examRepository, times(1)).save(exam);
    }

    @Test
    @DisplayName("Update Exam Status - Stop Success")
    void testUpdateExamStatus_StopSuccess() {
        // Arrange
        when(examRepository.findById(50L)).thenReturn(Optional.of(exam));

        // Act
        MessageResponse response = examService.updateExamStatus(50L, "STOPPED");

        // Assert
        assertNotNull(response);
        assertEquals("Exam status updated successfully.", response.getMessage());
        assertEquals("STOPPED", exam.getStatus());
        verify(examRepository, times(1)).save(exam);
    }

    @Test
    @DisplayName("Update Exam Status - Exam Not Found")
    void testUpdateExamStatus_NotFound() {
        // Arrange
        when(examRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> examService.updateExamStatus(99L, "PUBLISHED"));
        verify(examRepository, never()).save(any());
    }
}
