package com.softeer5.uniro_backend.univ.service;

import com.softeer5.uniro_backend.common.CursorPage;
import com.softeer5.uniro_backend.univ.dto.SearchUnivResDTO;
import com.softeer5.uniro_backend.univ.dto.UnivInfo;
import com.softeer5.uniro_backend.univ.repository.UnivRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UnivService {
    private final UnivRepository univRepository;

    public SearchUnivResDTO searchUniv(String name, Long cursorId, Integer pageSize) {
        CursorPage<List<UnivInfo>> universities = univRepository.searchUniv(name,cursorId,pageSize);
        return SearchUnivResDTO.of(universities.getData(),universities.getNextCursor(), universities.isHasNext());
    }
}
