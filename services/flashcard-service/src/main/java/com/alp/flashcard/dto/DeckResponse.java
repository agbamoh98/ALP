package com.alp.flashcard.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class DeckResponse {

    private UUID id;
    private UUID resourceId;
    private String title;
    private int cardCount;
    private Instant createdAt;
    private List<CardResponse> cards;

    @Data
    @Builder
    public static class CardResponse {
        private UUID id;
        private String front;
        private String back;
        private String difficulty;
        private String category;
        private int sortOrder;
    }
}
