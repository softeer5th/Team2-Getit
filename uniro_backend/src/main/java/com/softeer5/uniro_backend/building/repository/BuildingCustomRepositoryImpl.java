package com.softeer5.uniro_backend.building.repository;

import static com.softeer5.uniro_backend.map.entity.QNode.node;

import java.util.List;

import com.softeer5.uniro_backend.building.service.vo.QBuildingNode;
import org.springframework.stereotype.Repository;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

import com.softeer5.uniro_backend.common.CursorPage;
import com.softeer5.uniro_backend.building.service.vo.BuildingNode;

import lombok.RequiredArgsConstructor;

import static com.softeer5.uniro_backend.building.entity.QBuilding.building;

@Repository
@RequiredArgsConstructor
public class BuildingCustomRepositoryImpl implements BuildingCustomRepository {
	private final JPAQueryFactory queryFactory;

	@Override
	public CursorPage<List<BuildingNode>> searchBuildings(Long univId, String name, Long cursorId, Integer pageSize) {

		List<BuildingNode> buildingNodes = queryFactory
			.select(new QBuildingNode(building, node))
			.from(building)
			.innerJoin(node).on(node.id.eq(building.nodeId))
			.where(
				building.univId.eq(univId),
				cursorIdCondition(cursorId),
				nameCondition(name)
			)
			.orderBy(building.nodeId.asc()) // Cursor 기반에서는 정렬이 중요
			.limit(pageSize + 1) // 다음 페이지 여부를 판단하기 위해 +1로 조회
			.fetch();

		// nextCursor 및 hasNext 판단
		boolean hasNext = buildingNodes.size() > pageSize;
		Long nextCursor = hasNext ? buildingNodes.get(pageSize).getBuilding().getNodeId() : null;

		// 마지막 요소 제거 (다음 페이지 여부 판단용으로 추가된 데이터 제거)
		if (hasNext) {
			buildingNodes.remove(buildingNodes.size() - 1);
		}

		return new CursorPage<>(buildingNodes, nextCursor, hasNext);
	}

	private BooleanExpression cursorIdCondition(Long cursorId) {
		return cursorId == null ? null : building.nodeId.gt(cursorId);
	}

	private BooleanExpression nameCondition(String name) {
		return name == null || name.isEmpty() ? null : building.name.containsIgnoreCase(name);
	}
}
