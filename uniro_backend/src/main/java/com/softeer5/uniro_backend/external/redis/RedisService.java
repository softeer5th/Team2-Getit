package com.softeer5.uniro_backend.external.redis;

import java.time.Duration;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static com.softeer5.uniro_backend.common.constant.UniroConst.MAX_CACHE_SIZE;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisService {

	private final RedisTemplate redisTemplate;
	private final StringRedisTemplate stringRedisTemplate;

	public void saveData(String key, Object value) {
		redisTemplate.opsForValue().set(key, value, Duration.ofMinutes(10000));
	}

	public void saveDataToString(String key, Object value) {
		stringRedisTemplate.opsForValue().set(key, value.toString(), Duration.ofMinutes(10000));
	}

	public Object getData(String key) {
		return redisTemplate.opsForValue().get(key);
	}

	public String getDataToString(String key){
		return stringRedisTemplate.opsForValue().get(key);
	}
	public boolean hasData(String key){
		return redisTemplate.hasKey(key);
	}

	public void deleteRoutesData(String key, int batchNumber) {
		String redisKeyPrefix = key + ":";

		for(int i=1; i<= Math.max(MAX_CACHE_SIZE,batchNumber); i++){
			redisTemplate.delete(redisKeyPrefix + i);
		}
	}
}
