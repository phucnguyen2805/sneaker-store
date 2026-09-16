package com.sneakerstore.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    /*
     * Secret được lấy từ Environment Variable:
     *
     * JWT_SECRET
     *
     * application.properties:
     *
     * jwt.secret=${JWT_SECRET}
     */
    @Value("${jwt.secret}")
    private String secret;

    /*
     * Thời gian sống của JWT.
     *
     * Giá trị được lấy từ:
     *
     * jwt.expiration=${JWT_EXPIRATION:86400000}
     *
     * Mặc định = 24 giờ.
     */
    @Value("${jwt.expiration}")
    private long expiration;

    /*
     * Tạo JWT cho người dùng sau khi đăng nhập thành công.
     *
     * Subject:
     * email của User
     *
     * JWT có:
     * issuedAt -> thời điểm tạo token
     * expiration -> thời điểm token hết hạn
     */
    public String generateToken(UserDetails userDetails) {

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    /*
     * Lấy username (email) từ JWT.
     */
    public String extractUsername(String token) {

        return extractClaim(
                token,
                Claims::getSubject);
    }

    /*
     * Kiểm tra JWT có hợp lệ với User hiện tại hay không.
     *
     * Token hợp lệ khi:
     *
     * 1. Username trong token = username của User
     * 2. Token chưa hết hạn
     */
    public boolean isTokenValid(
            String token,
            UserDetails userDetails) {

        final String username = extractUsername(token);

        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    /*
     * Kiểm tra JWT đã hết hạn chưa.
     */
    private boolean isTokenExpired(String token) {

        return extractExpiration(token)
                .before(new Date());
    }

    /*
     * Lấy thời gian hết hạn từ JWT.
     */
    private Date extractExpiration(String token) {

        return extractClaim(
                token,
                Claims::getExpiration);
    }

    /*
     * Hàm dùng chung để lấy một Claim bất kỳ.
     *
     * Ví dụ:
     *
     * Claims::getSubject
     * Claims::getExpiration
     */
    private <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver) {

        final Claims claims = extractAllClaims(token);

        return claimsResolver.apply(claims);
    }

    /*
     * Đọc toàn bộ Claims trong JWT.
     *
     * Nếu token:
     * - sai chữ ký
     * - bị thay đổi
     * - không hợp lệ
     *
     * JJWT sẽ ném exception.
     *
     * JWT Filter ở bước sau sẽ xử lý trường hợp này.
     */
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /*
     * Chuyển secret dạng Base64 thành SecretKey.
     *
     * Secret phải đủ mạnh để thuật toán ký JWT
     * hoạt động an toàn.
     */
    private SecretKey getSigningKey() {

        byte[] keyBytes = Decoders.BASE64.decode(secret);

        return Keys.hmacShaKeyFor(keyBytes);
    }
}