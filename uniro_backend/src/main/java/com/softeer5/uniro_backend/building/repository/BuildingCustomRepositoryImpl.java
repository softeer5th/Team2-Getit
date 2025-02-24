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
	public List<BuildingNode> searchBuildings(Long univId, String trimmedName, Integer pageSize) {

		return queryFactory
			.select(new QBuildingNode(building, node))
			.from(building)
			.innerJoin(node).on(node.id.eq(building.nodeId))
			.where(
				building.univId.eq(univId),
				nameCondition(trimmedName)
			)
			.orderBy(building.name.asc())
			.limit(pageSize)
			.fetch();
	}
	private BooleanExpression nameCondition(String trimmedName) {
		return trimmedName == null || trimmedName.isEmpty() ? null : building.trimmedName.containsIgnoreCase(trimmedName);
	}
}
