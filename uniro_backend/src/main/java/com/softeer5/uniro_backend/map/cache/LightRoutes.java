package com.softeer5.uniro_backend.map.cache;

import java.io.Serializable;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LightRoutes implements Serializable {
	private List<LightRoute> lightRoutes;

	public LightRoutes(List<LightRoute> lightRoutes) {
		this.lightRoutes = lightRoutes;
	}
}
