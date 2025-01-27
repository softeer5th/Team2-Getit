package com.softeer5.uniro_backend.route.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.route.dto.GetCautionResDTO;
import com.softeer5.uniro_backend.route.dto.GetDangerResDTO;
import com.softeer5.uniro_backend.route.dto.GetRiskRoutesResDTO;
import com.softeer5.uniro_backend.route.entity.Route;
import com.softeer5.uniro_backend.route.repository.RouteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RouteService {
	private final RouteRepository routeRepository;

	public GetRiskRoutesResDTO getRiskRoutes(Long univId) {
		List<Route> riskRoutes = routeRepository.findRiskRouteByUnivIdWithNode(univId);

		List<GetDangerResDTO> dangerRoutes = mapRoutesToDangerDTO(riskRoutes);
		List<GetCautionResDTO> cautionRoutes = mapRoutesToCautionDTO(riskRoutes);

		return GetRiskRoutesResDTO.of(dangerRoutes, cautionRoutes);
	}

	private List<GetDangerResDTO> mapRoutesToDangerDTO(List<Route> routes) {
		return routes.stream()
			.filter(route -> route.getDangerFactors() != null) // 위험 요소가 있는 경로만 필터링
			.map(route -> GetDangerResDTO.of(
				route.getNode1(),
				route.getNode2(),
				route.getId(),
				route.getDangerFactors().stream().toList()
			)).toList();
	}

	private List<GetCautionResDTO> mapRoutesToCautionDTO(List<Route> routes) {
		return routes.stream()
			.filter(route -> route.getDangerFactors() == null && route.getCautionFactors() != null)
			.map(route -> GetCautionResDTO.of(
				route.getNode1(),
				route.getNode2(),
				route.getId(),
				route.getCautionFactors().stream().toList()
			)).toList();
	}
}
