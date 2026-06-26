package com.alp.ai.controller;

import com.alp.ai.dto.*;
import com.alp.ai.security.AuthenticatedUser;
import com.alp.ai.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "configured", aiService.isConfigured(),
                "provider", "openai",
                "model", aiService.getActiveModel()
        ));
    }

    @PostMapping("/summarize")
    public ResponseEntity<AiResponse> summarize(
            @Valid @RequestBody SummarizeRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(aiService.summarize(request, user.getId(), user.getRole()));
    }

    @PostMapping("/flashcards")
    public ResponseEntity<AiResponse> flashcards(
            @Valid @RequestBody FlashcardRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(aiService.generateFlashcards(request, user.getId()));
    }

    @PostMapping("/quizzes")
    public ResponseEntity<AiResponse> quizzes(
            @Valid @RequestBody QuizRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(aiService.generateQuiz(request, user.getId()));
    }

    @PostMapping("/chat")
    public ResponseEntity<AiResponse> chat(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(aiService.chat(request, user.getId()));
    }
}
