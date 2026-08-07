package com.cdac.spark.userexam.controller;

import com.cdac.spark.userexam.dto.req.*;
import com.cdac.spark.userexam.dto.res.*;
import com.cdac.spark.userexam.service.interfaces.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/teachers")
    public ResponseEntity<MessageResponse> createTeacher(@RequestBody TeacherCreateRequest request) {
        try {
            return ResponseEntity.ok(adminService.createTeacher(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/teachers")
    public ResponseEntity<Map<String, Object>> getAllTeachers() {
        return ResponseEntity.ok(adminService.getAllTeachers());
    }

    @PutMapping("/teachers/{id}")
    public ResponseEntity<MessageResponse> updateTeacher(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(adminService.updateTeacher(id, payload));
    }

    @PutMapping("/teachers/{id}/reset-password")
    public ResponseEntity<MessageResponse> resetTeacherPassword(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(adminService.resetTeacherPassword(id, payload));
    }

    @PatchMapping("/teachers/{id}/suspend")
    public ResponseEntity<MessageResponse> suspendTeacher(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.suspendTeacher(id));
    }

    @PatchMapping("/teachers/{id}/activate")
    public ResponseEntity<MessageResponse> activateTeacher(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.activateTeacher(id));
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<MessageResponse> deleteTeacher(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deleteTeacher(id));
    }

    @PatchMapping("/teachers/bulk/suspend")
    public ResponseEntity<MessageResponse> bulkSuspendTeachers(@RequestBody BulkActionRequest request) {
        return ResponseEntity.ok(adminService.bulkSuspendTeachers(request));
    }

    @PatchMapping("/teachers/bulk/activate")
    public ResponseEntity<MessageResponse> bulkActivateTeachers(@RequestBody BulkActionRequest request) {
        return ResponseEntity.ok(adminService.bulkActivateTeachers(request));
    }

    @DeleteMapping("/teachers/bulk")
    public ResponseEntity<MessageResponse> bulkDeleteTeachers(@RequestBody BulkActionRequest request) {
        return ResponseEntity.ok(adminService.bulkDeleteTeachers(request));
    }

    @PostMapping("/students/upload")
    public ResponseEntity<?> uploadStudents(
            @RequestParam("file") MultipartFile file, 
            @RequestParam(value = "batchName", required = false) String batchName,
            @RequestParam(value = "courseName", required = false) String courseName) {
        try {
            return ResponseEntity.ok(adminService.uploadStudents(file, batchName, courseName));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/students")
    public ResponseEntity<Map<String, Object>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @PatchMapping("/students/{id}/suspend")
    public ResponseEntity<MessageResponse> suspendStudent(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        String reason = payload != null ? payload.get("reason") : null;
        return ResponseEntity.ok(adminService.suspendStudent(id, reason));
    }

    @PatchMapping("/students/{id}/activate")
    public ResponseEntity<MessageResponse> activateStudent(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.activateStudent(id));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<MessageResponse> deleteStudent(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deleteStudent(id));
    }

    @PatchMapping("/students/bulk/suspend")
    public ResponseEntity<MessageResponse> bulkSuspendStudents(@RequestBody BulkActionRequest request) {
        return ResponseEntity.ok(adminService.bulkSuspendStudents(request));
    }

    @PatchMapping("/students/bulk/activate")
    public ResponseEntity<MessageResponse> bulkActivateStudents(@RequestBody BulkActionRequest request) {
        return ResponseEntity.ok(adminService.bulkActivateStudents(request));
    }

    @DeleteMapping("/students/bulk")
    public ResponseEntity<MessageResponse> bulkDeleteStudents(@RequestBody BulkActionRequest request) {
        return ResponseEntity.ok(adminService.bulkDeleteStudents(request));
    }
}
