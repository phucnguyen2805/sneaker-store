package com.sneakerstore.controller;

import com.sneakerstore.dto.ColorResponse;
import com.sneakerstore.dto.CreateColorRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sneakerstore.service.ColorService;

@RestController
@RequestMapping("/api/admin/colors")
public class AdminColorController {

    private final ColorService colorService;

    public AdminColorController(ColorService colorService) {
        this.colorService = colorService;
    }

    /*
     * =========================================================
     * CREATE COLOR
     * =========================================================
     *
     * POST /api/admin/colors
     *
     * Chỉ ADMIN mới được sử dụng.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ColorResponse> createColor(
            @RequestBody CreateColorRequest request) {

        ColorResponse response = colorService.createColor(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}