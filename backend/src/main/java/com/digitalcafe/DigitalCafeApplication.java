package com.digitalcafe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class DigitalCafeApplication {

	public static void main(String[] args) {
		SpringApplication.run(DigitalCafeApplication.class, args);
	}

}
