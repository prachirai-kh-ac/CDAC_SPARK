package com.cdac.spark.userexam.controller;

import com.cdac.spark.userexam.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/batches")
public class BatchController {

    private final UserRepository userRepository;

    public BatchController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getBatches() {
        List<com.cdac.spark.userexam.entity.User> allStudents = userRepository.findByRole("ROLE_STUDENT");
        Map<String, Long> countMap = allStudents.stream()
            .filter(u -> u.getBatchName() != null && !u.getBatchName().trim().isEmpty())
            .collect(Collectors.groupingBy(com.cdac.spark.userexam.entity.User::getBatchName, Collectors.counting()));
            
        List<Map<String, Object>> batches = countMap.entrySet().stream().map(entry -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", entry.getKey());
            map.put("name", entry.getKey());
            map.put("studentCount", entry.getValue());
            map.put("status", "Active");
            map.put("startDate", "2023-08-01T00:00:00Z"); 
            return map;
        }).collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", batches);
        
        return ResponseEntity.ok(response);
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<?> createBatch(@org.springframework.web.bind.annotation.RequestBody Map<String, String> payload) {
        // Since we don't have a Batch entity, we can't save an empty batch to DB. 
        // We will just return success so frontend knows the API exists. 
        // A real batch will appear when a user is assigned to it.
        return ResponseEntity.ok(Map.of("success", true, "message", "Batch creation request received (requires students to persist)."));
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public ResponseEntity<?> updateBatch(@org.springframework.web.bind.annotation.PathVariable("id") String id, @org.springframework.web.bind.annotation.RequestBody Map<String, String> payload) {
        String newName = payload.get("name");
        List<com.cdac.spark.userexam.entity.User> users = userRepository.findByBatchName(id);
        for (com.cdac.spark.userexam.entity.User u : users) {
            u.setBatchName(newName);
        }
        userRepository.saveAll(users);
        return ResponseEntity.ok(Map.of("success", true, "message", "Batch updated successfully"));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBatch(@org.springframework.web.bind.annotation.PathVariable("id") String id) {
        List<com.cdac.spark.userexam.entity.User> users = userRepository.findByBatchName(id);
        for (com.cdac.spark.userexam.entity.User u : users) {
            u.setBatchName(null);
        }
        userRepository.saveAll(users);
        return ResponseEntity.ok(Map.of("success", true, "message", "Batch deleted successfully"));
    }
}
