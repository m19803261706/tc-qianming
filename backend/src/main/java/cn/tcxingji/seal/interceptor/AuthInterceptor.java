package cn.tcxingji.seal.interceptor;

import cn.tcxingji.seal.context.UserContext;
import cn.tcxingji.seal.entity.SysUser;
import cn.tcxingji.seal.service.SysUserService;
import cn.tcxingji.seal.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 认证拦截器
 * <p>
 * 验证 JWT Token，保护需要登录的 API
 * </p>
 *
 * @author TC System
 * @since 2026-01-03
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final SysUserService sysUserService;
    private final ObjectMapper objectMapper;

    /**
     * 请求处理前验证 Token
     */
    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        // OPTIONS 请求直接放行（CORS 预检请求）
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // 获取 Authorization header
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("认证失败: 未提供 Token - {}", request.getRequestURI());
            sendUnauthorizedResponse(response, "未提供认证信息");
            return false;
        }

        String token = authHeader.substring(7);

        // 验证 Token
        if (!jwtUtil.validateToken(token)) {
            log.warn("认证失败: Token 无效或已过期 - {}", request.getRequestURI());
            sendUnauthorizedResponse(response, "Token 无效或已过期");
            return false;
        }

        // 获取用户信息
        Long userId = jwtUtil.getUserId(token);
        String username = jwtUtil.getUsername(token);

        if (userId == null || username == null) {
            log.warn("认证失败: 无法解析用户信息 - {}", request.getRequestURI());
            sendUnauthorizedResponse(response, "Token 解析失败");
            return false;
        }

        // 查询用户详细信息（可选，验证用户是否仍然有效）
        Optional<SysUser> userOpt = sysUserService.findById(userId);
        if (userOpt.isEmpty() || !userOpt.get().isEnabled()) {
            log.warn("认证失败: 用户不存在或已禁用 - {}", username);
            sendUnauthorizedResponse(response, "用户不存在或已禁用");
            return false;
        }

        SysUser user = userOpt.get();

        // 将用户信息存入 ThreadLocal
        UserContext.setCurrentUser(UserContext.UserInfo.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .isAdmin(user.isAdminUser())
                .build());

        log.debug("认证成功: {} - {}", username, request.getRequestURI());
        return true;
    }

    /**
     * 请求完成后清除用户上下文
     */
    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler,
                                Exception ex) {
        // 清除 ThreadLocal，防止内存泄漏
        UserContext.clear();
    }

    /**
     * 发送 401 未授权响应
     */
    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");

        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", message);
        result.put("code", 401);

        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}
