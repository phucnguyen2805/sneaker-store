package com.sneakerstore.service;

import com.sneakerstore.dto.AdminUserResponse;
import com.sneakerstore.entity.User;
import com.sneakerstore.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Page<AdminUserResponse> getUsers(
            String search,
            Pageable pageable) {

        Page<User> users;

        if (search == null || search.trim().isEmpty()) {
            users = userRepository.findAll(pageable);
        } else {
            String keyword = search.trim();

            users = userRepository
                    .findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                            keyword,
                            keyword,
                            pageable);
        }

        return users.map(AdminUserResponse::fromEntity);
    }

    @Transactional
    public AdminUserResponse updateStatus(
            Long userId,
            Boolean enabled,
            String authenticatedEmail) {

        if (enabled == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Trạng thái enabled không được để trống");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng với id: " + userId));

        /*
         * Không cho Admin tự khóa chính tài khoản đang đăng nhập.
         *
         * Nếu cho phép thao tác này:
         * - tài khoản hiện tại có thể bị disabled trong database
         * - nhưng JWT hiện tại vẫn có thể còn tồn tại
         * - dễ tạo trạng thái khó kiểm soát
         */
        if (!enabled
                && user.getEmail().equalsIgnoreCase(authenticatedEmail)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không thể tự khóa tài khoản đang đăng nhập");
        }

        user.setEnabled(enabled);

        User savedUser = userRepository.save(user);

        return AdminUserResponse.fromEntity(savedUser);
    }
}