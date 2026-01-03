package cn.tcxingji.seal.service.impl;

import cn.tcxingji.seal.entity.SysUser;
import cn.tcxingji.seal.repository.SysUserRepository;
import cn.tcxingji.seal.service.SysUserService;
import cn.tcxingji.seal.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
}
