package com.alp.quiz.repository;

import com.alp.quiz.model.SavedQuiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavedQuizRepository extends JpaRepository<SavedQuiz, UUID> {

    List<SavedQuiz> findByUserIdAndResourceIdOrderByCreatedAtDesc(UUID userId, UUID resourceId);

    Optional<SavedQuiz> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
