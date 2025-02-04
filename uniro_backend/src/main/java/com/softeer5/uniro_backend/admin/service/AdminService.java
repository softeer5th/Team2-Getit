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
@Transactional
public class AdminService {
    private final RevInfoRepository revInfoRepository;

    public List<RevInfoDTO> getAllRevInfo(){
        return revInfoRepository.findAll().stream().map(r -> RevInfoDTO.builder()
                .rev(r.getRev())
                .revTime(LocalDateTime.ofInstant(
                        Instant.ofEpochMilli(r.getRevTimeStamp()),
                        ZoneId.systemDefault()))
                .build()).toList();
    }
}
