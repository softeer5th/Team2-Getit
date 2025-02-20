package com.softeer5.uniro_backend.common.redis;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisService {

	private final RedisTemplate redisTemplate;
	private final Map<String, Boolean> cacheMap = new HashMap<>();

	public void saveData(String key, Object value) {
		long startTime = System.nanoTime();
		redisTemplate.opsForValue().set(key, value, Duration.ofMinutes(1000)); // 10분 TTL
		long endTime = System.nanoTime();

		long duration = TimeUnit.NANOSECONDS.toMicros(endTime - startTime);
		log.info("🔴🔴🔴🔴🔴🔴🔴 Redis 직렬화 및 저장 시간: {} 마이크로초", duration);

		cacheMap.put(key, true);
	}

	public Object getData(String key) {
		long startTime = System.nanoTime();
		Object data = redisTemplate.opsForValue().get(key);
		long endTime = System.nanoTime();

		long duration = TimeUnit.NANOSECONDS.toMicros(endTime - startTime);
		log.info("🟢🟢🟢🟢🟢🟢🟢 Redis 역직렬화 및 조회 시간: {} 마이크로초", duration);
		cacheMap.put(key, true);
		return data;
	}

	public boolean hasData(String key){
		return cacheMap.containsKey(key);
	}

	public void deleteData(String key) {
		redisTemplate.delete(key);
		cacheMap.remove(key);
	}
}
