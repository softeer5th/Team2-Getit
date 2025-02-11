package com.softeer5.uniro_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class UniroBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(UniroBackendApplication.class, args);
	}

}
