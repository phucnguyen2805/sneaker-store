package com.sneakerstore.controller;

import com.sneakerstore.dto.SizeResponse;
import com.sneakerstore.service.SizeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sizes")
public class SizeController {

    private final SizeService sizeService;

    public SizeController(SizeService sizeService) {
        this.sizeService = sizeService;
    }

    /*
     * =========================================================
     * GET ALL SIZES
     * =========================================================
     *
     * GET /api/sizes
     *
     * API này để Frontend lấy danh sách Size.
     *
     * Ví dụ:
     * 38
     * 39
     * 40
     * 41
     * 42
     *
     * Không yêu cầu đăng nhập vì Size là dữ liệu dùng
     * khi khách xem và chọn sản phẩm.
     */
    @GetMapping
    public ResponseEntity<List<SizeResponse>> getAllSizes() {

        List<SizeResponse> sizes = sizeService.getAllSizes();

        return ResponseEntity.ok(sizes);
    }
}