package com.softeer5.uniro_backend.univ.repository;

import com.softeer5.uniro_backend.common.CursorPage;
import com.softeer5.uniro_backend.univ.dto.UnivInfo;

import java.util.List;

public interface UnivCustomRepository {
    CursorPage<List<UnivInfo>> searchUniv(String name, Long cursorId, Integer pageSize);
}
