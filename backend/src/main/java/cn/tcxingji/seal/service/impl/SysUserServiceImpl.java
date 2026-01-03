package cn.tcxingji.seal.service.impl;

import cn.tcxingji.seal.dto.user.UserCreateRequest;
import cn.tcxingji.seal.dto.user.UserUpdateRequest;
import cn.tcxingji.seal.entity.SysUser;
import cn.tcxingji.seal.repository.SysUserRepository;
import cn.tcxingji.seal.service.SysUserService;
import cn.tcxingji.seal.util.PasswordUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

/**
 * 系统用户 Service 实现类
 *
 * @author TC System
 * @since 2026-01-03
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SysUserServiceImpl implements SysUserService {

    private final SysUserRepository sysUserRepository;
    private final PasswordUtil passwordUtil;

    @Override
    public Optional<SysUser> findByUsername(String username) {
        return sysUserRepository.findByUsername(username);
    }

    @Override
    public Optional<SysUser> findById(Long id) {
        return sysUserRepository.findById(id);
    }

    @Override
    public SysUser authenticate(String username, String password) {
        // 查找用户
        Optional<SysUser> userOpt = sysUserRepository.findByUsernameAndStatus(
                username, SysUser.Status.ENABLED);

        if (userOpt.isEmpty()) {
            log.warn("登录失败: 用户不存在或已禁用 - {}", username);
            return null;
        }

        SysUser user = userOpt.get();

        // 验证密码
        if (!passwordUtil.matches(password, user.getPassword())) {
            log.warn("登录失败: 密码错误 - {}", username);
            return null;
        }

        log.info("登录成功: {}", username);
        return user;
    }

    @Override
    public boolean existsByUsername(String username) {
        return sysUserRepository.existsByUsername(username);
    }

    @Override
    public List<SysUser> findAll() {
        return sysUserRepository.findAll();
    }

    @Override
    @Transactional
    public SysUser create(UserCreateRequest request) {
        // 检查用户名是否已存在
        if (sysUserRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("用户名已存在: " + request.getUsername());
        }

        // 创建用户实体
        SysUser user = SysUser.builder()
                .username(request.getUsername())
                .password(passwordUtil.encode(request.getPassword()))
                .nickname(request.getNickname())
                .status(request.getStatus() != null ? request.getStatus() : SysUser.Status.ENABLED)
                .isAdmin(SysUser.IsAdmin.NO)
                .build();

        SysUser savedUser = sysUserRepository.save(user);
        log.info("创建用户成功: {}", savedUser.getUsername());
        return savedUser;
    }

    @Override
    @Transactional
    public SysUser update(Long id, UserUpdateRequest request) {
        // 查找用户
        SysUser user = sysUserRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("用户不存在: " + id));

        // 更新密码（如果提供）
        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordUtil.encode(request.getPassword()));
        }

        // 更新昵称（如果提供）
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }

        // 更新状态（如果提供）
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        SysUser savedUser = sysUserRepository.save(user);
        log.info("更新用户成功: {}", savedUser.getUsername());
        return savedUser;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        // 查找用户
        SysUser user = sysUserRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("用户不存在: " + id));

        // 检查是否为管理员
        if (SysUser.IsAdmin.YES == user.getIsAdmin()) {
            throw new IllegalStateException("不能删除管理员账号");
        }

        sysUserRepository.delete(user);
        log.info("删除用户成功: {}", user.getUsername());
    }
}
