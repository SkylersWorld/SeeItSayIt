package com.ceas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for simpler API usage
            .authorizeHttpRequests(authorize -> authorize
                // Allow public access to authentication and WebSocket endpoints
                .requestMatchers("/api/auth/**", "/ws/**", "/topic/**", "/app/**").permitAll()
                // Require authentication for all other requests (e.g., /api/alerts)
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Mandatory for securely hashing user passwords
        return new BCryptPasswordEncoder();
    }
}
