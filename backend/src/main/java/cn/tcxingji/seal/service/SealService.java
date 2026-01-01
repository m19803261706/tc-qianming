package cn.tcxingji.seal.service;

import cn.tcxingji.seal.dto.request.SealCreateRequest;
import cn.tcxingji.seal.dto.request.SealQueryRequest;
import cn.tcxingji.seal.dto.request.SealUpdateRequest;
import cn.tcxingji.seal.dto.response.PageResponse;
import cn.tcxingji.seal.dto.response.SealResponse;

import java.util.List;

/**
 * 印章服务接口
 * <p>
 * 定义印章管理的业务逻辑方法
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
public interface SealService {

    /**
     * 创建印章
     *
     * @param request 创建请求
     * @return 印章响应
     */
    SealResponse create(SealCreateRequest request);

    /**
     * 根据ID获取印章详情
     *
     * @param id 印章ID
     * @return 印章响应
     */
    SealResponse getById(Long id);

    /**
     * 更新印章
     *
     * @param id      印章ID
     * @param request 更新请求
     * @return 印章响应
     */
    SealResponse update(Long id, SealUpdateRequest request);

    /**
     * 删除印章
     *
     * @param id 印章ID
     */
    void delete(Long id);

    /**
     * 更新印章状态（启用/禁用）
     *
     * @param id     印章ID
     * @param status 新状态
     * @return 印章响应
     */
    SealResponse updateStatus(Long id, Integer status);

    /**
     * 分页查询印章列表
     *
     * @param request 查询请求
     * @return 分页响应
     */
    PageResponse<SealResponse> queryPage(SealQueryRequest request);

    /**
     * 获取所有者的所有印章
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @return 印章列表
     */
    List<SealResponse> listByOwner(Long ownerId, Integer ownerType);

    /**
     * 获取所有者的启用印章
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @return 印章列表
     */
    List<SealResponse> listEnabledByOwner(Long ownerId, Integer ownerType);
}
