package com.sneakerstore.config;

import com.sneakerstore.security.CustomUserDetailsService;
import com.sneakerstore.security.JwtAuthenticationEntryPoint;
import com.sneakerstore.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import com.sneakerstore.security.JwtAccessDeniedHandler;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        private final PasswordEncoder passwordEncoder;
        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
        private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

        public SecurityConfig(
                        PasswordEncoder passwordEncoder,
                        JwtAuthenticationFilter jwtAuthenticationFilter,
                        JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                        JwtAccessDeniedHandler jwtAccessDeniedHandler) {
                this.passwordEncoder = passwordEncoder;
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
                this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
                this.jwtAccessDeniedHandler = jwtAccessDeniedHandler;
        }

        /*
         * =========================================================
         * SECURITY FILTER CHAIN
         * =========================================================
         */
        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                http
                                /*
                                 * REST API + JWT = Stateless.
                                 */
                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                /*
                                 * JWT được gửi qua Authorization Header,
                                 * không dùng session/form authentication.
                                 */
                                .csrf(csrf -> csrf.disable())

                                /*
                                 * Authentication Entry Point:
                                 *
                                 * Khi request cần đăng nhập nhưng chưa được
                                 * authenticate, trả 401 thay vì 403.
                                 */
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(
                                                                jwtAuthenticationEntryPoint)
                                                .accessDeniedHandler(
                                                                jwtAccessDeniedHandler))

                                /*
                                 * Phân quyền endpoint.
                                 */
                                .authorizeHttpRequests(authorize -> authorize

                                                /*
                                                 * Register và Login là public.
                                                 */
                                                .requestMatchers(
                                                                "/api/auth/register",
                                                                "/api/auth/login")
                                                .permitAll()

                                                /*
                                                 * Tất cả API khác hiện tại yêu cầu
                                                 * người dùng đã authenticate.
                                                 */
                                                .anyRequest().authenticated())

                                /*
                                 * JWT Filter chạy trước filter xác thực
                                 * username/password mặc định.
                                 */
                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        /*
         * AuthenticationManager dùng cho Login.
         */
        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration configuration) throws Exception {

                return configuration.getAuthenticationManager();
        }

        /*
         * Provider sử dụng:
         *
         * CustomUserDetailsService
         * +
         * PasswordEncoder
         */
        @Bean
        public DaoAuthenticationProvider authenticationProvider(
                        CustomUserDetailsService userDetailsService) {

                DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);

                provider.setPasswordEncoder(passwordEncoder);

                return provider;
        }
}