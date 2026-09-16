package com.sneakerstore.repository;

import com.sneakerstore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /*
     * Tìm User theo email.
     *
     * Email sẽ là thông tin được sử dụng để đăng nhập
     * trong Phase 2.
     */
    Optional<User> findByEmail(String email);

    /*
     * Kiểm tra email đã tồn tại hay chưa.
     *
     * Dùng khi đăng ký tài khoản mới để tránh
     * hai tài khoản sử dụng cùng một email.
     */
    boolean existsByEmail(String email);
}