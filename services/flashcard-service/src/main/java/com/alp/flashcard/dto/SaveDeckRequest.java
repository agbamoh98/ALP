package com.alp.flashcard.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SaveDeckRequest {

    @NotNull
    private UUID resourceId;

    private String title;

    @NotEmpty
    @Valid
    private List<CardDto> cards;

    @Data
    public static class CardDto {
        @NotBlank
        private String front;
        @NotBlank
        private String back;
        private String difficulty;
        private String category;
    }
}
