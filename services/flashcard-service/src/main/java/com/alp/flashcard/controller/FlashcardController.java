package com.alp.flashcard.controller;

import com.alp.flashcard.dto.DeckResponse;
import com.alp.flashcard.dto.DeckSummaryResponse;
import com.alp.flashcard.dto.PlanLimitsResponse;
import com.alp.flashcard.dto.SaveDeckRequest;
import com.alp.flashcard.security.AuthenticatedUser;
import com.alp.flashcard.service.FlashcardDeckService;
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
public class FlashcardController {

    private final FlashcardDeckService deckService;

    @PostMapping("/decks")
    public ResponseEntity<DeckResponse> saveDeck(
            @Valid @RequestBody SaveDeckRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(deckService.saveDeck(request, user.getId(), user.getRole()));
    }

    @GetMapping("/decks")
    public ResponseEntity<List<DeckSummaryResponse>> listDecks(
            @RequestParam UUID resourceId,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(deckService.listDecks(user.getId(), resourceId));
    }

    @GetMapping("/decks/{id}")
    public ResponseEntity<DeckResponse> getDeck(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(deckService.getDeck(id, user.getId()));
    }

    @DeleteMapping("/decks/{id}")
    public ResponseEntity<Void> deleteDeck(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        deckService.deleteDeck(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(Map.of("count", deckService.countByUser(user.getId())));
    }

    @GetMapping("/limits")
    public ResponseEntity<PlanLimitsResponse> limits(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(deckService.getPlanLimits(user.getId(), user.getRole()));
    }
}
