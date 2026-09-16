package com.sneakerstore.service;

import com.sneakerstore.dto.SizeResponse;
import com.sneakerstore.entity.Size;
import com.sneakerstore.repository.SizeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SizeService {

    private final SizeRepository sizeRepository;

    public SizeService(SizeRepository sizeRepository) {
        this.sizeRepository = sizeRepository;
    }

    /*
     * =========================================================
     * GET ALL SIZES
     * =========================================================
     *
     * Lấy toàn bộ Size từ database.
     *
     * Ví dụ:
     *
     * 38
     * 39
     * 40
     * 41
     * 42
     */
    @Transactional(readOnly = true)
    public List<SizeResponse> getAllSizes() {

        return sizeRepository.findAll()
                .stream()
                .map(this::toSizeResponse)
                .toList();
    }

    /*
     * =========================================================
     * ENTITY -> RESPONSE
     * =========================================================
     */
    private SizeResponse toSizeResponse(Size size) {

        return new SizeResponse(
                size.getId(),
                size.getName());
    }
}