package com.sneakerstore.dto;

import com.sneakerstore.entity.Role;
import com.sneakerstore.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AdminUserResponse {

    private Long id;

    private String fullName;

    private String email;

    private Role role;

    private Boolean enabled;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /*
     * Chuyển Entity User thành DTO.
     *
     * Tuyệt đối không trả password ra API,
     * kể cả password đã được BCrypt hash.
     */
    public static AdminUserResponse fromEntity(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getEnabled(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}