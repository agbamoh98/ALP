package com.alp.quiz.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class QuizSummaryResponse {

    private UUID id;
    private UUID resourceId;
    private String title;
    private String questionType;
    private String difficulty;
    private int questionCount;
    private Instant createdAt;
}
