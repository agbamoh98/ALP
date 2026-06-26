package com.alp.quiz.repository;

import com.alp.quiz.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {

    long countByUserId(UUID userId);
}
