package cn.tcxingji.seal.repository;

import cn.tcxingji.seal.entity.PersonalSignature;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 个人签名 Repository 接口
 * <p>
 * 提供个人签名的数据访问层操作
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Repository
public interface PersonalSignatureRepository extends JpaRepository<PersonalSignature, Long> {

    /**
     * 根据用户ID查询签名列表
     *
     * @param userId 用户ID
     * @return 签名列表
     */
    List<PersonalSignature> findByUserId(Long userId);

    /**
     * 根据用户ID分页查询签名列表
     *
     * @param userId   用户ID
     * @param pageable 分页参数
     * @return 签名分页列表
     */
    Page<PersonalSignature> findByUserId(Long userId, Pageable pageable);

    /**
     * 根据用户ID和状态分页查询签名列表
     *
     * @param userId   用户ID
     * @param status   状态
     * @param pageable 分页参数
     * @return 签名分页列表
     */
    Page<PersonalSignature> findByUserIdAndStatus(Long userId, Integer status, Pageable pageable);

    /**
     * 根据用户ID和状态查询签名列表
     *
     * @param userId 用户ID
     * @param status 状态
     * @return 签名列表
     */
    List<PersonalSignature> findByUserIdAndStatus(Long userId, Integer status);

    /**
     * 根据用户ID和签名类型查询签名列表
     *
     * @param userId        用户ID
     * @param signatureType 签名类型
     * @return 签名列表
     */
    List<PersonalSignature> findByUserIdAndSignatureType(Long userId, Integer signatureType);

    /**
     * 查询用户的默认签名
     *
     * @param userId 用户ID
     * @return 默认签名（可选）
     */
    Optional<PersonalSignature> findByUserIdAndIsDefault(Long userId, Integer isDefault);

    /**
     * 查询用户的默认启用签名
     *
     * @param userId 用户ID
     * @return 默认签名（可选）
     */
    @Query("SELECT p FROM PersonalSignature p WHERE p.userId = :userId AND p.isDefault = 1 AND p.status = 1")
    Optional<PersonalSignature> findDefaultSignature(@Param("userId") Long userId);

    /**
     * 查询用户的启用签名列表
     *
     * @param userId 用户ID
     * @return 启用的签名列表
     */
    @Query("SELECT p FROM PersonalSignature p WHERE p.userId = :userId AND p.status = 1 ORDER BY p.isDefault DESC, p.createTime DESC")
    List<PersonalSignature> findEnabledSignatures(@Param("userId") Long userId);

    /**
     * 统计用户的签名数量
     *
     * @param userId 用户ID
     * @return 签名数量
     */
    long countByUserId(Long userId);

    /**
     * 统计用户某类型的签名数量
     *
     * @param userId        用户ID
     * @param signatureType 签名类型
     * @return 签名数量
     */
    long countByUserIdAndSignatureType(Long userId, Integer signatureType);

    /**
     * 更新签名状态
     *
     * @param id     签名ID
     * @param status 新状态
     * @return 更新记录数
     */
    @Modifying
    @Query("UPDATE PersonalSignature p SET p.status = :status, p.updateTime = CURRENT_TIMESTAMP WHERE p.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    /**
     * 设置用户的默认签名
     *
     * @param id     签名ID
     * @param userId 用户ID
     * @return 更新记录数
     */
    @Modifying
    @Query("UPDATE PersonalSignature p SET p.isDefault = CASE WHEN p.id = :id THEN 1 ELSE 0 END, p.updateTime = CURRENT_TIMESTAMP WHERE p.userId = :userId")
    int setDefaultSignature(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * 取消用户的所有默认签名
     *
     * @param userId 用户ID
     * @return 更新记录数
     */
    @Modifying
    @Query("UPDATE PersonalSignature p SET p.isDefault = 0, p.updateTime = CURRENT_TIMESTAMP WHERE p.userId = :userId AND p.isDefault = 1")
    int clearDefaultSignature(@Param("userId") Long userId);

    /**
     * 根据签名名称模糊查询
     *
     * @param signatureName 签名名称关键词
     * @param userId        用户ID
     * @return 签名列表
     */
    @Query("SELECT p FROM PersonalSignature p WHERE p.signatureName LIKE %:signatureName% AND p.userId = :userId ORDER BY p.createTime DESC")
    List<PersonalSignature> searchBySignatureName(@Param("signatureName") String signatureName, @Param("userId") Long userId);

    /**
     * 检查用户是否有启用的签名
     *
     * @param userId 用户ID
     * @return 是否有启用的签名
     */
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM PersonalSignature p WHERE p.userId = :userId AND p.status = 1")
    boolean hasEnabledSignature(@Param("userId") Long userId);

    /**
     * 删除用户的所有签名
     *
     * @param userId 用户ID
     */
    void deleteByUserId(Long userId);

    /**
     * 查询最近使用的签名（按更新时间排序）
     *
     * @param userId 用户ID
     * @param limit  限制数量
     * @return 最近使用的签名列表
     */
    @Query("SELECT p FROM PersonalSignature p WHERE p.userId = :userId AND p.status = 1 ORDER BY p.updateTime DESC")
    List<PersonalSignature> findRecentSignatures(@Param("userId") Long userId, Pageable pageable);
}
