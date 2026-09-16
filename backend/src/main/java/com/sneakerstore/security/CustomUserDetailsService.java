package com.sneakerstore.security;

import com.sneakerstore.entity.User;
import com.sneakerstore.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /*
     * Spring Security gọi method này khi cần tìm tài khoản.
     *
     * Trong project của chúng ta:
     *
     * username = email
     *
     * Ví dụ:
     * admin@gmail.com
     *
     * sẽ được dùng để tìm User trong database.
     */
    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy tài khoản với email: " + email));

        /*
         * Chuyển Role của Entity User thành
         * GrantedAuthority mà Spring Security hiểu.
         *
         * Ví dụ:
         *
         * USER -> ROLE_USER
         * ADMIN -> ROLE_ADMIN
         */
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(
                "ROLE_" + user.getRole().name());

        /*
         * UserDetails là object mà Spring Security sử dụng
         * để kiểm tra:
         *
         * - username
         * - password
         * - role
         * - account enabled
         */
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(Collections.singletonList(authority))
                .disabled(!user.getEnabled())
                .build();
    }
}