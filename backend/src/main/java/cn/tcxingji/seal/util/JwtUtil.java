package cn.tcxingji.seal.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 工具类
 *
 * 用于生成、解析和验证 JWT Token
 *
 * @author TC System
 * @since 1.0.0
 */
@Slf4j
@Component
public class JwtUtil {

    /**
     * JWT 密钥（从配置文件读取）
     */
    @Value("${jwt.secret:TaiChuXingJi2026SecretKeyForJwtTokenGeneration}")
    private String secret;

    /**
     * Token 过期时间（毫秒），默认 24 小时
     */
    @Value("${jwt.expiration:86400000}")
    private Long expiration;

    /**
     * Token 前缀
     */
    public static final String TOKEN_PREFIX = "Bearer ";

    /**
     * 获取签名密钥
     *
     * @return SecretKey 签名密钥
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 生成 JWT Token
     *
     * @param userId   用户ID
     * @param username 用户名
     * @return JWT Token 字符串
     */
    public String generateToken(Long userId, String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * 从 Token 中解析 Claims
     *
     * @param token JWT Token
     * @return Claims 对象，解析失败返回 null
     */
    public Claims parseToken(String token) {
        try {
            // 移除 Bearer 前缀
            if (token != null && token.startsWith(TOKEN_PREFIX)) {
                token = token.substring(TOKEN_PREFIX.length());
            }

            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            log.warn("JWT Token 已过期: {}", e.getMessage());
            return null;
        } catch (MalformedJwtException e) {
            log.warn("JWT Token 格式错误: {}", e.getMessage());
            return null;
        } catch (SignatureException e) {
            log.warn("JWT Token 签名无效: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.warn("JWT Token 解析失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 验证 Token 是否有效
     *
     * @param token JWT Token
     * @return true-有效，false-无效
     */
    public boolean validateToken(String token) {
        return parseToken(token) != null;
    }

    /**
     * 从 Token 中获取用户ID
     *
     * @param token JWT Token
     * @return 用户ID，解析失败返回 null
     */
    public Long getUserId(String token) {
        Claims claims = parseToken(token);
        if (claims == null) {
            return null;
        }
        Object userId = claims.get("userId");
        if (userId instanceof Integer) {
            return ((Integer) userId).longValue();
        }
        return (Long) userId;
    }

    /**
     * 从 Token 中获取用户名
     *
     * @param token JWT Token
     * @return 用户名，解析失败返回 null
     */
    public String getUsername(String token) {
        Claims claims = parseToken(token);
        return claims != null ? claims.getSubject() : null;
    }

    /**
     * 检查 Token 是否即将过期（24小时内）
     *
     * @param token JWT Token
     * @return true-即将过期，false-未过期
     */
    public boolean isTokenExpiringSoon(String token) {
        Claims claims = parseToken(token);
        if (claims == null) {
            return true;
        }
        Date expirationDate = claims.getExpiration();
        // 检查是否在 24 小时内过期
        long remainingTime = expirationDate.getTime() - System.currentTimeMillis();
        return remainingTime < 86400000; // 24小时
    }
}
