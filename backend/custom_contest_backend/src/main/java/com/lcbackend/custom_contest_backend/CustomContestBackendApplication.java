package com.lcbackend.custom_contest_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CustomContestBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CustomContestBackendApplication.class, args);
		System.out.println("SpringBoot Application is started successfully!");
	}

}
