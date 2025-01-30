package com.softeer5.uniro_backend.route.service;

import java.util.List;

import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.custom.RouteNotFoundException;
import com.softeer5.uniro_backend.common.utils.Utils;
import com.softeer5.uniro_backend.route.dto.*;
import com.softeer5.uniro_backend.route.entity.CoreRoute;
import com.softeer5.uniro_backend.route.repository.CoreRouteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.route.entity.Route;
import com.softeer5.uniro_backend.route.repository.RouteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RouteService {
	private final RouteRepository routeRepository;
	private final CoreRouteRepository coreRouteRepository;


	public List<GetAllRoutesResDTO> GetAllRoutes(Long univId) {
		List<CoreRoute> coreRoutes = coreRouteRepository.findByUnivId(univId);
		return coreRoutes.stream().map(GetAllRoutesResDTO::of).toList();
	}

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


	public GetRiskResDTO getRisk(Long univId, double startLat, double startLng, double endLat, double endLng) {
		String startWTK = Utils.convertDoubleToWTK(startLat, startLng);
		String endWTK = Utils.convertDoubleToWTK(endLat, endLng);

		Route route = routeRepository.findRouteByPointsAndUnivId(univId, startWTK ,endWTK)
				.orElseThrow(() -> new RouteNotFoundException("Route Not Found", ErrorCode.ROUTE_NOT_FOUND));

		return GetRiskResDTO.of(route);
	}

}
