package com.softeer5.uniro_backend.map.cache;

import java.io.Serializable;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
@Setter
@AllArgsConstructor
public class LightRoutes implements Serializable {
	private List<LightRoute> lightRoutes;
}
