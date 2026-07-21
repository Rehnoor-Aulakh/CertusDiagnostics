package com.rehnoor.certusbackend.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // Allows us to use annotations like @PreAuthorize on controllers
public class SecurityConfig {
    // 1. Create our custom JWT bouncer filter as a managed Spring Bean
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }
    // so this is an object but this is managed by Spring

    // 2. Define BCrypt as our strict hashing encoder for passwords
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    // 3. Expose the standard AuthenticationManager bean to process incoming logins
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception{
        return authConfig.getAuthenticationManager();
    }

    @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    // 4. Configure cross origin resource sharing (CORS) to accept requests from both frontends
    @Bean
    public CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration configuration = new CorsConfiguration();
        // Explicitly authorize configured URLs
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
        configuration.setAllowCredentials(true);    // Permits cookies, session tokens, or Auth headers

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);  // Apply this rule to all API endpoints
        return source;

    }

    // 5. Build the core HTTP Security Filter Chain
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http
                // Inject our cors security context rules
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Disabel CSRF (Cross-Site Request Forgery) protections because tokens are stateless
                .csrf(AbstractHttpConfigurer::disable)

                // Never create a stateful server-side HTTPSession context
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                //configure route endpoint route guard matching rules
                .authorizeHttpRequests(auth -> auth
                        // Allow both separate frontends to access login/auth endpoints freely
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // Strict separation rules for internal features
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/patient/**").hasRole("PATIENT")

                        // Catch-all requirement rule for any other unmapped endpoint
                        .anyRequest().authenticated()

                );
        // Crucial: Inject our custom JwtAuthenticationFilter BEFORE the standard username-password verification filter
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


}
