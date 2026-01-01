package cn.tcxingji.seal.service;

import cn.tcxingji.seal.dto.request.SignatureCreateRequest;
import cn.tcxingji.seal.dto.request.SignatureQueryRequest;
import cn.tcxingji.seal.dto.response.PageResponse;
import cn.tcxingji.seal.dto.response.SignatureResponse;

import java.util.List;

/**
 * 个人签名服务接口
 * <p>
 * 提供个人签名的增删改查等业务功能
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
public interface SignatureService {

    /**
     * 创建签名
     *
     * @param request 创建请求
     * @return 签名响应
     */
    SignatureResponse create(SignatureCreateRequest request);

    /**
     * 获取签名详情
     *
     * @param id 签名ID
     * @return 签名响应
     */
    SignatureResponse getById(Long id);

    /**
     * 删除签名
     *
     * @param id 签名ID
     */
    void delete(Long id);

    /**
     * 设置默认签名
     * <p>
     * 将指定签名设为用户的默认签名，同时取消该用户其他签名的默认状态
     * </p>
     *
     * @param id     签名ID
     * @param userId 用户ID
     * @return 签名响应
     */
    SignatureResponse setDefault(Long id, Long userId);

    /**
     * 获取用户的签名列表
     *
     * @param userId 用户ID
     * @return 签名列表
     */
    List<SignatureResponse> listByUserId(Long userId);

    /**
     * 获取用户的启用签名列表
     *
     * @param userId 用户ID
     * @return 签名列表
     */
    List<SignatureResponse> listEnabledByUserId(Long userId);

    /**
     * 获取用户的默认签名
     *
     * @param userId 用户ID
     * @return 默认签名（可能为 null）
     */
    SignatureResponse getDefaultByUserId(Long userId);

    /**
     * 分页查询签名
     *
     * @param request 查询请求
     * @return 分页响应
     */
    PageResponse<SignatureResponse> queryPage(SignatureQueryRequest request);

    /**
     * 更新签名状态
     *
     * @param id     签名ID
     * @param status 新状态（0-禁用 1-启用）
     * @return 签名响应
     */
    SignatureResponse updateStatus(Long id, Integer status);
}
