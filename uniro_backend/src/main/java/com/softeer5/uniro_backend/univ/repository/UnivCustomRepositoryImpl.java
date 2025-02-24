package com.softeer5.uniro_backend.univ.repository;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.softeer5.uniro_backend.univ.entity.Univ;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.softeer5.uniro_backend.univ.entity.QUniv.univ;

@Repository
@RequiredArgsConstructor
public class UnivCustomRepositoryImpl implements UnivCustomRepository {
    private final JPAQueryFactory queryFactory;

    @Override
    public List<Univ> searchUniv(String trimmedName, Integer pageSize) {

        return queryFactory
                .selectFrom(univ)
                .where(
                    nameCondition(trimmedName)
                )
                .orderBy(univ.name.asc())
                .limit(pageSize)
                .fetch();
    }
    private BooleanExpression nameCondition(String trimmedName) {
        return trimmedName == null || trimmedName.isEmpty() ? null : univ.trimmedName.containsIgnoreCase(trimmedName);
    }
}
