package com.alp.ai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class FlashcardRequest {

    private UUID resourceId;

    @NotBlank(message = "Content is required")
    private String content;

    @Min(1) @Max(30)
    private int count = 10;
}
