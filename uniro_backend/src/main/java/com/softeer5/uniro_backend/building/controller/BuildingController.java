package com.softeer5.uniro_backend.building.controller;

import java.util.List;

import com.softeer5.uniro_backend.building.dto.request.CreateBuildingNodeReqDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.softeer5.uniro_backend.building.dto.response.GetBuildingResDTO;
import com.softeer5.uniro_backend.building.dto.response.SearchBuildingResDTO;
import com.softeer5.uniro_backend.building.service.BuildingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class BuildingController implements BuildingApi {
	private final BuildingService buildingService;

	@Override
	@GetMapping("/{univId}/nodes/buildings")
	public ResponseEntity<List<GetBuildingResDTO>> getBuildings(
		@PathVariable("univId") Long univId,
		@RequestParam(value = "level", required = false, defaultValue = "1") int level,
		@RequestParam(value = "left-up-lat") double leftUpLat,
		@RequestParam(value = "left-up-lng") double leftUpLng,
		@RequestParam(value = "right-down-lat") double rightDownLat,
		@RequestParam(value = "right-down-lng") double rightDownLng
	) {
		List<GetBuildingResDTO> buildingResDTOS = buildingService.getBuildings(univId, level, leftUpLat, leftUpLng,
			rightDownLat, rightDownLng);
		return ResponseEntity.ok().body(buildingResDTOS);
	}

	@Override
	@GetMapping("{univId}/nodes/buildings/search")
	public ResponseEntity<SearchBuildingResDTO> searchBuildings(
		@PathVariable("univId") Long univId,
		@RequestParam(value = "name", required = false) String name,
		@RequestParam(value = "cursor-id", required = false) Long cursorId,
		@RequestParam(value = "page-size", required = false, defaultValue = "6") Integer pageSize
	) {
		SearchBuildingResDTO searchBuildingResDTO = buildingService.searchBuildings(univId, name, cursorId, pageSize);
		return ResponseEntity.ok().body(searchBuildingResDTO);
	}

	@Override
	@GetMapping("{univId}/nodes/buildings/{nodeId}")
	public ResponseEntity<GetBuildingResDTO> getBuilding(
		@PathVariable("univId") Long univId,
		@PathVariable("nodeId") Long nodeId) {

		GetBuildingResDTO buildingResDTO = buildingService.getBuilding(nodeId);
		return ResponseEntity.ok().body(buildingResDTO);
	}

	@Override
	@PostMapping("{univId}/nodes/building")
	public ResponseEntity<Void> createBuildingNode(@PathVariable("univId") Long univId,
												   @RequestBody @Valid CreateBuildingNodeReqDTO createBuildingNodeReqDTO){
		buildingService.createBuildingNode(univId, createBuildingNodeReqDTO);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}


}
