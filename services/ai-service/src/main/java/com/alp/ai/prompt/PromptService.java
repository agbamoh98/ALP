package com.alp.ai.prompt;

import com.alp.ai.exception.AppException;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class PromptService {

    private static final Pattern VERSION_PATTERN = Pattern.compile("\\*\\*Version:\\*\\*\\s*([\\d.]+)");
    private static final String SYSTEM_HEADER = "## System Prompt";

    private final Path promptsDir;
    private final Map<String, LoadedPrompt> cache = new ConcurrentHashMap<>();

    public PromptService(@Value("${ai.prompts-dir}") String promptsDir) {
        this.promptsDir = Paths.get(promptsDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    void loadPrompts() {
        log.info("Loading prompts from: {}", promptsDir);
        load("summarizer", "summarizer.md");
        load("chat", "chat.md");
        load("flashcards", "flashcards.md");
        load("quiz", "quiz.md");
    }

    public LoadedPrompt getSummarizer() { return require("summarizer"); }
    public LoadedPrompt getChat() { return require("chat"); }
    public LoadedPrompt getFlashcards() { return require("flashcards"); }
    public LoadedPrompt getQuiz() { return require("quiz"); }

    private LoadedPrompt require(String key) {
        LoadedPrompt prompt = cache.get(key);
        if (prompt == null) {
            throw new AppException("Prompt not loaded: " + key, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return prompt;
    }

    private void load(String key, String filename) {
        Path file = promptsDir.resolve(filename);
        if (!Files.exists(file)) {
            log.warn("Prompt file missing: {}", file);
            return;
        }
        try {
            String raw = Files.readString(file);
            String version = extractVersion(raw);
            String systemPrompt = extractSystemPrompt(raw);
            cache.put(key, new LoadedPrompt(key, version, systemPrompt));
            log.info("Loaded prompt '{}' v{}", key, version);
        } catch (IOException e) {
            log.error("Failed to load prompt {}: {}", filename, e.getMessage());
        }
    }

    private String extractVersion(String raw) {
        Matcher m = VERSION_PATTERN.matcher(raw);
        return m.find() ? m.group(1) : "unknown";
    }

    private String extractSystemPrompt(String raw) {
        int start = raw.indexOf(SYSTEM_HEADER);
        if (start < 0) return raw.trim();
        String body = raw.substring(start + SYSTEM_HEADER.length()).trim();
        int footer = body.indexOf("\n---\n*Prompt maintained");
        if (footer > 0) body = body.substring(0, footer).trim();
        return body;
    }

    @Getter
    public static class LoadedPrompt {
        private final String name;
        private final String version;
        private final String systemPrompt;

        public LoadedPrompt(String name, String version, String systemPrompt) {
            this.name = name;
            this.version = version;
            this.systemPrompt = systemPrompt;
        }
    }
}
