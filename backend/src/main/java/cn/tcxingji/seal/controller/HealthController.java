package cn.tcxingji.seal.controller;

import cn.tcxingji.seal.dto.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 * 用于 Docker 容器健康检查和运维监控
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * 健康检查端点
     * 返回服务状态信息
     */
    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("service", "tc-seal-backend");
        data.put("version", "1.0.0");
        data.put("timestamp", LocalDateTime.now().toString());
        return ApiResponse.success(data);
    }
}
