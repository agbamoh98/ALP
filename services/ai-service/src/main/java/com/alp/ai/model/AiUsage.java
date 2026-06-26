package com.alp.ai.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_usage", indexes = {
    @Index(name = "idx_ai_usage_user_id", columnList = "userId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    private UUID resourceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AiFeatureType featureType;

    @Column(nullable = false, length = 64)
    private String model;

    @Column(length = 32)
    private String promptVersion;

    private int promptTokens;
    private int completionTokens;
    private int totalTokens;
    private long responseTimeMs;

    @Column(nullable = false)
    @Builder.Default
    private boolean success = true;

    @Column(length = 500)
    private String errorMessage;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
