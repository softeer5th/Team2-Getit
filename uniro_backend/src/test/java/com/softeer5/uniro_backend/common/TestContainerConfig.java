package com.softeer5.uniro_backend.common;

import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.utility.DockerImageName;

public class TestContainerConfig implements BeforeAllCallback {

	private static final String REDIS_IMAGE = "redis:7.0.8-alpine";
	private static final int REDIS_PORT = 6379;
	private static GenericContainer<?> redis;

	@Override
	public void beforeAll(ExtensionContext context) {
		if (redis == null) {
			redis = new GenericContainer<>(DockerImageName.parse(REDIS_IMAGE))
				.withExposedPorts(REDIS_PORT)
				.withReuse(true)
				.waitingFor(Wait.forListeningPort()); // Redis가 포트를 열 때까지 기다림
			redis.start();
		}

		if(redis != null){
			System.setProperty("spring.data.redis.host", redis.getHost());
			System.setProperty("spring.data.redis.port", String.valueOf(redis.getMappedPort(REDIS_PORT)));
		}
	}
}

