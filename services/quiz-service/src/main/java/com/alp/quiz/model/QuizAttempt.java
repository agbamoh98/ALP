package com.alp.quiz.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "quiz_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private SavedQuiz quiz;

    private int score;
    private int totalQuestions;

    @Column(nullable = false, updatable = false)
    private Instant completedAt;

    @PrePersist
    void prePersist() {
        if (completedAt == null) completedAt = Instant.now();
    }
}
