package cn.tcxingji.seal.repository;

import cn.tcxingji.seal.entity.SealRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 签章记录 Repository 接口
 * <p>
 * 提供签章记录的数据访问层操作
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Repository
public interface SealRecordRepository extends JpaRepository<SealRecord, Long>, JpaSpecificationExecutor<SealRecord> {

    /**
     * 根据合同ID查询签章记录列表
     *
     * @param contractId 合同文件ID
     * @return 签章记录列表
     */
    List<SealRecord> findByContractId(Long contractId);

    /**
     * 根据合同ID分页查询签章记录
     *
     * @param contractId 合同文件ID
     * @param pageable   分页参数
     * @return 签章记录分页列表
     */
    Page<SealRecord> findByContractId(Long contractId, Pageable pageable);

    /**
     * 根据印章ID查询签章记录列表
     *
     * @param sealId 印章ID
     * @return 签章记录列表
     */
    List<SealRecord> findBySealId(Long sealId);

    /**
     * 根据操作人ID查询签章记录列表
     *
     * @param operatorId 操作人ID
     * @return 签章记录列表
     */
    List<SealRecord> findByOperatorId(Long operatorId);

    /**
     * 根据操作人ID分页查询签章记录
     *
     * @param operatorId 操作人ID
     * @param pageable   分页参数
     * @return 签章记录分页列表
     */
    Page<SealRecord> findByOperatorId(Long operatorId, Pageable pageable);

    /**
     * 根据签章类型查询签章记录列表
     *
     * @param sealType 签章类型
     * @return 签章记录列表
     */
    List<SealRecord> findBySealType(Integer sealType);

    /**
     * 根据合同ID和签章类型查询签章记录
     *
     * @param contractId 合同文件ID
     * @param sealType   签章类型
     * @return 签章记录列表
     */
    List<SealRecord> findByContractIdAndSealType(Long contractId, Integer sealType);

    /**
     * 根据合同ID和页码查询签章记录
     *
     * @param contractId 合同文件ID
     * @param pageNumber 页码
     * @return 签章记录列表
     */
    List<SealRecord> findByContractIdAndPageNumber(Long contractId, Integer pageNumber);

    /**
     * 统计合同的签章次数
     *
     * @param contractId 合同文件ID
     * @return 签章次数
     */
    long countByContractId(Long contractId);

    /**
     * 统计印章的使用次数
     *
     * @param sealId 印章ID
     * @return 使用次数
     */
    long countBySealId(Long sealId);

    /**
     * 统计操作人的签章次数
     *
     * @param operatorId 操作人ID
     * @return 签章次数
     */
    long countByOperatorId(Long operatorId);

    /**
     * 根据时间范围查询签章记录
     *
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @return 签章记录列表
     */
    @Query("SELECT r FROM SealRecord r WHERE r.sealTime BETWEEN :startTime AND :endTime ORDER BY r.sealTime DESC")
    List<SealRecord> findByTimeRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 根据时间范围分页查询签章记录
     *
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @param pageable  分页参数
     * @return 签章记录分页列表
     */
    @Query("SELECT r FROM SealRecord r WHERE r.sealTime BETWEEN :startTime AND :endTime ORDER BY r.sealTime DESC")
    Page<SealRecord> findByTimeRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime, Pageable pageable);

    /**
     * 查询合同的骑缝章记录
     *
     * @param contractId 合同文件ID
     * @return 骑缝章记录列表
     */
    @Query("SELECT r FROM SealRecord r WHERE r.contractId = :contractId AND r.sealType = 2 ORDER BY r.pageNumber")
    List<SealRecord> findPerforationRecords(@Param("contractId") Long contractId);

    /**
     * 查询操作人在指定时间范围内的签章统计
     *
     * @param operatorId 操作人ID
     * @param startTime  开始时间
     * @param endTime    结束时间
     * @return 签章次数
     */
    @Query("SELECT COUNT(r) FROM SealRecord r WHERE r.operatorId = :operatorId AND r.sealTime BETWEEN :startTime AND :endTime")
    long countByOperatorAndTimeRange(@Param("operatorId") Long operatorId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 删除合同的所有签章记录
     *
     * @param contractId 合同文件ID
     */
    void deleteByContractId(Long contractId);
}
