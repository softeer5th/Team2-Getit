package com.softeer5.uniro_backend.admin.service;

import static com.softeer5.uniro_backend.common.error.ErrorCode.*;

import com.softeer5.uniro_backend.admin.annotation.DisableAudit;
import com.softeer5.uniro_backend.admin.dto.RevInfoDTO;
import com.softeer5.uniro_backend.admin.entity.RevInfo;
import com.softeer5.uniro_backend.admin.repository.NodeAuditRepository;
import com.softeer5.uniro_backend.admin.repository.RevInfoRepository;
import com.softeer5.uniro_backend.admin.repository.RouteAuditRepository;
import com.softeer5.uniro_backend.common.exception.custom.AdminException;
import com.softeer5.uniro_backend.map.entity.Node;
import com.softeer5.uniro_backend.map.entity.Route;
import com.softeer5.uniro_backend.map.repository.NodeRepository;
import com.softeer5.uniro_backend.map.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {
    private final RevInfoRepository revInfoRepository;
    private final RouteRepository routeRepository;
    private final NodeRepository nodeRepository;

    private final RouteAuditRepository routeAuditRepository;
    private final NodeAuditRepository nodeAuditRepository;

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

        // TODO: 시점 확인 필요
        routeRepository.deleteAllByCreatedAt(univId, revInfo.getRevTimeStamp());
        nodeRepository.deleteAllByCreatedAt(univId, revInfo.getRevTimeStamp());

        // TODO: 삭제 시점 및 삭제 순서 확인
        // TODO: 빌딩 노드에 대한 고민
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
}
