package com.softeer5.uniro_backend.map.cache;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RedisService {

	private final RedisTemplate<String, Object> redisTemplate;
	private final Map<String, Boolean> cacheMap = new HashMap<>();

	public void saveData(String key, Object value) {
		redisTemplate.opsForValue().set(key, value, Duration.ofMinutes(1000)); // 10분 TTL
		cacheMap.put(key, true);
	}

	public Object getData(String key) {
		Object data = redisTemplate.opsForValue().get(key);
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

