package com.alp.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class ChatRequest {

    private UUID resourceId;

    @NotBlank(message = "Content is required")
    private String content;

    @NotBlank(message = "Message is required")
    @Size(max = 4000)
    private String message;

    private List<ChatMessageDto> history = new ArrayList<>();

    @Data
    public static class ChatMessageDto {
        private String role;
        private String content;
    }
}
