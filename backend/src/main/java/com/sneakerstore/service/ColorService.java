package com.sneakerstore.service;

import com.sneakerstore.dto.ColorResponse;
import com.sneakerstore.dto.CreateColorRequest;
import com.sneakerstore.entity.Color;
import com.sneakerstore.repository.ColorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
     * CREATE COLOR
     * =========================================================
     *
     * Dùng cho ADMIN thêm Color mới.
     */
    @Transactional
    public ColorResponse createColor(CreateColorRequest request) {

        if (request == null
                || request.getName() == null
                || request.getName().trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên Color không được để trống");
        }

        String name = request.getName().trim();

        if (colorRepository.existsByName(name)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Color \"" + name + "\" đã tồn tại");
        }

        String hexCode = null;

        if (request.getHexCode() != null
                && !request.getHexCode().trim().isEmpty()) {

            hexCode = request.getHexCode().trim();
        }

        Color color = new Color(name, hexCode);

        Color savedColor = colorRepository.save(color);

        return toColorResponse(savedColor);
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