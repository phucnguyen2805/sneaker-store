package com.sneakerstore.service;

import com.sneakerstore.dto.ColorResponse;
import com.sneakerstore.entity.Color;
import com.sneakerstore.repository.ColorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ColorService {

    private final ColorRepository colorRepository;

    public ColorService(ColorRepository colorRepository) {
        this.colorRepository = colorRepository;
    }

    /*
     * =========================================================
     * GET ALL COLORS
     * =========================================================
     *
     * Lấy toàn bộ màu từ database.
     *
     * Ví dụ:
     *
     * White
     * Black
     * Red
     * Blue
     */
    @Transactional(readOnly = true)
    public List<ColorResponse> getAllColors() {

        return colorRepository.findAll()
                .stream()
                .map(this::toColorResponse)
                .toList();
    }

    /*
     * =========================================================
     * ENTITY -> RESPONSE
     * =========================================================
     */
    private ColorResponse toColorResponse(Color color) {

        return new ColorResponse(
                color.getId(),
                color.getName(),
                color.getHexCode());
    }
}