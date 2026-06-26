package com.alp.quiz.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

/** Placeholder controller. Full implementation in Version 0.3. */
@RestController
public class QuizController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("service", "quiz-service", "status", "UP", "version", "0.1.0"));
    }
}
