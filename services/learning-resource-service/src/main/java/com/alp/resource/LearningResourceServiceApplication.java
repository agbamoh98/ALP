package com.alp.resource;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class LearningResourceServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LearningResourceServiceApplication.class, args);
    }
}
