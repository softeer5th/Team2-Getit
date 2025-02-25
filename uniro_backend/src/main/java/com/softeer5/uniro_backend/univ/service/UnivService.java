package com.softeer5.uniro_backend.univ.service;

import com.softeer5.uniro_backend.univ.dto.SearchUnivResDTO;
import com.softeer5.uniro_backend.univ.dto.UnivInfo;
import com.softeer5.uniro_backend.univ.entity.Univ;
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

    public SearchUnivResDTO searchUniv(String trimmedName, Integer pageSize) {
        List<Univ> universities = univRepository.searchUniv(trimmedName, pageSize);

        List<UnivInfo> univInfos = universities.stream().map(UnivInfo::of).toList();

        return SearchUnivResDTO.of(univInfos);
    }
}
