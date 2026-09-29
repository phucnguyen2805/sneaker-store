package com.sneakerstore.controller;

import com.sneakerstore.dto.AdminUserResponse;
import com.sneakerstore.dto.AdminUserStatusRequest;
import com.sneakerstore.service.AdminUserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<AdminUserResponse> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        int safeSize = Math.min(Math.max(size, 1), 50);

        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        return adminUserService.getUsers(search, pageable);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminUserResponse updateStatus(
            @PathVariable Long id,
            @RequestBody AdminUserStatusRequest request,
            Authentication authentication) {

        return adminUserService.updateStatus(
                id,
                request.getEnabled(),
                authentication.getName());
    }
}