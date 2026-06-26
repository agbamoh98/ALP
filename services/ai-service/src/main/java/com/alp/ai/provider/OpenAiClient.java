package com.alp.ai.provider;

import com.alp.ai.exception.AppException;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;

@Service
@Slf4j
public class OpenAiClient {

    private final RestClient client;
    private final String model;
    private final int maxTokens;
    private final double temperature;
    private final boolean configured;

    public OpenAiClient(
            @Value("${ai.openai.api-key:}") String apiKey,
            @Value("${ai.openai.model}") String model,
            @Value("${ai.openai.max-tokens}") int maxTokens,
            @Value("${ai.openai.temperature}") double temperature
    ) {
        this.model = model;
        this.maxTokens = maxTokens;
        this.temperature = temperature;
        this.configured = apiKey != null && !apiKey.isBlank();

        this.client = RestClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + (configured ? apiKey : ""))
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public ChatResult chat(List<ChatMessage> messages) {
        ensureConfigured();

        ChatRequest request = new ChatRequest();
        request.setModel(model);
        request.setMessages(messages);
        request.setMaxTokens(maxTokens);
        request.setTemperature(temperature);

        try {
            ChatResponse response = client.post()
                    .uri("/chat/completions")
                    .body(request)
                    .retrieve()
                    .body(ChatResponse.class);

            if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
                throw new AppException("Empty response from OpenAI.", HttpStatus.BAD_GATEWAY);
            }

            String content = response.getChoices().getFirst().getMessage().getContent();
            Usage usage = response.getUsage() != null ? response.getUsage() : new Usage();

            return new ChatResult(
                    content,
                    model,
                    usage.getPromptTokens(),
                    usage.getCompletionTokens(),
                    usage.getTotalTokens()
            );
        } catch (RestClientResponseException e) {
            log.error("OpenAI API error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new AppException(
                    "AI provider error: " + extractOpenAiMessage(e.getResponseBodyAsString()),
                    HttpStatus.BAD_GATEWAY
            );
        }
    }

    public String getModel() {
        return model;
    }

    public boolean isConfigured() {
        return configured;
    }

    private void ensureConfigured() {
        if (!configured) {
            throw new AppException(
                    "OpenAI API key is not configured. Set OPENAI_API_KEY in services/ai-service/.env",
                    HttpStatus.SERVICE_UNAVAILABLE
            );
        }
    }

    private String extractOpenAiMessage(String body) {
        if (body == null || body.isBlank()) return "Unknown error";
        if (body.contains("invalid_api_key")) return "Invalid OpenAI API key.";
        if (body.contains("insufficient_quota")) return "OpenAI quota exceeded. Check billing.";
        return "Request failed. Check API key and billing.";
    }

    public record ChatMessage(String role, String content) {}

    public record ChatResult(
            String content,
            String model,
            int promptTokens,
            int completionTokens,
            int totalTokens
    ) {}

    @Data
    static class ChatRequest {
        private String model;
        private List<ChatMessage> messages;
        @JsonProperty("max_tokens")
        private int maxTokens;
        private double temperature;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class ChatResponse {
        private List<Choice> choices;
        private Usage usage;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class Choice {
        private ResponseMessage message;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class ResponseMessage {
        private String role;
        private String content;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class Usage {
        @JsonProperty("prompt_tokens")
        private int promptTokens;
        @JsonProperty("completion_tokens")
        private int completionTokens;
        @JsonProperty("total_tokens")
        private int totalTokens;
    }
}
