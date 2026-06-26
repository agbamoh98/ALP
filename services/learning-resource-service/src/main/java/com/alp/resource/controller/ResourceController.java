package com.alp.resource.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Placeholder controller. Full implementation in Version 0.2.
 */
@RestController
public class ResourceController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "service", "learning-resource-service",
                "status", "UP",
                "version", "0.1.0"
        ));
    }
}
