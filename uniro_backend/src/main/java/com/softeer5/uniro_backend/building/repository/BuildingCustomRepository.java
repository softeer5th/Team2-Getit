package com.softeer5.uniro_backend.building.repository;

import java.util.List;

import com.softeer5.uniro_backend.common.CursorPage;
import com.softeer5.uniro_backend.building.service.vo.BuildingNode;

public interface BuildingCustomRepository {
	List<BuildingNode> searchBuildings(Long univId, String name, Integer pageSize);
}
