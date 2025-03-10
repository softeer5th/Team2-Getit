package com.softeer5.uniro_backend.admin.controller;

import com.softeer5.uniro_backend.admin.dto.response.GetAllRoutesByRevisionResDTO;
import com.softeer5.uniro_backend.admin.dto.response.RevInfoDTO;
import com.softeer5.uniro_backend.admin.service.AdminService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AdminController implements AdminApi {
    private final AdminService adminService;

    @Override
    @GetMapping("/admin/{univId}/revisions")
    public ResponseEntity<List<RevInfoDTO>> getAllRev(@PathVariable("univId") Long univId) {
        return ResponseEntity.ok().body(adminService.getAllRevInfo(univId));
    }

    @Override
    @PatchMapping("/admin/{univId}/revisions/{versionId}")
    public ResponseEntity<Void> rollbackRev(
        @PathVariable("univId") Long univId,
        @PathVariable("versionId") Long versionId) {

        adminService.rollbackRev(univId, versionId);

        return ResponseEntity.ok().build();
    }

    @Override
    @GetMapping("/admin/{univId}/revisions/{versionId}")
    public ResponseEntity<GetAllRoutesByRevisionResDTO> getAllRoutesByRevision(
        @PathVariable("univId") Long univId,
        @PathVariable("versionId") Long versionId) {

        GetAllRoutesByRevisionResDTO resDTO = adminService.getAllRoutesByRevision(univId, versionId);
        return ResponseEntity.ok().body(resDTO);
    }
}
