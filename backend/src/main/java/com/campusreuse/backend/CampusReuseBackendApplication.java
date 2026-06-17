package com.campusreuse.backend;

import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.*;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableCaching
public class CampusReuseBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(CampusReuseBackendApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
