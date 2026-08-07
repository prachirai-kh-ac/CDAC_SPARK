package com.cdac.spark.userexam.repository;

import com.cdac.spark.userexam.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.List;


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPrn(String prn);
    Optional<User> findByEmailOrPrn(String email, String prn);
    Boolean existsByEmail(String email);
    Boolean existsByPrn(String prn);
    List<User> findByRole(String role);
    long countByRole(String role);
    @Query("SELECT DISTINCT u.batchName FROM User u WHERE u.batchName IS NOT NULL")
   
    List<String> findDistinctBatchNames();
    List<User> findByBatchName(String batchName);
    long countByBatchName(String batchName);
}