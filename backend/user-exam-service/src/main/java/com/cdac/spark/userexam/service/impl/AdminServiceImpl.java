package com.cdac.spark.userexam.service.impl;

import com.cdac.spark.userexam.dto.req.BulkActionRequest;
import com.cdac.spark.userexam.dto.req.TeacherCreateRequest;
import com.cdac.spark.userexam.dto.res.ErrorDetail;
import com.cdac.spark.userexam.dto.res.MessageResponse;
import com.cdac.spark.userexam.dto.res.UploadResponse;
import com.cdac.spark.userexam.entity.User;
import com.cdac.spark.userexam.exception.ResourceNotFoundException;
import com.cdac.spark.userexam.repository.UserRepository;
import com.cdac.spark.userexam.service.interfaces.AdminService;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public MessageResponse createTeacher(TeacherCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use.");
        }
        User teacher = new User();
        teacher.setFullName(request.getFullName());
        teacher.setEmail(request.getEmail());
        teacher.setPassword(passwordEncoder.encode(request.getPassword()));
        teacher.setRole("ROLE_TEACHER");
        teacher.setStatus("ACTIVE");
        teacher.setMobileNumber(request.getPhoneNumber());
        userRepository.save(teacher);
        return new MessageResponse("Teacher created successfully.");
    }

    @Override
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", userRepository.countByRole("ROLE_STUDENT"));
        stats.put("totalTeachers", userRepository.countByRole("ROLE_TEACHER"));
        stats.put("globalPassRate", "N/A");
        stats.put("activeLiveExams", "N/A");
        
        return Map.of("success", true, "data", stats);
    }

    @Override
    public Map<String, Object> getAllTeachers() {
        List<User> teachers = userRepository.findByRole("ROLE_TEACHER");
        List<Map<String, Object>> data = new ArrayList<>();
        for (User t : teachers) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getUserId().toString());
            map.put("fullName", t.getFullName());
            map.put("username", t.getEmail());
            map.put("email", t.getEmail());
            map.put("phoneNumber", t.getMobileNumber() != null ? t.getMobileNumber() : "N/A");
            map.put("isActive", "ACTIVE".equals(t.getStatus()));
            map.put("createdAt", t.getCreatedAt() != null ? t.getCreatedAt().toString() : "2023-01-01T00:00:00Z");
            map.put("lastLogin", null);
            data.add(map);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return response;
    }

    @Override
    public MessageResponse updateTeacher(Long id, Map<String, String> payload) {
        User teacher = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        teacher.setFullName(payload.get("fullName"));
        teacher.setEmail(payload.get("email"));
        userRepository.save(teacher);
        return new MessageResponse("Teacher updated successfully.");
    }

    @Override
    public MessageResponse resetTeacherPassword(Long id, Map<String, String> payload) {
        User teacher = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        teacher.setPassword(passwordEncoder.encode(payload.get("newPassword")));
        userRepository.save(teacher);
        return new MessageResponse("Password reset successfully.");
    }

    @Override
    public MessageResponse suspendTeacher(Long id) {
        User teacher = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        teacher.setStatus("SUSPENDED");
        userRepository.save(teacher);
        return new MessageResponse("Teacher suspended successfully");
    }

    @Override
    public MessageResponse activateTeacher(Long id) {
        User teacher = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        teacher.setStatus("ACTIVE");
        userRepository.save(teacher);
        return new MessageResponse("Teacher activated successfully");
    }

    @Override
    public MessageResponse deleteTeacher(Long id) {
        userRepository.deleteById(id);
        return new MessageResponse("Teacher deleted successfully");
    }

    @Override
    public MessageResponse bulkSuspendTeachers(BulkActionRequest request) {
        if (request.getTeacherIds() != null && !request.getTeacherIds().isEmpty()) {
            List<User> teachers = userRepository.findAllById(request.getTeacherIds());
            teachers.forEach(t -> t.setStatus("SUSPENDED"));
            userRepository.saveAll(teachers);
        }
        return new MessageResponse("Teachers suspended successfully");
    }

    @Override
    public MessageResponse bulkActivateTeachers(BulkActionRequest request) {
        if (request.getTeacherIds() != null && !request.getTeacherIds().isEmpty()) {
            List<User> teachers = userRepository.findAllById(request.getTeacherIds());
            teachers.forEach(t -> t.setStatus("ACTIVE"));
            userRepository.saveAll(teachers);
        }
        return new MessageResponse("Teachers activated successfully");
    }

    @Override
    public MessageResponse bulkDeleteTeachers(BulkActionRequest request) {
        if (request.getTeacherIds() != null && !request.getTeacherIds().isEmpty()) {
            userRepository.deleteAllById(request.getTeacherIds());
        }
        return new MessageResponse("Teachers deleted successfully");
    }

    @Override
    public UploadResponse uploadStudents(MultipartFile file, String batchName, String courseName) {
        UploadResponse response = new UploadResponse();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Set<String> seenPrns = new HashSet<>();
            Set<String> seenEmails = new HashSet<>();
            
            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Skip header
                
                if ((row.getCell(0) == null || row.getCell(0).getCellType() == org.apache.poi.ss.usermodel.CellType.BLANK) && 
                    (row.getCell(1) == null || row.getCell(1).getCellType() == org.apache.poi.ss.usermodel.CellType.BLANK)) {
                    continue; 
                }
                
                response.setTotalRows(response.getTotalRows() + 1);

                org.apache.poi.ss.usermodel.DataFormatter dataFormatter = new org.apache.poi.ss.usermodel.DataFormatter();
                
                String prnNumber = "";
                if (row.getCell(0) != null) {
                    if (row.getCell(0).getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC) {
                        prnNumber = String.valueOf((long) row.getCell(0).getNumericCellValue());
                    } else {
                        prnNumber = dataFormatter.formatCellValue(row.getCell(0)).trim();
                    }
                }

                String fullName = "";
                if (row.getCell(1) != null) {
                    if (row.getCell(1).getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC) {
                        fullName = String.valueOf((long) row.getCell(1).getNumericCellValue());
                    } else {
                        fullName = dataFormatter.formatCellValue(row.getCell(1)).trim();
                    }
                }

                String mobileNumber = "";
                if (row.getCell(2) != null) {
                    if (row.getCell(2).getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC) {
                        mobileNumber = String.valueOf((long) row.getCell(2).getNumericCellValue());
                    } else {
                        mobileNumber = dataFormatter.formatCellValue(row.getCell(2)).trim();
                    }
                }

                String email = "";
                if (row.getCell(3) != null) {
                    email = dataFormatter.formatCellValue(row.getCell(3)).trim();
                }
                if (email.isEmpty()) {
                    email = prnNumber + "@student.cdac.in";
                }

                if (prnNumber.isEmpty()) {
                    response.setFailedRecords(response.getFailedRecords() + 1);
                    response.getErrors().add(new ErrorDetail(row.getRowNum() + 1, "PRN Number is required"));
                    continue;
                }

                if (!prnNumber.matches("^[0-9]+$")) {
                    response.setFailedRecords(response.getFailedRecords() + 1);
                    response.getErrors().add(new ErrorDetail(row.getRowNum() + 1, "PRN Number must contain digits only"));
                    continue;
                }
                
                if (!prnNumber.matches("^[0-9]{12}$")) {
                    response.setFailedRecords(response.getFailedRecords() + 1);
                    response.getErrors().add(new ErrorDetail(row.getRowNum() + 1, "PRN Number must be exactly 12 digits"));
                    continue;
                }

                if (seenPrns.contains(prnNumber) || userRepository.existsByPrn(prnNumber)) {
                    response.setFailedRecords(response.getFailedRecords() + 1);
                    if (!response.getDuplicatePrns().contains(prnNumber)) {
                        response.getDuplicatePrns().add(prnNumber);
                    }
                    response.getErrors().add(new ErrorDetail(row.getRowNum() + 1, "PRN Number already exists"));
                    continue;
                }

                if (seenEmails.contains(email) || userRepository.existsByEmail(email)) {
                    response.setFailedRecords(response.getFailedRecords() + 1);
                    response.getErrors().add(new ErrorDetail(row.getRowNum() + 1, "Email already exists"));
                    continue;
                }

                if (fullName.isEmpty()) {
                    response.setFailedRecords(response.getFailedRecords() + 1);
                    response.getErrors().add(new ErrorDetail(row.getRowNum() + 1, "Student Name is required"));
                    continue;
                }
                
                if (!fullName.matches("^[A-Za-z ]+$")) {
                    response.setFailedRecords(response.getFailedRecords() + 1);
                    response.getErrors().add(new ErrorDetail(row.getRowNum() + 1, "Student Name must contain only letters and spaces"));
                    continue;
                }
                
                if (fullName.length() < 2) {
                    response.setFailedRecords(response.getFailedRecords() + 1);
                    response.getErrors().add(new ErrorDetail(row.getRowNum() + 1, "Student Name must be at least 2 characters long"));
                    continue;
                }
                
                if (fullName.length() > 100) {
                    response.setFailedRecords(response.getFailedRecords() + 1);
                    response.getErrors().add(new ErrorDetail(row.getRowNum() + 1, "Student Name must not exceed 100 characters"));
                    continue;
                }
                
                seenPrns.add(prnNumber);
                seenEmails.add(email);

                User student = new User();
                student.setFullName(fullName);
                student.setPrn(prnNumber);
                student.setEmail(email); 
                student.setPassword(passwordEncoder.encode(prnNumber));
                student.setRole("ROLE_STUDENT");
                student.setStatus("ACTIVE");
                student.setBatchName(batchName);
                student.setCourseName(courseName);
                student.setMobileNumber(mobileNumber);
                userRepository.save(student);
                response.setSuccessfulRecords(response.getSuccessfulRecords() + 1);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload students: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getAllStudents() {
        List<User> students = userRepository.findByRole("ROLE_STUDENT");
        List<Map<String, Object>> data = new ArrayList<>();
        for (User s : students) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getUserId().toString());
            map.put("fullName", s.getFullName());
            map.put("username", s.getEmail()); 
            map.put("prn", s.getPrn());
            map.put("email", s.getEmail());
            map.put("isActive", "ACTIVE".equals(s.getStatus()));
            map.put("createdAt", "2023-01-01T00:00:00Z");
            map.put("batchName", s.getBatchName() != null ? s.getBatchName() : "Unassigned");
            map.put("courseName", s.getCourseName());
            map.put("suspensionReason", s.getSuspensionReason());
            data.add(map);
        }
        Map<String, Object> pageData = new HashMap<>();
        pageData.put("data", data);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", pageData);
        return response;
    }

    @Override
    public MessageResponse suspendStudent(Long id, String reason) {
        User student = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        student.setStatus("SUSPENDED");
        student.setSuspensionReason(reason);
        userRepository.save(student);
        return new MessageResponse("Student suspended successfully");
    }

    @Override
    public MessageResponse activateStudent(Long id) {
        User student = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        student.setStatus("ACTIVE");
        student.setSuspensionReason(null);
        userRepository.save(student);
        return new MessageResponse("Student activated successfully");
    }

    @Override
    public MessageResponse deleteStudent(Long id) {
        userRepository.deleteById(id);
        return new MessageResponse("Student deleted successfully");
    }

    @Override
    public MessageResponse bulkSuspendStudents(BulkActionRequest request) {
        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {
            List<User> students = userRepository.findAllById(request.getStudentIds());
            students.forEach(s -> {
                s.setStatus("SUSPENDED");
                s.setSuspensionReason(request.getReason());
            });
            userRepository.saveAll(students);
        }
        return new MessageResponse("Students suspended successfully");
    }

    @Override
    public MessageResponse bulkActivateStudents(BulkActionRequest request) {
        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {
            List<User> students = userRepository.findAllById(request.getStudentIds());
            students.forEach(s -> {
                s.setStatus("ACTIVE");
                s.setSuspensionReason(null);
            });
            userRepository.saveAll(students);
        }
        return new MessageResponse("Students activated successfully");
    }

    @Override
    public MessageResponse bulkDeleteStudents(BulkActionRequest request) {
        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {
            userRepository.deleteAllById(request.getStudentIds());
        }
        return new MessageResponse("Students deleted successfully");
    }
}
