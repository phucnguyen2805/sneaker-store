package com.sneakerstore.service;

import com.sneakerstore.dto.AuthResponse;
import com.sneakerstore.dto.LoginRequest;
import com.sneakerstore.dto.RegisterRequest;
import com.sneakerstore.entity.Role;
import com.sneakerstore.entity.User;
import com.sneakerstore.repository.UserRepository;
import com.sneakerstore.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    /*
     * =========================================================
     * REGISTER
     * =========================================================
     */
    public User register(RegisterRequest request) {

        /*
         * Kiểm tra email đã tồn tại hay chưa.
         */
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Email đã được sử dụng");
        }

        /*
         * Tạo User mới.
         */
        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        /*
         * Không lưu password dạng plaintext.
         * BCrypt sẽ tạo ra password hash trước khi lưu.
         */
        user.setPassword(
                passwordEncoder.encode(request.getPassword()));

        /*
         * Tài khoản tự đăng ký luôn bắt đầu với USER.
         * Client không được tự quyết định role.
         */
        user.setRole(Role.USER);

        /*
         * Tài khoản mới được phép đăng nhập.
         */
        user.setEnabled(true);

        return userRepository.save(user);
    }

    /*
     * =========================================================
     * LOGIN
     * =========================================================
     */
    public AuthResponse login(LoginRequest request) {

        /*
         * AuthenticationManager sẽ:
         *
         * 1. Gọi CustomUserDetailsService để tìm User theo email.
         * 2. Dùng PasswordEncoder để kiểm tra password.
         *
         * Nếu email/password sai, Spring Security sẽ ném
         * AuthenticationException.
         */
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        /*
         * Sau khi authenticate thành công,
         * lấy UserDetails đã được Spring Security xác thực.
         */
        org.springframework.security.core.userdetails.User userDetails = (org.springframework.security.core.userdetails.User) authentication
                .getPrincipal();

        /*
         * Tạo JWT cho tài khoản.
         */
        String token = jwtService.generateToken(userDetails);

        /*
         * Lấy User thực tế từ database để lấy:
         *
         * - id
         * - fullName
         * - email
         * - role
         *
         * Dùng email vì username của hệ thống = email.
         */
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException(
                        "Không tìm thấy thông tin người dùng"));

        /*
         * Không trả Entity User trực tiếp.
         *
         * Chỉ trả thông tin cần thiết cho Frontend
         * cùng JWT token.
         */
        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name());
    }
}