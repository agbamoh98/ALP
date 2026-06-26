package com.alp.flashcard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class FlashcardServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(FlashcardServiceApplication.class, args);
    }
}
