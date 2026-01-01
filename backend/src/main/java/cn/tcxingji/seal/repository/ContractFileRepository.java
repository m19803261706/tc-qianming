package cn.tcxingji.seal.repository;

import cn.tcxingji.seal.entity.ContractFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 合同文件 Repository 接口
 * <p>
 * 提供合同文件的数据访问层操作
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Repository
public interface ContractFileRepository extends JpaRepository<ContractFile, Long> {

    /**
     * 根据所有者ID查询合同文件列表
     *
     * @param ownerId 所有者ID
     * @return 合同文件列表
     */
    List<ContractFile> findByOwnerId(Long ownerId);

    /**
     * 根据所有者ID和所有者类型查询合同文件列表
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @return 合同文件列表
     */
    List<ContractFile> findByOwnerIdAndOwnerType(Long ownerId, Integer ownerType);

    /**
     * 根据所有者ID和所有者类型分页查询合同文件
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @param pageable  分页参数
     * @return 合同文件分页列表
     */
    Page<ContractFile> findByOwnerIdAndOwnerType(Long ownerId, Integer ownerType, Pageable pageable);

    /**
     * 根据状态查询合同文件列表
     *
     * @param status 状态
     * @return 合同文件列表
     */
    List<ContractFile> findByStatus(Integer status);

    /**
     * 根据所有者ID和状态查询合同文件列表
     *
     * @param ownerId 所有者ID
     * @param status  状态
     * @return 合同文件列表
     */
    List<ContractFile> findByOwnerIdAndStatus(Long ownerId, Integer status);

    /**
     * 根据所有者ID和状态分页查询合同文件
     *
     * @param ownerId  所有者ID
     * @param status   状态
     * @param pageable 分页参数
     * @return 合同文件分页列表
     */
    Page<ContractFile> findByOwnerIdAndStatus(Long ownerId, Integer status, Pageable pageable);

    /**
     * 根据文件哈希值查询合同文件
     *
     * @param fileHash 文件哈希值
     * @return 合同文件（可选）
     */
    Optional<ContractFile> findByFileHash(String fileHash);

    /**
     * 根据文件名模糊查询
     *
     * @param fileName 文件名关键词
     * @param ownerId  所有者ID
     * @return 合同文件列表
     */
    @Query("SELECT c FROM ContractFile c WHERE c.fileName LIKE %:fileName% AND c.ownerId = :ownerId ORDER BY c.createTime DESC")
    List<ContractFile> searchByFileName(@Param("fileName") String fileName, @Param("ownerId") Long ownerId);

    /**
     * 根据文件名模糊分页查询
     *
     * @param fileName 文件名关键词
     * @param ownerId  所有者ID
     * @param pageable 分页参数
     * @return 合同文件分页列表
     */
    @Query("SELECT c FROM ContractFile c WHERE c.fileName LIKE %:fileName% AND c.ownerId = :ownerId ORDER BY c.createTime DESC")
    Page<ContractFile> searchByFileName(@Param("fileName") String fileName, @Param("ownerId") Long ownerId, Pageable pageable);

    /**
     * 根据关键词搜索（匹配合同名称或文件名）
     *
     * @param keyword  关键词
     * @param pageable 分页参数
     * @return 合同文件分页列表
     */
    @Query("SELECT c FROM ContractFile c WHERE c.contractName LIKE %:keyword% OR c.fileName LIKE %:keyword% ORDER BY c.createTime DESC")
    Page<ContractFile> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 根据关键词和状态搜索
     *
     * @param keyword  关键词
     * @param status   状态
     * @param pageable 分页参数
     * @return 合同文件分页列表
     */
    @Query("SELECT c FROM ContractFile c WHERE (c.contractName LIKE %:keyword% OR c.fileName LIKE %:keyword%) AND c.status = :status ORDER BY c.createTime DESC")
    Page<ContractFile> searchByKeywordAndStatus(@Param("keyword") String keyword, @Param("status") Integer status, Pageable pageable);

    /**
     * 根据状态分页查询
     *
     * @param status   状态
     * @param pageable 分页参数
     * @return 合同文件分页列表
     */
    Page<ContractFile> findByStatus(Integer status, Pageable pageable);

    /**
     * 统计所有者的合同文件数量
     *
     * @param ownerId 所有者ID
     * @return 文件数量
     */
    long countByOwnerId(Long ownerId);

    /**
     * 统计所有者某状态的合同文件数量
     *
     * @param ownerId 所有者ID
     * @param status  状态
     * @return 文件数量
     */
    long countByOwnerIdAndStatus(Long ownerId, Integer status);

    /**
     * 更新合同文件状态
     *
     * @param id     合同文件ID
     * @param status 新状态
     * @return 更新记录数
     */
    @Modifying
    @Query("UPDATE ContractFile c SET c.status = :status, c.updateTime = CURRENT_TIMESTAMP WHERE c.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    /**
     * 更新签章后文件路径
     *
     * @param id         合同文件ID
     * @param signedPath 签章后文件路径
     * @return 更新记录数
     */
    @Modifying
    @Query("UPDATE ContractFile c SET c.signedPath = :signedPath, c.status = 2, c.updateTime = CURRENT_TIMESTAMP WHERE c.id = :id")
    int updateSignedPath(@Param("id") Long id, @Param("signedPath") String signedPath);

    /**
     * 根据时间范围查询合同文件
     *
     * @param ownerId   所有者ID
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @return 合同文件列表
     */
    @Query("SELECT c FROM ContractFile c WHERE c.ownerId = :ownerId AND c.createTime BETWEEN :startTime AND :endTime ORDER BY c.createTime DESC")
    List<ContractFile> findByTimeRange(@Param("ownerId") Long ownerId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 查询待签章的合同文件
     *
     * @param ownerId 所有者ID
     * @return 待签章合同文件列表
     */
    @Query("SELECT c FROM ContractFile c WHERE c.ownerId = :ownerId AND c.status = 0 ORDER BY c.createTime DESC")
    List<ContractFile> findPendingContracts(@Param("ownerId") Long ownerId);

    /**
     * 查询已签章的合同文件
     *
     * @param ownerId 所有者ID
     * @return 已签章合同文件列表
     */
    @Query("SELECT c FROM ContractFile c WHERE c.ownerId = :ownerId AND c.status = 2 ORDER BY c.updateTime DESC")
    List<ContractFile> findSignedContracts(@Param("ownerId") Long ownerId);

    /**
     * 检查文件哈希是否已存在
     *
     * @param fileHash 文件哈希值
     * @return 是否存在
     */
    boolean existsByFileHash(String fileHash);

    /**
     * 统计所有者在指定时间范围内的合同数量
     *
     * @param ownerId   所有者ID
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @return 合同数量
     */
    @Query("SELECT COUNT(c) FROM ContractFile c WHERE c.ownerId = :ownerId AND c.createTime BETWEEN :startTime AND :endTime")
    long countByOwnerAndTimeRange(@Param("ownerId") Long ownerId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}
