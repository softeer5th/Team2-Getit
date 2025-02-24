package com.softeer5.uniro_backend.univ.dto;

import java.util.List;
import java.util.Map;

import com.softeer5.uniro_backend.univ.entity.Univ;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(name = "UnivInfo", description = "대학 정보 DTO")
public class UnivInfo {

	@Schema(description = "대학교 id", example = "11")
	private final Long id;

	@Schema(description = "대학교 이름", example = "한양대학교")
	private final String name;

	@Schema(description = "대학교 로고 이미지 url", example = "www.image.com")
	private final String imageUrl;

	@Schema(description = "학교 중점 좌표", example = "{\"lng\": 127.123456, \"lat\": 37.123456}")
	private final Map<String, Double> centerPoint;

	@Schema(description = "학교 좌상단 좌표", example = "{\"lng\": 127.123456, \"lat\": 37.123456}")
	private final Map<String, Double> leftTopPoint;

	@Schema(description = "학교 우하단 좌표", example = "{\"lng\": 127.123456, \"lat\": 37.123456}")
	private final Map<String, Double> rightBottomPoint;

	@Schema(description = "학교 영역(폴리곤) 좌표", example = "{\"lng\": 127.123456, \"lat\": 37.123456}")
	private final List<Map<String, Double>> areaPolygon;

	public static UnivInfo of(Univ univ) {

		return new UnivInfo(univ.getId(), univ.getName(), univ.getImageUrl(), univ.getCenterXY(),
			univ.getLeftTopXY(), univ.getRightBottomXY(), univ.getAreaPolygonXY());
	}
}
