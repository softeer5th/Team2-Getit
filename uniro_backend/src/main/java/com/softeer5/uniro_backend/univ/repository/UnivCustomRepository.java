package com.softeer5.uniro_backend.univ.repository;

import com.softeer5.uniro_backend.univ.dto.UnivInfo;

import java.util.List;

public interface UnivCustomRepository {
    List<UnivInfo> searchUniv(String name, Integer pageSize);
}
