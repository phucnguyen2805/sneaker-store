package com.sneakerstore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_email", columnNames = "email")
}, indexes = {
        @Index(name = "idx_user_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Họ tên người dùng.
     */
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    /*
     * Email dùng để đăng nhập.
     *
     * Email phải duy nhất trong hệ thống.
     */
    @Column(nullable = false, length = 150)
    private String email;

    /*
     * Mật khẩu đã được mã hóa.
     *
     * TUYỆT ĐỐI không lưu mật khẩu dạng plaintext.
     *
     * Phase 2 sẽ dùng PasswordEncoder để mã hóa
     * trước khi lưu vào database.
     */
    @Column(nullable = false, length = 255)
    private String password;

    /*
     * Role của tài khoản.
     *
     * Hiện tại thiết kế hai role chính:
     * USER -> khách hàng
     * ADMIN -> quản trị viên
     *
     * Phase 2 sẽ dùng field này để phân quyền API.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.USER;

    /*
     * Trạng thái tài khoản.
     *
     * true -> được phép đăng nhập
     * false -> tài khoản bị khóa
     *
     * Field này sẽ rất hữu ích khi Admin cần khóa tài khoản.
     */
    @Column(nullable = false)
    private Boolean enabled = true;

    /*
     * Thời điểm tạo tài khoản.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /*
     * Thời điểm cập nhật tài khoản gần nhất.
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}