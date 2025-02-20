package com.softeer5.uniro_backend.common.redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.alibaba.fastjson2.support.spring6.data.redis.FastJsonRedisSerializer;
import com.softeer5.uniro_backend.map.service.vo.LightRoutes;

@Configuration
public class RedisConfig {

	@Bean
	public RedisTemplate redisTemplate(RedisConnectionFactory connectionFactory) {
		RedisTemplate template = new RedisTemplate<>();
		template.setConnectionFactory(connectionFactory);

		// 키는 String, 값은 FastJson으로 변환된 JSON 문자열 저장
		StringRedisSerializer serializer = new StringRedisSerializer();
		FastJsonRedisSerializer<LightRoutes> fastJsonRedisSerializer = new FastJsonRedisSerializer<>(LightRoutes.class);

		template.setKeySerializer(serializer);
		template.setValueSerializer(fastJsonRedisSerializer);

		return template;
	}
}
