package com.cdac.spark.userexam.controller;

import com.cdac.spark.userexam.dto.res.MessageResponse;
import com.cdac.spark.userexam.dto.res.UploadResponse;
import com.cdac.spark.userexam.service.interfaces.AdminService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminService adminService;

    @MockBean
    private com.cdac.spark.userexam.security.JwtUtil jwtUtil;

    @MockBean
    private com.cdac.spark.userexam.security.CustomUserDetailsServiceImpl customUserDetailsService;

    @Test
    @DisplayName("Create Student - Upload File")
    void testCreateStudent_UploadFile() throws Exception {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "students.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "mock data".getBytes()
        );
        UploadResponse uploadResponse = new UploadResponse();
        uploadResponse.setSuccessfulRecords(5);
        uploadResponse.setFailedRecords(0);

        when(adminService.uploadStudents(any(), eq("DAC"), eq("PG-DAC"))).thenReturn(uploadResponse);

        // Act & Assert
        mockMvc.perform(multipart("/api/admin/students/upload")
                .file(file)
                .param("batchName", "DAC")
                .param("courseName", "PG-DAC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successfulRecords").value(5))
                .andExpect(jsonPath("$.failedRecords").value(0));
    }

    @Test
    @DisplayName("Suspend Student")
    void testSuspendStudent() throws Exception {
        // Arrange
        Long studentId = 10L;
        MessageResponse response = new MessageResponse("Student suspended successfully.");
        when(adminService.suspendStudent(eq(studentId), any())).thenReturn(response);

        Map<String, String> payload = new HashMap<>();
        payload.put("reason", "Malpractice");

        // Act & Assert
        mockMvc.perform(patch("/api/admin/students/{id}/suspend", studentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Student suspended successfully."));
    }

    @Test
    @DisplayName("Activate Student")
    void testActivateStudent() throws Exception {
        // Arrange
        Long studentId = 10L;
        MessageResponse response = new MessageResponse("Student activated successfully.");
        when(adminService.activateStudent(studentId)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(patch("/api/admin/students/{id}/activate", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Student activated successfully."));
    }

    @Test
    @DisplayName("Delete Student")
    void testDeleteStudent() throws Exception {
        // Arrange
        Long studentId = 10L;
        MessageResponse response = new MessageResponse("Student deleted successfully.");
        when(adminService.deleteStudent(studentId)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(delete("/api/admin/students/{id}", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Student deleted successfully."));
    }
}
