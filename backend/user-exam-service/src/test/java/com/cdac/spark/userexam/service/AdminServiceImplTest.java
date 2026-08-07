package com.cdac.spark.userexam.service;

import com.cdac.spark.userexam.dto.res.MessageResponse;
import com.cdac.spark.userexam.entity.User;
import com.cdac.spark.userexam.exception.ResourceNotFoundException;
import com.cdac.spark.userexam.repository.UserRepository;
import com.cdac.spark.userexam.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminServiceImpl adminService;

    private User studentUser;

    @BeforeEach
    void setUp() {
        studentUser = new User();
        studentUser.setUserId(10L);
        studentUser.setFullName("Student One");
        studentUser.setEmail("student1@cdac.in");
        studentUser.setPrn("240010");
        studentUser.setRole("ROLE_STUDENT");
        studentUser.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("Suspend Student - Success")
    void testSuspendStudent_Success() {
        // Arrange
        when(userRepository.findById(10L)).thenReturn(Optional.of(studentUser));

        // Act
        MessageResponse response = adminService.suspendStudent(10L, "Malpractice");

        // Assert
        assertNotNull(response);
        assertEquals("Student suspended successfully", response.getMessage());
        assertEquals("SUSPENDED", studentUser.getStatus());
        assertEquals("Malpractice", studentUser.getSuspensionReason());
        verify(userRepository, times(1)).save(studentUser);
    }

    @Test
    @DisplayName("Suspend Student - Student Not Found")
    void testSuspendStudent_NotFound() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> adminService.suspendStudent(99L, "Reason"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Activate Student - Success")
    void testActivateStudent_Success() {
        // Arrange
        studentUser.setStatus("SUSPENDED");
        studentUser.setSuspensionReason("Malpractice");
        when(userRepository.findById(10L)).thenReturn(Optional.of(studentUser));

        // Act
        MessageResponse response = adminService.activateStudent(10L);

        // Assert
        assertNotNull(response);
        assertEquals("Student activated successfully", response.getMessage());
        assertEquals("ACTIVE", studentUser.getStatus());
        assertNull(studentUser.getSuspensionReason());
        verify(userRepository, times(1)).save(studentUser);
    }

    @Test
    @DisplayName("Delete Student - Success")
    void testDeleteStudent_Success() {
        // Arrange
        doNothing().when(userRepository).deleteById(10L);

        // Act
        MessageResponse response = adminService.deleteStudent(10L);

        // Assert
        assertNotNull(response);
        assertEquals("Student deleted successfully", response.getMessage());
        verify(userRepository, times(1)).deleteById(10L);
    }
}
