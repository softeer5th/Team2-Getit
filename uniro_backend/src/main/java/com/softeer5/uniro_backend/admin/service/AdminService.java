package com.softeer5.uniro_backend.admin.service;

import static com.softeer5.uniro_backend.common.error.ErrorCode.*;

import com.softeer5.uniro_backend.admin.annotation.DisableAudit;
import com.softeer5.uniro_backend.admin.dto.response.*;
import com.softeer5.uniro_backend.admin.entity.RevInfo;
import com.softeer5.uniro_backend.admin.repository.NodeAuditRepository;
import com.softeer5.uniro_backend.admin.repository.RevInfoRepository;
import com.softeer5.uniro_backend.admin.repository.RouteAuditRepository;
import com.softeer5.uniro_backend.building.repository.BuildingRepository;
import com.softeer5.uniro_backend.common.exception.custom.AdminException;
import com.softeer5.uniro_backend.common.exception.custom.RouteException;
import com.softeer5.uniro_backend.map.dto.response.AllRoutesInfo;
import com.softeer5.uniro_backend.map.dto.response.GetChangedRoutesByRevisionResDTO;
import com.softeer5.uniro_backend.map.dto.response.GetRiskRoutesResDTO;
import com.softeer5.uniro_backend.map.dto.response.NodeInfoResDTO;
import com.softeer5.uniro_backend.map.entity.Node;
import com.softeer5.uniro_backend.map.entity.Route;
import com.softeer5.uniro_backend.map.repository.NodeRepository;
import com.softeer5.uniro_backend.map.repository.RouteRepository;
import com.softeer5.uniro_backend.map.service.RouteCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {
    private final RevInfoRepository revInfoRepository;
    private final RouteRepository routeRepository;
    private final NodeRepository nodeRepository;
    private final BuildingRepository buildingRepository;

    private final RouteAuditRepository routeAuditRepository;
    private final NodeAuditRepository nodeAuditRepository;

    private final RouteCalculator routeCalculator;

    public List<RevInfoDTO> getAllRevInfo(Long univId){
        return revInfoRepository.findAllByUnivId(univId).stream().map(r -> RevInfoDTO.of(r.getRev(),
                r.getRevTimeStamp(),
                r.getUnivId(),
                r.getAction())).toList();
    }

    @Transactional
    @DisableAudit
    public void rollbackRev(Long univId, Long versionId){
        RevInfo revInfo = revInfoRepository.findById(versionId)
            .orElseThrow(() -> new AdminException("invalid version id", INVALID_VERSION_ID));

        List<Route> revRoutes = routeAuditRepository.getAllRoutesAtRevision(univId, versionId);
        List<Node> revNodes = nodeAuditRepository.getAllNodesAtRevision(univId, versionId);

        routeRepository.deleteAllByCreatedAt(univId, revInfo.getRevTimeStamp());
        nodeRepository.deleteAllByCreatedAt(univId, revInfo.getRevTimeStamp());
        buildingRepository.deleteAllByCreatedAt(univId, revInfo.getRevTimeStamp());

        routeAuditRepository.deleteAllAfterVersionId(univId, versionId);
        nodeAuditRepository.deleteAllAfterVersionId(univId, versionId);
        revInfoRepository.deleteAllAfterVersionId(univId, versionId);

        List<Route> routes = routeRepository.findAllRouteByUnivIdWithNodes(univId);

        Map<Long, Route> routeMap = new HashMap<>();
        Map<Long, Node> nodeMap = new HashMap<>();

        for(Route route : routes){
            routeMap.put(route.getId(), route);
            nodeMap.put(route.getNode1().getId(), route.getNode1());
            nodeMap.put(route.getNode2().getId(), route.getNode2());
        }

        // 매핑하여 업데이트 또는 새로 저장
        for (Route revRoute : revRoutes) {
            Route currentRoute = routeMap.get(revRoute.getId());

            if (currentRoute != null) {
                currentRoute.updateFromRevision(revRoute);
            }
        }

        for (Node revNode : revNodes) {
            Node currentNode = nodeMap.get(revNode.getId());

            if (currentNode != null) {
                currentNode.updateFromRevision(revNode.isCore());
            }
        }

    }

    public GetAllRoutesByRevisionResDTO getAllRoutesByRevision(Long univId, Long versionId){
        List<Route> revRoutes = getRevRoutes(univId,versionId);
        List<Node> revNodes = nodeAuditRepository.getAllNodesAtRevision(univId, versionId);
        fetchNodes(revRoutes,revNodes);
        AllRoutesInfo routesInfo = routeCalculator.assembleRoutes(revRoutes);

        Map<Long, Route> revRouteMap = new HashMap<>();
        for(Route revRoute : revRoutes){
            revRouteMap.put(revRoute.getId(), revRoute);
        }

        List<Route> routes = routeRepository.findAllRouteByUnivIdWithNodes(univId);

        Map<Long, List<Route>> lostAdjMap = new HashMap<>();
        Map<Long, Node> lostNodeMap = new HashMap<>();
        List<ChangedRouteDTO> changedRoutes = new ArrayList<>();
        List<Route> riskRoutes = new ArrayList<>();

        for(Route route : routes){
            if(revRouteMap.containsKey(route.getId())){
                Route revRoute = revRouteMap.get(route.getId());
                handleRevisionRoute(revRoute, route, changedRoutes, riskRoutes);
                continue;
            }
            //해당 시점 이후에 생성된 루트들 (과거 시점엔 보이지 않는 루트)
            handleLostRoute(route, lostAdjMap, lostNodeMap);
        }

        GetRiskRoutesResDTO getRiskRoutesResDTO = routeCalculator.mapRisks(riskRoutes);

        //시작점이 1개인 nodeList 생성
        List<Node> endNodes = determineEndNodes(lostAdjMap, lostNodeMap);
        LostRoutesDTO lostRouteDTO = LostRoutesDTO.of(mapNodeInfo(lostNodeMap), routeCalculator.getCoreRoutes(lostAdjMap, endNodes));

        return GetAllRoutesByRevisionResDTO.of(routesInfo, getRiskRoutesResDTO, lostRouteDTO, changedRoutes);
    }

    public GetChangedRoutesByRevisionResDTO getChangedRoutesByRevision(Long univId, Long versionId) {
        List<Route> revRoutes = getRevRoutes(univId, versionId);

        RevInfo revInfo = revInfoRepository.findFirstByUnivIdOrderByRevDesc(univId)
            .orElseThrow(() -> new RouteException("Revision not found", RECENT_REVISION_NOT_FOUND));

        Map<Long, Route> revRouteMap = new HashMap<>();
        for(Route revRoute : revRoutes){
            revRouteMap.put(revRoute.getId(), revRoute);
        }

        List<Route> changedRoutes = routeAuditRepository.findUpdatedRouteByUnivIdWithNodes(univId,versionId);
        List<Node> nodes = nodeRepository.findByUnivId(univId);
        fetchNodes(changedRoutes,nodes);


        Map<Long, List<Route>> lostAdjMap = new HashMap<>();
        Map<Long, Node> lostNodeMap = new HashMap<>();
        List<ChangedRouteDTO> changedRoutesDto = new ArrayList<>();

        for(Route route : changedRoutes){
            if(revRouteMap.containsKey(route.getId())){
                Route revRoute = revRouteMap.get(route.getId());
                handleRevisionRoute(revRoute, route, changedRoutesDto);
                continue;
            }
            //해당 시점 이후에 생성된 루트들 (과거 시점엔 보이지 않는 루트)
            handleLostRoute(route, lostAdjMap, lostNodeMap);
        }

        //시작점이 1개인 nodeList 생성
        List<Node> endNodes = determineEndNodes(lostAdjMap, lostNodeMap);
        LostRoutesDTO lostRouteDTO = LostRoutesDTO.of(mapNodeInfo(lostNodeMap), routeCalculator.getCoreRoutes(lostAdjMap, endNodes));

        return GetChangedRoutesByRevisionResDTO.of(lostRouteDTO, changedRoutesDto, revInfo.getRev());
    }

    private void fetchNodes(List<Route> routes, List<Node> nodes) {
        Map<Long, Node> nodeMap = new HashMap<>();
        for(Node revNode : nodes){
            nodeMap.put(revNode.getId(), revNode);
        }
        for(Route revRoute : routes){
            revRoute.setNode1(nodeMap.get(revRoute.getNode1().getId()));
            revRoute.setNode2(nodeMap.get(revRoute.getNode2().getId()));
        }
    }


    private List<Route> getRevRoutes(Long univId, Long versionId) {
        revInfoRepository.findById(versionId)
                .orElseThrow(() -> new AdminException("invalid version id", INVALID_VERSION_ID));

        List<Route> revRoutes = routeAuditRepository.getAllRoutesAtRevision(univId, versionId);

        if(revRoutes.isEmpty()) {
            throw new RouteException("Route Not Found", ROUTE_NOT_FOUND);
        }
        return revRoutes;
    }


    private void handleRevisionRoute(Route revRoute, Route route, List<ChangedRouteDTO> changedRoutes, List<Route> riskRoutes) {
        //변경사항이 있는 경우
        if(!route.isEqualRoute(revRoute)){
            changedRoutes.add(ChangedRouteDTO.of(route.getId(), RouteDifferInfo.of(route), RouteDifferInfo.of(revRoute)));
        }
        //변경사항이 없으면서 risk가 존재하는 route의 경우 riskRoutes에 추가
        else if(!route.getCautionFactors().isEmpty() || !route.getDangerFactors().isEmpty()){
            riskRoutes.add(route);
        }
    }

    private void handleRevisionRoute(Route revRoute, Route route, List<ChangedRouteDTO> changedRoutes) {
        //변경사항이 있는 경우
        if(!route.isEqualRoute(revRoute)){
            changedRoutes.add(ChangedRouteDTO.of(route.getId(), RouteDifferInfo.of(route), RouteDifferInfo.of(revRoute)));
        }
    }

    private void handleLostRoute(Route route, Map<Long, List<Route>> lostAdjMap, Map<Long, Node> lostNodeMap) {
        lostAdjMap.computeIfAbsent(route.getNode1().getId(), k -> new ArrayList<>()).add(route);
        lostAdjMap.computeIfAbsent(route.getNode2().getId(), k -> new ArrayList<>()).add(route);
        lostNodeMap.put(route.getNode1().getId(), route.getNode1());
        lostNodeMap.put(route.getNode2().getId(), route.getNode2());
    }

    private List<Node> determineEndNodes(Map<Long, List<Route>> lostAdjMap, Map<Long, Node> lostNodeMap) {
        return lostAdjMap.entrySet()
                .stream()
                .filter(entry -> (entry.getValue().size() == 1) || lostNodeMap.get(entry.getKey()).isCore())
                .map(Map.Entry::getKey)
                .map(lostNodeMap::get)
                .collect(Collectors.toList());
    }

    private List<NodeInfoResDTO> mapNodeInfo(Map<Long, Node> lostNodeMap){
        return lostNodeMap.entrySet().stream()
                .map(entry -> {
                    Node node = entry.getValue();
                    return NodeInfoResDTO.of(entry.getKey(), node.getX(), node.getY());
                })
                .toList();
    }

}
