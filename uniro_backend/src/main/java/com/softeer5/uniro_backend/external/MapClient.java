package com.softeer5.uniro_backend.external;

import com.softeer5.uniro_backend.map.entity.Node;

import java.util.List;

public interface MapClient {
    void fetchHeights(List<Node> nodes);
}
