package cn.tcxingji.seal.repository;

import cn.tcxingji.seal.entity.SysUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 系统用户 Repository
 *
 * @author TC System
 * @since 2026-01-03
 */
@Repository
public interface SysUserRepository extends JpaRepository<SysUser, Long> {

    /**
     * 根据用户名查找用户
     *
     * @param username 用户名
     * @return 用户信息
     */
    Optional<SysUser> findByUsername(String username);

    /**
     * 检查用户名是否存在
     *
     * @param username 用户名
     * @return true-存在，false-不存在
     */
    boolean existsByUsername(String username);

    /**
     * 根据用户名和状态查找用户
     *
     * @param username 用户名
     * @param status   状态
     * @return 用户信息
     */
    Optional<SysUser> findByUsernameAndStatus(String username, Integer status);
}
