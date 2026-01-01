package cn.tcxingji.seal.repository;

import cn.tcxingji.seal.entity.SealInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 印章信息 Repository 接口
 * <p>
 * 提供印章信息的数据访问层操作，支持动态条件查询
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Repository
public interface SealInfoRepository extends JpaRepository<SealInfo, Long>, JpaSpecificationExecutor<SealInfo> {

    /**
     * 根据所有者ID和所有者类型查询印章列表
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @return 印章列表
     */
    List<SealInfo> findByOwnerIdAndOwnerType(Long ownerId, Integer ownerType);

    /**
     * 根据所有者ID和所有者类型分页查询印章列表
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @param pageable  分页参数
     * @return 印章分页列表
     */
    Page<SealInfo> findByOwnerIdAndOwnerType(Long ownerId, Integer ownerType, Pageable pageable);

    /**
     * 根据印章类型查询印章列表
     *
     * @param sealType 印章类型
     * @return 印章列表
     */
    List<SealInfo> findBySealType(Integer sealType);

    /**
     * 根据所有者ID、所有者类型和状态查询印章列表
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @param status    状态
     * @return 印章列表
     */
    List<SealInfo> findByOwnerIdAndOwnerTypeAndStatus(Long ownerId, Integer ownerType, Integer status);

    /**
     * 根据所有者ID、所有者类型和印章类型查询印章列表
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @param sealType  印章类型
     * @return 印章列表
     */
    List<SealInfo> findByOwnerIdAndOwnerTypeAndSealType(Long ownerId, Integer ownerType, Integer sealType);

    /**
     * 统计所有者的印章数量
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @return 印章数量
     */
    long countByOwnerIdAndOwnerType(Long ownerId, Integer ownerType);

    /**
     * 更新印章状态
     *
     * @param id     印章ID
     * @param status 状态
     * @return 更新记录数
     */
    @Modifying
    @Query("UPDATE SealInfo s SET s.status = :status WHERE s.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    /**
     * 检查印章名称是否已存在
     *
     * @param sealName  印章名称
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @return 是否存在
     */
    boolean existsBySealNameAndOwnerIdAndOwnerType(String sealName, Long ownerId, Integer ownerType);

    /**
     * 根据印章名称模糊查询
     *
     * @param sealName 印章名称关键词
     * @param ownerId  所有者ID
     * @param ownerType 所有者类型
     * @return 印章列表
     */
    @Query("SELECT s FROM SealInfo s WHERE s.sealName LIKE %:sealName% AND s.ownerId = :ownerId AND s.ownerType = :ownerType")
    List<SealInfo> searchBySealName(@Param("sealName") String sealName, @Param("ownerId") Long ownerId, @Param("ownerType") Integer ownerType);
}
