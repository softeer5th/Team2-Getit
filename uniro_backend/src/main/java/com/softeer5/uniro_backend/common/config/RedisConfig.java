package com.softeer5.uniro_backend.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.alibaba.fastjson2.support.spring6.data.redis.FastJsonRedisSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.softeer5.uniro_backend.external.redis.TimingRedisSerializer;
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

	// @Bean
	// public RedisTemplate<String, Object> redisTemplate(LettuceConnectionFactory connectionFactory) {
	// 	RedisTemplate<String, Object> template = new RedisTemplate<>();
	// 	template.setConnectionFactory(connectionFactory);
	//
	// 	ObjectMapper objectMapper = new ObjectMapper();
	// 	objectMapper.registerModule(new JavaTimeModule());
	// 	objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // ISO-8601 형식
	// 	objectMapper.activateDefaultTyping(objectMapper.getPolymorphicTypeValidator(),
	// 		ObjectMapper.DefaultTyping.NON_FINAL); // 타입 정보 추가
	//
	// 	StringRedisSerializer stringSerializer = new StringRedisSerializer();
	// 	GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);
	// 	TimingRedisSerializer timingJsonSerializer = new TimingRedisSerializer(jsonSerializer);
	//
	// 	// Key serializer 설정
	// 	template.setKeySerializer(stringSerializer);
	// 	template.setHashKeySerializer(stringSerializer);
	//
	// 	// Value serializer 설정
	// 	template.setValueSerializer(timingJsonSerializer);
	// 	template.setHashValueSerializer(timingJsonSerializer);
	//
	// 	template.afterPropertiesSet();
	// 	return template;
	// }
}
