package com.campusreuse.backend;

import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.*;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CampusReuseBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(CampusReuseBackendApplication.class, args);
    }
}
