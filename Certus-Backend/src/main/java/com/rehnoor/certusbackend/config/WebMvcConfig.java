package com.rehnoor.certusbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Only serve package and category images publicly.
        // SECURITY / PRIVACY: Explicitly DO NOT register /uploads/reports/** or general /uploads/** 
        // to prevent unauthorized public access to sensitive patient medical reports.

        registry.addResourceHandler("/uploads/packages/**")
                .addResourceLocations("file:./uploads/packages/", "file:../uploads/packages/", "file:/app/uploads/packages/");

        registry.addResourceHandler("/uploads/package-categories/**")
                .addResourceLocations("file:./uploads/package-categories/", "file:../uploads/package-categories/", "file:/app/uploads/package-categories/");

        registry.addResourceHandler("/uploads/categories/**")
                .addResourceLocations("file:./uploads/categories/", "file:../uploads/categories/", "file:/app/uploads/categories/");

        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations("file:./uploads/images/", "file:../uploads/images/", "file:/app/uploads/images/");
    }
}
