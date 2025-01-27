package com.softeer5.uniro_backend.resolve;

import java.io.IOException;
import java.util.Set;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.softeer5.uniro_backend.route.entity.DangerType;

import jakarta.persistence.AttributeConverter;

public class DangerListConverter implements AttributeConverter<Set<DangerType>, String>  {
	private static final ObjectMapper mapper = new ObjectMapper()
		.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
		.configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, false);
	@Override
	public String convertToDatabaseColumn(Set<DangerType> attribute) {
		try {
			if (attribute == null) {
				return null; // List가 null일 경우, DB에 저장할 값도 null
			}
			return mapper.writeValueAsString(attribute);
		} catch (JsonProcessingException e) {
			throw new IllegalArgumentException("Failed to convert List<RiskType> to JSON string", e);
		}
	}

	@Override
	public Set<DangerType> convertToEntityAttribute(String dbData) {
		try {
			if (dbData == null || dbData.trim().isEmpty()) {
				return null; // dbData가 null 또는 빈 문자열일 경우 빈 리스트 반환
			}
			return mapper.readValue(dbData, new TypeReference<>() {
			});
		} catch (IOException e) {
			throw new IllegalArgumentException("Failed to convert JSON string to List<RiskType>", e);
		}
	}
}
