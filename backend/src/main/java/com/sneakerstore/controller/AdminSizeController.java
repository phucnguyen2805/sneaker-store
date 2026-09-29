package com.sneakerstore.controller;

import com.sneakerstore.dto.CreateSizeRequest;
import com.sneakerstore.dto.SizeResponse;
import com.sneakerstore.service.SizeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/sizes")
public class AdminSizeController {

    private final SizeService sizeService;

    public AdminSizeController(SizeService sizeService) {
        this.sizeService = sizeService;
    }

    /*
     * =========================================================
     * CREATE SIZE
     * =========================================================
     *
     * POST /api/admin/sizes
     *
     * Chỉ ADMIN mới được sử dụng.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SizeResponse> createSize(
            @RequestBody CreateSizeRequest request) {

        SizeResponse response = sizeService.createSize(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}