package com.softeer5.uniro_backend.admin.controller;

import com.softeer5.uniro_backend.admin.dto.RevInfoDTO;
import com.softeer5.uniro_backend.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AdminController implements AdminAPI{
    private final AdminService adminService;

    @Override
    @GetMapping("/admin/rev/{univId}")
    public ResponseEntity<List<RevInfoDTO>> getAllRev(@PathVariable("univId") Long univId) {
        return ResponseEntity.ok().body(adminService.getAllRevInfo(univId));
    }
}
