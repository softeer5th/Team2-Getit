package com.softeer5.uniro_backend.admin.service;

import com.softeer5.uniro_backend.admin.dto.RevInfoDTO;
import com.softeer5.uniro_backend.admin.repository.RevInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {
    private final RevInfoRepository revInfoRepository;

    public List<RevInfoDTO> getAllRevInfo(Long univId){
        return revInfoRepository.findAllByUnivId(univId).stream().map(r -> RevInfoDTO.of(r.getRev(),
                LocalDateTime.ofInstant(Instant.ofEpochMilli(r.getRevTimeStamp()), ZoneId.systemDefault()),
                r.getUnivId(),
                r.getAction())).toList();
    }
}
