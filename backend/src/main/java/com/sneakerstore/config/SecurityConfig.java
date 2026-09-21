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
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        private final PasswordEncoder passwordEncoder;
        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
        private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
        private final CorsConfigurationSource corsConfigurationSource;

        public SecurityConfig(
                        PasswordEncoder passwordEncoder,
                        JwtAuthenticationFilter jwtAuthenticationFilter,
                        JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                        JwtAccessDeniedHandler jwtAccessDeniedHandler,
                        CorsConfigurationSource corsConfigurationSource) {
                this.passwordEncoder = passwordEncoder;
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
                this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
                this.jwtAccessDeniedHandler = jwtAccessDeniedHandler;
                this.corsConfigurationSource = corsConfigurationSource;
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

                                .cors(cors -> cors.configurationSource(corsConfigurationSource))

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
                                                 * =====================================================
                                                 * AUTH PUBLIC API
                                                 * =====================================================
                                                 */
                                                .requestMatchers(
                                                                "/api/auth/register",
                                                                "/api/auth/login")
                                                .permitAll()

                                                /*
                                                 * =====================================================
                                                 * PRODUCT PUBLIC API
                                                 * =====================================================
                                                 *
                                                 * Khách chưa đăng nhập vẫn có thể:
                                                 *
                                                 * GET /api/products
                                                 * GET /api/products/{id}
                                                 */
                                                .requestMatchers(
                                                                org.springframework.http.HttpMethod.GET,
                                                                "/api/products",
                                                                "/api/products/**",
                                                                "/api/brands",
                                                                "/api/brands/**",
                                                                "/api/categories",
                                                                "/api/categories/**",
                                                                "/api/sizes",
                                                                "/api/sizes/**",
                                                                "/api/colors",
                                                                "/api/colors/**",
                                                                "/api/variants",
                                                                "/api/variants/**")
                                                .permitAll()

                                                /*
                                                 * =====================================================
                                                 * CÁC API CÒN LẠI
                                                 * =====================================================
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