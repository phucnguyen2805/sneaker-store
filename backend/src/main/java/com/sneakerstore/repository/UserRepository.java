package com.sneakerstore.repository;

import com.sneakerstore.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /*
     * Tìm User theo email.
     *
     * Dùng cho Login và các nghiệp vụ liên quan đến tài khoản.
     */
    Optional<User> findByEmail(String email);

    /*
     * Kiểm tra email đã tồn tại hay chưa.
     */
    boolean existsByEmail(String email);

    /*
     * Tìm kiếm User theo tên hoặc email.
     *
     * search = null / rỗng:
     * -> lấy toàn bộ User.
     *
     * Có search:
     * -> tìm theo fullName hoặc email.
     *
     * Pageable giúp hỗ trợ phân trang.
     */
    Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String fullName,
            String email,
            Pageable pageable);
}