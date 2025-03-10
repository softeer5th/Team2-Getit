package com.softeer5.uniro_backend.common.resolver;

import java.io.IOException;
import java.util.Set;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.softeer5.uniro_backend.map.enums.CautionFactor;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class CautionListConverter implements AttributeConverter<Set<CautionFactor>, String> {
	private static final ObjectMapper mapper = new ObjectMapper()
		.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
		.configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, false);
	@Override
	public String convertToDatabaseColumn(Set<CautionFactor> attribute) {
		try {
			if (attribute == null) {
				return "[]"; // List가 null일 경우, DB에 저장할 값은 []
			}
			return mapper.writeValueAsString(attribute);
		} catch (JsonProcessingException e) {
			throw new IllegalArgumentException("Failed to convert List<RiskType> to JSON string", e);
		}
	}

	@Override
	public Set<CautionFactor> convertToEntityAttribute(String dbData) {
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
