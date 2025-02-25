package com.softeer5.uniro_backend.external.event;

import com.softeer5.uniro_backend.admin.annotation.DisableAudit;
import com.softeer5.uniro_backend.external.elevation.MapClient;
import com.softeer5.uniro_backend.map.entity.Node;
import com.softeer5.uniro_backend.map.enums.HeightStatus;
import com.softeer5.uniro_backend.map.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional
public class RouteEventService {
    private final MapClient mapClient;
    private final NodeRepository nodeRepository;

    @DisableAudit
    public void fetchHeight(){
        List<Node> readyNodes = nodeRepository.findAllByStatus(HeightStatus.READY);
        mapClient.fetchHeights(readyNodes);
        setStatus(readyNodes,HeightStatus.DONE);
    }

    private void setStatus(List<Node> readyNodes, HeightStatus heightStatus) {
        readyNodes.forEach(readyNode -> readyNode.setStatus(heightStatus));
    }

}
