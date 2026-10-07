package com.sneakerstore.controller;

import com.sneakerstore.dto.BrandResponse;
import com.sneakerstore.dto.CreateBrandRequest;
import com.sneakerstore.dto.UpdateBrandRequest;
import com.sneakerstore.service.BrandService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/brands")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBrandController {

    private final BrandService brandService;

    public AdminBrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @PostMapping
    public ResponseEntity<BrandResponse> create(
            @Valid @RequestBody CreateBrandRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(brandService.createBrand(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBrandRequest request
    ) {
        return ResponseEntity.ok(brandService.updateBrand(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Upload logo: multipart field name = "file"
     */
    @PostMapping(value = "/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BrandResponse> uploadLogo(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(brandService.uploadLogo(id, file));
    }

    @DeleteMapping("/{id}/logo")
    public ResponseEntity<BrandResponse> deleteLogo(@PathVariable Long id) {
        return ResponseEntity.ok(brandService.deleteLogo(id));
    }
}