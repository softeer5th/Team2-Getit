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
    public CursorPage<List<UnivInfo>> searchUniv(String name, Long cursorId, Integer pageSize) {

        List<UnivInfo> universities = queryFactory
                .select(new QUnivInfo(univ.id, univ.name, univ.imageUrl))
                .from(univ)
                .where(
                        nameCondition(name),
                        cursorIdCondition(cursorId)
                )
                .orderBy(univ.id.asc())
                .limit(pageSize + 1)
                .fetch();

        boolean hasNext = universities.size() > pageSize;
        Long nextCursor = hasNext ? universities.get(pageSize).getId() : null;

        if (hasNext) {
            universities.remove(universities.size() - 1);
        }

        return new CursorPage<>(universities, nextCursor, hasNext);
    }

    private BooleanExpression cursorIdCondition(Long cursorId) {
        return cursorId == null ? null : univ.id.gt(cursorId);
    }
    private BooleanExpression nameCondition(String name) {
        return name == null || name.isEmpty() ? null : univ.name.containsIgnoreCase(name);
    }
}
