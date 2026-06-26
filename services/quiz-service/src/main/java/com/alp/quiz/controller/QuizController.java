package com.alp.quiz.controller;

import com.alp.quiz.dto.*;
import com.alp.quiz.security.AuthenticatedUser;
import com.alp.quiz.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/")
    public ResponseEntity<QuizResponse> saveQuiz(
            @Valid @RequestBody SaveQuizRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quizService.saveQuiz(request, user.getId(), user.getRole()));
    }

    @GetMapping("/")
    public ResponseEntity<List<QuizSummaryResponse>> listQuizzes(
            @RequestParam UUID resourceId,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(quizService.listQuizzes(user.getId(), resourceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuiz(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(quizService.getQuiz(id, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        quizService.deleteQuiz(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/attempts")
    public ResponseEntity<Void> saveAttempt(
            @PathVariable UUID id,
            @Valid @RequestBody SaveAttemptRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        quizService.saveAttempt(id, request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(Map.of("count", quizService.countByUser(user.getId())));
    }

    @GetMapping("/attempts/count")
    public ResponseEntity<Map<String, Long>> attemptCount(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(Map.of("count", quizService.countAttemptsByUser(user.getId())));
    }

    @GetMapping("/limits")
    public ResponseEntity<PlanLimitsResponse> limits(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(quizService.getPlanLimits(user.getId(), user.getRole()));
    }
}
