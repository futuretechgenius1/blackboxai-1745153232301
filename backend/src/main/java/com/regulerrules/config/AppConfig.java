package com.regulerrules.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    // Flag to enable or disable mock data
    @Bean
    public Boolean enableMockData() {
        return true; // Set to false to disable mock data and use real DB data
    }
}
