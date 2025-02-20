package com.softeer5.uniro_backend.external.redis;

import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.SerializationException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TimingRedisSerializer implements RedisSerializer<Object> {

	private final RedisSerializer<Object> delegate;

	public TimingRedisSerializer(RedisSerializer<Object> delegate) {
		this.delegate = delegate;
	}

	@Override
	public byte[] serialize(Object t) throws SerializationException {
		long startTime = System.nanoTime();
		byte[] result = delegate.serialize(t);
		long endTime = System.nanoTime();
		log.info("🚀🚀🚀🚀🚀🚀🚀🚀🚀Serialization took {} ns", (endTime - startTime));
		return result;
	}

	@Override
	public Object deserialize(byte[] bytes) throws SerializationException {
		long startTime = System.nanoTime();
		Object result = delegate.deserialize(bytes);
		long endTime = System.nanoTime();
		log.info("🚀🚀🚀🚀🚀🚀🚀🚀🚀Deserialization took {} ns", (endTime - startTime));
		return result;
	}
}
