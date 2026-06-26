package com.alp.ai.service;

import com.alp.ai.dto.*;
import com.alp.ai.model.AiFeatureType;
import com.alp.ai.model.AiUsage;
import com.alp.ai.prompt.PromptService;
import com.alp.ai.provider.OpenAiClient;
import com.alp.ai.repository.AiUsageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final OpenAiClient openAiClient;
    private final PromptService promptService;
    private final AiUsageRepository usageRepository;

    @Value("${ai.max-content-chars:12000}")
    private int maxContentChars;

    @Transactional
    public AiResponse summarize(SummarizeRequest request, UUID userId) {
        var prompt = promptService.getSummarizer();
        String content = truncate(request.getContent());

        String userMessage = """
                [CONTENT]
                %s
                [/CONTENT]

                [SUMMARY_TYPE]
                %s
                [/SUMMARY_TYPE]
                """.formatted(content, request.getSummaryType().name());

        return execute(userId, request.getResourceId(), AiFeatureType.SUMMARY,
                prompt.getVersion(), prompt.getSystemPrompt(), userMessage);
    }

    @Transactional
    public AiResponse generateFlashcards(FlashcardRequest request, UUID userId) {
        var prompt = promptService.getFlashcards();
        String content = truncate(request.getContent());

        String userMessage = """
                [CONTENT]
                %s
                [/CONTENT]

                [COUNT]
                %d
                [/COUNT]
                """.formatted(content, request.getCount());

        return execute(userId, request.getResourceId(), AiFeatureType.FLASHCARD,
                prompt.getVersion(), prompt.getSystemPrompt(), userMessage);
    }

    @Transactional
    public AiResponse generateQuiz(QuizRequest request, UUID userId) {
        var prompt = promptService.getQuiz();
        String content = truncate(request.getContent());

        String userMessage = """
                [CONTENT]
                %s
                [/CONTENT]

                [QUESTION_TYPE]
                %s
                [/QUESTION_TYPE]

                [DIFFICULTY]
                %s
                [/DIFFICULTY]

                [COUNT]
                %d
                [/COUNT]
                """.formatted(content, request.getQuestionType(), request.getDifficulty(), request.getCount());

        return execute(userId, request.getResourceId(), AiFeatureType.QUIZ,
                prompt.getVersion(), prompt.getSystemPrompt(), userMessage);
    }

    @Transactional
    public AiResponse chat(ChatRequest request, UUID userId) {
        var prompt = promptService.getChat();
        String content = truncate(request.getContent());

        List<OpenAiClient.ChatMessage> messages = new ArrayList<>();
        messages.add(new OpenAiClient.ChatMessage("system", prompt.getSystemPrompt()));
        messages.add(new OpenAiClient.ChatMessage("system",
                "[DOCUMENT_CONTEXT]\n" + content + "\n[/DOCUMENT_CONTEXT]"));

        if (request.getHistory() != null) {
            for (ChatRequest.ChatMessageDto h : request.getHistory()) {
                if (h.getRole() != null && h.getContent() != null) {
                    messages.add(new OpenAiClient.ChatMessage(h.getRole(), h.getContent()));
                }
            }
        }

        messages.add(new OpenAiClient.ChatMessage("user", request.getMessage()));

        long start = System.currentTimeMillis();
        OpenAiClient.ChatResult result = openAiClient.chat(messages);
        long elapsed = System.currentTimeMillis() - start;

        logUsage(userId, request.getResourceId(), AiFeatureType.CHAT, result, prompt.getVersion(), elapsed, true, null);

        return AiResponse.builder()
                .result(result.content())
                .model(result.model())
                .promptVersion(prompt.getVersion())
                .promptTokens(result.promptTokens())
                .completionTokens(result.completionTokens())
                .totalTokens(result.totalTokens())
                .responseTimeMs(elapsed)
                .build();
    }

    public boolean isConfigured() {
        return openAiClient.isConfigured();
    }

    public String getActiveModel() {
        return openAiClient.getModel();
    }

    private AiResponse execute(
            UUID userId,
            UUID resourceId,
            AiFeatureType feature,
            String promptVersion,
            String systemPrompt,
            String userMessage
    ) {
        long start = System.currentTimeMillis();
        try {
            OpenAiClient.ChatResult result = openAiClient.chat(List.of(
                    new OpenAiClient.ChatMessage("system", systemPrompt),
                    new OpenAiClient.ChatMessage("user", userMessage)
            ));
            long elapsed = System.currentTimeMillis() - start;
            logUsage(userId, resourceId, feature, result, promptVersion, elapsed, true, null);

            return AiResponse.builder()
                    .result(result.content())
                    .model(result.model())
                    .promptVersion(promptVersion)
                    .promptTokens(result.promptTokens())
                    .completionTokens(result.completionTokens())
                    .totalTokens(result.totalTokens())
                    .responseTimeMs(elapsed)
                    .build();
        } catch (Exception e) {
            long elapsed = System.currentTimeMillis() - start;
            logUsage(userId, resourceId, feature, null, promptVersion, elapsed, false, e.getMessage());
            throw e;
        }
    }

    private void logUsage(
            UUID userId,
            UUID resourceId,
            AiFeatureType feature,
            OpenAiClient.ChatResult result,
            String promptVersion,
            long elapsed,
            boolean success,
            String error
    ) {
        AiUsage usage = AiUsage.builder()
                .userId(userId)
                .resourceId(resourceId)
                .featureType(feature)
                .model(result != null ? result.model() : openAiClient.getModel())
                .promptVersion(promptVersion)
                .promptTokens(result != null ? result.promptTokens() : 0)
                .completionTokens(result != null ? result.completionTokens() : 0)
                .totalTokens(result != null ? result.totalTokens() : 0)
                .responseTimeMs(elapsed)
                .success(success)
                .errorMessage(error != null && error.length() > 500 ? error.substring(0, 500) : error)
                .build();
        usageRepository.save(usage);
        log.debug("AI usage logged: {} tokens, {}ms", usage.getTotalTokens(), elapsed);
    }

    private String truncate(String content) {
        if (content == null) return "";
        if (content.length() <= maxContentChars) return content;
        return content.substring(0, maxContentChars) + "\n\n[Content truncated for AI context limit.]";
    }
}
