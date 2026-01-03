package cn.tcxingji.seal.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * CORS 跨域配置
 * <p>
 * 允许前端开发服务器访问后端 API
 * </p>
 *
 * @author TC System
 * @since 2026-01-02
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // 允许的来源（前端地址）- 支持多个开发端口和生产环境
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://localhost:3001");
        config.addAllowedOrigin("http://localhost:3002");
        config.addAllowedOrigin("http://localhost:3003");
        config.addAllowedOrigin("http://127.0.0.1:3000");
        config.addAllowedOrigin("http://127.0.0.1:3001");
        config.addAllowedOrigin("http://127.0.0.1:3002");
        config.addAllowedOrigin("http://127.0.0.1:3003");
        // 生产环境（华为云服务器）
        config.addAllowedOrigin("http://60.10.240.4:8100");
        config.addAllowedOrigin("http://60.10.240.4:3000");
        config.addAllowedOrigin("http://60.10.240.4:8099");

        // 允许的请求头
        config.addAllowedHeader("*");

        // 允许的请求方法
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");

        // 允许携带凭证（Cookie 等）
        config.setAllowCredentials(true);

        // 预检请求缓存时间（秒）
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 对所有路径生效
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
