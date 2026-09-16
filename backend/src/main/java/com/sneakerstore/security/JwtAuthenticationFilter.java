package com.sneakerstore.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.lang.NonNull;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    /*
     * Filter này được chạy một lần cho mỗi HTTP request.
     *
     * Nhiệm vụ:
     *
     * 1. Đọc Authorization Header.
     * 2. Kiểm tra có Bearer Token hay không.
     * 3. Lấy email từ JWT.
     * 4. Tải User từ database.
     * 5. Kiểm tra JWT có hợp lệ hay không.
     * 6. Đưa Authentication vào SecurityContext.
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        /*
         * Lấy Authorization Header.
         *
         * Dạng:
         *
         * Authorization: Bearer eyJhbGciOi...
         */
        final String authHeader = request.getHeader("Authorization");

        /*
         * Nếu không có Authorization Header
         * hoặc không bắt đầu bằng "Bearer "
         * thì bỏ qua filter.
         *
         * Register và Login là public endpoint,
         * nên trường hợp này hoàn toàn bình thường.
         */
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        /*
         * Cắt bỏ:
         *
         * "Bearer "
         *
         * để lấy JWT thực tế.
         */
        final String jwt = authHeader.substring(7);

        try {

            /*
             * Lấy email từ JWT.
             */
            final String email = jwtService.extractUsername(jwt);

            /*
             * Chỉ authenticate nếu SecurityContext hiện tại
             * chưa có Authentication.
             */
            if (email != null
                    && SecurityContextHolder.getContext()
                            .getAuthentication() == null) {

                /*
                 * Tìm User trong database.
                 */
                UserDetails userDetails = userDetailsService
                        .loadUserByUsername(email);

                /*
                 * Kiểm tra:
                 *
                 * - JWT có đúng User không?
                 * - JWT còn hạn không?
                 */
                if (jwtService.isTokenValid(jwt, userDetails)) {

                    /*
                     * Tạo Authentication object.
                     *
                     * authorities được lấy từ UserDetails,
                     * ví dụ:
                     *
                     * ROLE_USER
                     * ROLE_ADMIN
                     */
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    /*
                     * Gắn thông tin request vào Authentication.
                     */
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request));

                    /*
                     * Đưa Authentication vào SecurityContext.
                     *
                     * Từ đây Spring Security biết:
                     *
                     * "Request này đang được thực hiện
                     * bởi User nào và có Role gì."
                     */
                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authToken);
                }
            }

        } catch (Exception exception) {

            /*
             * Nếu JWT:
             *
             * - sai format
             * - sai signature
             * - hết hạn
             *
             * thì không thiết lập Authentication.
             *
             * Request sẽ tiếp tục đi qua filter chain
             * và Spring Security quyết định tiếp theo.
             */
            SecurityContextHolder.clearContext();
        }

        /*
         * Chuyển request sang filter tiếp theo.
         */
        filterChain.doFilter(request, response);
    }
}