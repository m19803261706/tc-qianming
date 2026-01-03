package cn.tcxingji.seal.controller;

import cn.tcxingji.seal.dto.auth.LoginRequest;
import cn.tcxingji.seal.dto.auth.LoginResponse;
import cn.tcxingji.seal.dto.auth.UserInfo;
import cn.tcxingji.seal.dto.response.ApiResponse;
import cn.tcxingji.seal.entity.SysUser;
import cn.tcxingji.seal.service.SysUserService;
import cn.tcxingji.seal.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 * <p>
 * 处理用户登录、登出、获取当前用户信息等认证相关接口
 * </p>
 *
 * @author TC System
 * @since 2026-01-03
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final SysUserService sysUserService;
    private final JwtUtil jwtUtil;

    /**
     * Token 过期时间（毫秒）
     */
    @Value("${jwt.expiration:86400000}")
    private Long expiration;

    /**
     * 用户登录
     *
     * @param request 登录请求
     * @return 登录响应（含 Token）
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("用户登录请求: {}", request.getUsername());

        // 验证用户
        SysUser user = sysUserService.authenticate(request.getUsername(), request.getPassword());

        if (user == null) {
            log.warn("登录失败: 用户名或密码错误 - {}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("用户名或密码错误"));
        }

        // 生成 Token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        // 构建响应
        LoginResponse response = LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(expiration / 1000) // 转换为秒
                .user(UserInfo.fromEntity(user))
                .build();

        log.info("用户登录成功: {}", user.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 用户登出
     *
     * @return 登出结果
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // JWT 是无状态的，服务端不需要做什么
        // 客户端只需要删除本地存储的 Token 即可
        log.info("用户登出");
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 获取当前用户信息
     *
     * @param request HTTP 请求（从中获取 Token）
     * @return 当前用户信息
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserInfo>> getCurrentUser(HttpServletRequest request) {
        // 从请求头获取 Token
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("未提供认证信息"));
        }

        String token = authHeader.substring(7);

        // 验证 Token 并获取用户ID
        Long userId = jwtUtil.getUserId(token);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Token 无效或已过期"));
        }

        // 查询用户信息
        return sysUserService.findById(userId)
                .map(user -> ResponseEntity.ok(ApiResponse.success(UserInfo.fromEntity(user))))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("用户不存在")));
    }
}
