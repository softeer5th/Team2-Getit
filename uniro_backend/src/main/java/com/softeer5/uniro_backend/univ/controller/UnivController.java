package com.softeer5.uniro_backend.univ.controller;

import com.softeer5.uniro_backend.univ.dto.SearchUnivResDTO;
import com.softeer5.uniro_backend.univ.service.UnivService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UnivController implements UnivApi {
    private final UnivService univService;

    @Override
    @GetMapping("/univ/search")
    public ResponseEntity<SearchUnivResDTO> searchUniv(
        @RequestParam(value = "name", required = false) String name,
        @RequestParam(value = "page-size", required = false, defaultValue = "10") Integer pageSize){
        SearchUnivResDTO searchResult = univService.searchUniv(name, pageSize);
        return ResponseEntity.ok().body(searchResult);
    }
}
