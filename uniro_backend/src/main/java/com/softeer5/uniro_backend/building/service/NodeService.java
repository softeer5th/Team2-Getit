package com.softeer5.uniro_backend.building.service;

import java.util.List;
import java.util.Optional;

import com.softeer5.uniro_backend.admin.annotation.RevisionOperation;
import com.softeer5.uniro_backend.admin.entity.RevisionOperationType;
import com.softeer5.uniro_backend.external.MapClient;
import com.softeer5.uniro_backend.building.dto.request.CreateBuildingNodeReqDTO;
import com.softeer5.uniro_backend.building.entity.Building;
import com.softeer5.uniro_backend.map.entity.Node;
import com.softeer5.uniro_backend.building.repository.NodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.common.CursorPage;
import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.custom.BuildingException;
import com.softeer5.uniro_backend.common.utils.GeoUtils;
import com.softeer5.uniro_backend.building.dto.BuildingNode;
import com.softeer5.uniro_backend.building.dto.response.GetBuildingResDTO;
import com.softeer5.uniro_backend.building.dto.response.SearchBuildingResDTO;
import com.softeer5.uniro_backend.building.repository.BuildingRepository;

import lombok.RequiredArgsConstructor;

import static com.softeer5.uniro_backend.common.utils.GeoUtils.convertDoubleToPoint;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NodeService {
	private final BuildingRepository buildingRepository;
	private final NodeRepository nodeRepository;
	private final MapClient mapClient;

	public List<GetBuildingResDTO> getBuildings(
		Long univId, int level,
		double leftUpLat, double leftUpLng,  double rightDownLat, double rightDownLng) {

		String polygon = GeoUtils.makeSquarePolygonString(leftUpLat, leftUpLng, rightDownLat, rightDownLng);
		List<BuildingNode> buildingNodes = buildingRepository.findByUnivIdAndLevelWithNode(univId, level, polygon);

		return buildingNodes.stream()
			.map(buildingNode -> GetBuildingResDTO.of(buildingNode.getBuilding(), buildingNode.getNode()))
			.toList();
	}

	public SearchBuildingResDTO searchBuildings(Long univId, String name, Long cursorId, Integer pageSize){

		CursorPage<List<BuildingNode>> buildingNodes = buildingRepository.searchBuildings(univId, name, cursorId, pageSize);

		List<GetBuildingResDTO> data = buildingNodes.getData().stream()
			.map(buildingNode -> GetBuildingResDTO.of(buildingNode.getBuilding(), buildingNode.getNode()))
			.toList();

		return SearchBuildingResDTO.of(data, buildingNodes.getNextCursor(), buildingNodes.isHasNext());
	}

	public GetBuildingResDTO getBuilding(Long nodeId){
		Optional<BuildingNode> buildingNode = buildingRepository.findByNodeIdWithNode(nodeId);
		if(buildingNode.isEmpty()){
			throw new BuildingException("Building Not Found", ErrorCode.BUILDING_NOT_FOUND);
		}

		return GetBuildingResDTO.of(buildingNode.get().getBuilding(), buildingNode.get().getNode());
	}

	@RevisionOperation(RevisionOperationType.CREATE_BUILDING_NODE)
	@Transactional
    public void createBuildingNode(Long univId, CreateBuildingNodeReqDTO createBuildingNodeReqDTO) {
		Node node = Node.builder()
				.coordinates(convertDoubleToPoint(createBuildingNodeReqDTO.getLng(), createBuildingNodeReqDTO.getLat()))
				.isCore(false)
				.univId(univId).build();
		mapClient.fetchHeights(List.of(node));
		nodeRepository.save(node);

		Building building = Building.builder()
				.phoneNumber(createBuildingNodeReqDTO.getPhoneNumber())
				.address(createBuildingNodeReqDTO.getAddress())
				.name(createBuildingNodeReqDTO.getBuildingName())
				.imageUrl(createBuildingNodeReqDTO.getBuildingImageUrl())
				.level(createBuildingNodeReqDTO.getLevel())
				.nodeId(node.getId())
				.univId(univId).build();
		buildingRepository.save(building);
    }

}
