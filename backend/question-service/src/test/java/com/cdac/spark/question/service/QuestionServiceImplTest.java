package com.cdac.spark.question.service;

import com.cdac.spark.question.dto.req.QuestionRequest;
import com.cdac.spark.question.dto.req.QuestionUpdateRequest;
import com.cdac.spark.question.dto.res.MessageResponse;
import com.cdac.spark.question.dto.res.QuestionResponse;
import com.cdac.spark.question.entity.DifficultyLevel;
import com.cdac.spark.question.entity.Module;
import com.cdac.spark.question.entity.Question;
import com.cdac.spark.question.entity.Topic;
import com.cdac.spark.question.exception.ResourceNotFoundException;
import com.cdac.spark.question.repository.DifficultyLevelRepository;
import com.cdac.spark.question.repository.ModuleRepository;
import com.cdac.spark.question.repository.QuestionRepository;
import com.cdac.spark.question.repository.TopicRepository;
import com.cdac.spark.question.service.impl.QuestionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuestionServiceImplTest {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private TopicRepository topicRepository;

    @Mock
    private DifficultyLevelRepository difficultyLevelRepository;

    @InjectMocks
    private QuestionServiceImpl questionService;

    private Module module;
    private Topic topic;
    private DifficultyLevel difficultyLevel;
    private Question question;

    @BeforeEach
    void setUp() {
        module = new Module();
        module.setModuleId(1L);
        module.setModuleName("Java");

        topic = new Topic();
        topic.setTopicId(2L);
        topic.setTopicName("JVM Architecture");

        difficultyLevel = new DifficultyLevel();
        difficultyLevel.setDifficultyLevelId(3L);
        difficultyLevel.setLevelName("EASY");

        question = new Question();
        question.setQuestionId(100L);
        question.setModule(module);
        question.setTopic(topic);
        question.setDifficultyLevel(difficultyLevel);
        question.setQuestionText("What is JVM?");
        question.setOptionA("Java Virtual Machine");
        question.setOptionB("Java Variable Method");
        question.setOptionC("Joint Vector Map");
        question.setOptionD("None");
        question.setCorrectAnswer("A");
    }

    @Test
    @DisplayName("Add Question - Success")
    void testAddQuestion_Success() {
        // Arrange
        QuestionRequest request = new QuestionRequest(
                1L, 2L, 3L,
                "What is JVM?",
                "Java Virtual Machine",
                "Java Variable Method",
                "Joint Vector Map",
                "None",
                "A"
        );

        when(moduleRepository.findById(1L)).thenReturn(Optional.of(module));
        when(topicRepository.findById(2L)).thenReturn(Optional.of(topic));
        when(difficultyLevelRepository.findById(3L)).thenReturn(Optional.of(difficultyLevel));
        when(questionRepository.save(any(Question.class))).thenReturn(question);

        // Act
        QuestionResponse response = questionService.addQuestion(request);

        // Assert
        assertNotNull(response);
        assertEquals(100L, response.getQuestionId());
        assertEquals("Question added successfully.", response.getMessage());
        verify(questionRepository, times(1)).save(any(Question.class));
    }

    @Test
    @DisplayName("Add Question - Module Not Found")
    void testAddQuestion_ModuleNotFound() {
        // Arrange
        QuestionRequest request = new QuestionRequest(
                99L, 2L, 3L, "Question?", "A", "B", "C", "D", "A"
        );
        when(moduleRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> questionService.addQuestion(request));
        verify(questionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update Question - Success")
    void testUpdateQuestion_Success() {
        // Arrange
        QuestionUpdateRequest updateRequest = new QuestionUpdateRequest(
                "Updated JVM question",
                "Option A", "Option B", "Option C", "Option D",
                "B", "Explanation note"
        );
        when(questionRepository.findById(100L)).thenReturn(Optional.of(question));

        // Act
        MessageResponse response = questionService.updateQuestion(100L, updateRequest);

        // Assert
        assertNotNull(response);
        assertEquals("Question updated successfully.", response.getMessage());
        assertEquals("Updated JVM question", question.getQuestionText());
        assertEquals("B", question.getCorrectAnswer());
        verify(questionRepository, times(1)).save(question);
    }

    @Test
    @DisplayName("Update Question - Not Found")
    void testUpdateQuestion_NotFound() {
        // Arrange
        QuestionUpdateRequest updateRequest = new QuestionUpdateRequest(
                "Updated question", "A", "B", "C", "D", "A", "Exp"
        );
        when(questionRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> questionService.updateQuestion(999L, updateRequest));
        verify(questionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Delete Question - Success")
    void testDeleteQuestion_Success() {
        // Arrange
        doNothing().when(questionRepository).deleteById(100L);

        // Act
        MessageResponse response = questionService.deleteQuestion(100L);

        // Assert
        assertNotNull(response);
        assertEquals("Question deleted successfully.", response.getMessage());
        verify(questionRepository, times(1)).deleteById(100L);
    }
}
