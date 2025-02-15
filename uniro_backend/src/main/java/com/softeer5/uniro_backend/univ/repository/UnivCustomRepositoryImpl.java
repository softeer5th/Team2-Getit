package com.softeer5.uniro_backend.univ.repository;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.softeer5.uniro_backend.common.CursorPage;
import com.softeer5.uniro_backend.univ.dto.QUnivInfo;
import com.softeer5.uniro_backend.univ.dto.UnivInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.softeer5.uniro_backend.univ.entity.QUniv.univ;

@Repository
@RequiredArgsConstructor
public class UnivCustomRepositoryImpl implements UnivCustomRepository {
    private final JPAQueryFactory queryFactory;

    @Override
    public List<UnivInfo> searchUniv(String name, Integer pageSize) {

        return queryFactory
                .select(new QUnivInfo(univ.id, univ.name, univ.imageUrl))
                .from(univ)
                .where(
                    nameCondition(name)
                )
                .orderBy(univ.name.asc())
                .limit(pageSize)
                .fetch();
    }
    private BooleanExpression nameCondition(String name) {
        return name == null || name.isEmpty() ? null : univ.name.containsIgnoreCase(name);
    }
}
