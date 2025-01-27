package com.softeer5.uniro_backend.node.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.softeer5.uniro_backend.node.dto.GetBuildingResDTO;
import com.softeer5.uniro_backend.node.service.NodeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class NodeController implements NodeApi {
	private final NodeService nodeService;

	@Override
	@GetMapping("/{univId}/nodes/buildings")
	public ResponseEntity<List<GetBuildingResDTO>> getBuildings(
		@PathVariable("univId") Long univId,
		@RequestParam(value = "level", required = false, defaultValue = "1") int level) {

		List<GetBuildingResDTO> buildingResDTOS = nodeService.getBuildings(univId, level);
		return ResponseEntity.ok().body(buildingResDTOS);
	}

}
