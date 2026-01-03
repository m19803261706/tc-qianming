package cn.tcxingji.seal.service;

import cn.tcxingji.seal.dto.user.UserCreateRequest;
import cn.tcxingji.seal.dto.user.UserUpdateRequest;
import cn.tcxingji.seal.entity.SysUser;

import java.util.List;
import java.util.Optional;

/**
 * 系统用户 Service 接口
 *
 * @author TC System
 * @since 2026-01-03
 */
public interface SysUserService {

    /**
     * 根据用户名查找用户
     *
     * @param username 用户名
     * @return 用户信息
     */
    Optional<SysUser> findByUsername(String username);

    /**
     * 根据ID查找用户
     *
     * @param id 用户ID
     * @return 用户信息
     */
    Optional<SysUser> findById(Long id);

    /**
     * 验证用户登录
     *
     * @param username 用户名
     * @param password 密码（原始密码）
     * @return 验证成功返回用户信息，失败返回 null
     */
    SysUser authenticate(String username, String password);

    /**
     * 检查用户名是否存在
     *
     * @param username 用户名
     * @return true-存在，false-不存在
     */
    boolean existsByUsername(String username);

    /**
     * 获取所有用户列表
     *
     * @return 用户列表
     */
    List<SysUser> findAll();

    /**
     * 创建用户
     *
     * @param request 创建用户请求
     * @return 创建的用户
     */
    SysUser create(UserCreateRequest request);

    /**
     * 更新用户
     *
     * @param id      用户ID
     * @param request 更新用户请求
     * @return 更新后的用户
     */
    SysUser update(Long id, UserUpdateRequest request);

    /**
     * 删除用户
     *
     * @param id 用户ID
     * @throws IllegalStateException 如果尝试删除管理员账号
     */
    void delete(Long id);
}
