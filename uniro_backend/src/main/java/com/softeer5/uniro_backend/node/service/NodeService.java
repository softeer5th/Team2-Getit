package com.softeer5.uniro_backend.node.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.node.dto.BuildingNode;
import com.softeer5.uniro_backend.node.dto.GetBuildingResDTO;
import com.softeer5.uniro_backend.node.repository.BuildingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NodeService {
	private final BuildingRepository buildingRepository;

	public List<GetBuildingResDTO> getBuildings(
		Long univId, int level,
		double leftUpLng, double leftUpLat, double rightDownLng , double rightDownLat) {

		List<BuildingNode> buildingNodes = buildingRepository.findByUnivIdAndLevelWithNode(
			univId, level, leftUpLng, leftUpLat, rightDownLng, rightDownLat);

		return buildingNodes.stream()
			.map(buildingNode -> GetBuildingResDTO.of(buildingNode.getBuilding(), buildingNode.getNode()))
			.toList();
	}

}
