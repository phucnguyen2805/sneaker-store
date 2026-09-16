package com.sneakerstore.controller;

import com.sneakerstore.dto.ColorResponse;
import com.sneakerstore.service.ColorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/colors")
public class ColorController {

    private final ColorService colorService;

    public ColorController(ColorService colorService) {
        this.colorService = colorService;
    }

    /*
     * =========================================================
     * GET ALL COLORS
     * =========================================================
     *
     * GET /api/colors
     *
     * API public để Frontend lấy danh sách màu.
     */
    @GetMapping
    public ResponseEntity<List<ColorResponse>> getAllColors() {

        List<ColorResponse> colors = colorService.getAllColors();

        return ResponseEntity.ok(colors);
    }
}