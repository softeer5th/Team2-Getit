package com.softeer5.uniro_backend.univ.repository;

import com.softeer5.uniro_backend.univ.entity.Univ;

import java.util.List;

public interface UnivCustomRepository {
    List<Univ> searchUniv(String name, Integer pageSize);
}
