package com.cdac.spark.userexam.service.interfaces;

import com.cdac.spark.userexam.dto.req.BulkActionRequest;
import com.cdac.spark.userexam.dto.req.TeacherCreateRequest;
import com.cdac.spark.userexam.dto.res.MessageResponse;
import com.cdac.spark.userexam.dto.res.UploadResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

public interface AdminService {
    MessageResponse createTeacher(TeacherCreateRequest request);
    Map<String, Object> getDashboardStats();
    Map<String, Object> getAllTeachers();
    MessageResponse updateTeacher(Long id, Map<String, String> payload);
    MessageResponse resetTeacherPassword(Long id, Map<String, String> payload);
    MessageResponse suspendTeacher(Long id);
    MessageResponse activateTeacher(Long id);
    MessageResponse deleteTeacher(Long id);
    MessageResponse bulkSuspendTeachers(BulkActionRequest request);
    MessageResponse bulkActivateTeachers(BulkActionRequest request);
    MessageResponse bulkDeleteTeachers(BulkActionRequest request);
    
    UploadResponse uploadStudents(MultipartFile file, String batchName, String courseName);
    Map<String, Object> getAllStudents();
    MessageResponse suspendStudent(Long id, String reason);
    MessageResponse activateStudent(Long id);
    MessageResponse deleteStudent(Long id);
    MessageResponse bulkSuspendStudents(BulkActionRequest request);
    MessageResponse bulkActivateStudents(BulkActionRequest request);
    MessageResponse bulkDeleteStudents(BulkActionRequest request);
}
