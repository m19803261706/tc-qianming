package cn.tcxingji.seal.controller;

import cn.tcxingji.seal.context.UserContext;
import cn.tcxingji.seal.dto.response.ApiResponse;
import cn.tcxingji.seal.dto.user.UserCreateRequest;
import cn.tcxingji.seal.dto.user.UserResponse;
import cn.tcxingji.seal.dto.user.UserUpdateRequest;
import cn.tcxingji.seal.entity.SysUser;
import cn.tcxingji.seal.service.SysUserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户管理控制器
 * <p>
 * 提供用户 CRUD 操作的 RESTful API
 * 注意：仅管理员可以访问这些接口
 * </p>
 *
 * @author TC System
 * @since 2026-01-03
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final SysUserService sysUserService;

    /**
     * 获取用户列表
     *
     * @return 用户列表
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> list() {
        // 检查是否为管理员
        if (!UserContext.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("权限不足，仅管理员可以查看用户列表"));
        }

        List<SysUser> users = sysUserService.findAll();
        List<UserResponse> responses = users.stream()
                .map(UserResponse::fromEntity)
                .toList();

        log.info("获取用户列表，共 {} 条", responses.size());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * 获取单个用户
     *
     * @param id 用户ID
     * @return 用户信息
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> get(@PathVariable Long id) {
        // 检查是否为管理员
        if (!UserContext.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("权限不足"));
        }

        return sysUserService.findById(id)
                .map(user -> ResponseEntity.ok(ApiResponse.success(UserResponse.fromEntity(user))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("用户不存在")));
    }

    /**
     * 创建用户
     *
     * @param request 创建用户请求
     * @return 创建的用户信息
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody UserCreateRequest request) {
        // 检查是否为管理员
        if (!UserContext.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("权限不足，仅管理员可以创建用户"));
        }

        try {
            SysUser user = sysUserService.create(request);
            log.info("创建用户成功: {}", user.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(UserResponse.fromEntity(user)));
        } catch (IllegalArgumentException e) {
            log.warn("创建用户失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 更新用户
     *
     * @param id      用户ID
     * @param request 更新用户请求
     * @return 更新后的用户信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {

        // 检查是否为管理员
        if (!UserContext.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("权限不足，仅管理员可以更新用户"));
        }

        try {
            SysUser user = sysUserService.update(id, request);
            log.info("更新用户成功: {}", user.getUsername());
            return ResponseEntity.ok(ApiResponse.success(UserResponse.fromEntity(user)));
        } catch (EntityNotFoundException e) {
            log.warn("更新用户失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 删除用户
     *
     * @param id 用户ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        // 检查是否为管理员
        if (!UserContext.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("权限不足，仅管理员可以删除用户"));
        }

        try {
            sysUserService.delete(id);
            log.info("删除用户成功: ID={}", id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (EntityNotFoundException e) {
            log.warn("删除用户失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            log.warn("删除用户失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
