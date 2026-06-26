package com.alp.flashcard.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class DeckSummaryResponse {

    private UUID id;
    private UUID resourceId;
    private String title;
    private int cardCount;
    private Instant createdAt;
}
