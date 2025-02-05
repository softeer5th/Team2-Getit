package com.softeer5.uniro_backend.common.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class SwaggerConfig {

	@Bean
	public OpenAPI openAPI() {
		Server devServer = new Server();
		devServer.setUrl("https://api.uniro.site");
		OpenAPI info = new OpenAPI().components(new Components()).info(new Info());
		info.setServers(List.of(devServer));
		return info;
	}

}
