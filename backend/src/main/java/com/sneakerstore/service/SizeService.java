package com.sneakerstore.service;

import com.sneakerstore.dto.CreateSizeRequest;
import com.sneakerstore.dto.SizeResponse;
import com.sneakerstore.entity.Size;
import com.sneakerstore.repository.SizeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
     * CREATE SIZE
     * =========================================================
     *
     * Dùng cho ADMIN thêm Size mới.
     */
    @Transactional
    public SizeResponse createSize(CreateSizeRequest request) {

        if (request == null
                || request.getName() == null
                || request.getName().trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên Size không được để trống");
        }

        String name = request.getName().trim();

        if (sizeRepository.existsByName(name)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Size \"" + name + "\" đã tồn tại");
        }

        Size size = new Size(name);

        Size savedSize = sizeRepository.save(size);

        return toSizeResponse(savedSize);
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