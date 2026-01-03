package cn.tcxingji.seal.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 创建用户请求 DTO
 *
 * @author TC System
 * @since 2026-01-03
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateRequest {

    /**
     * 用户名（登录名）
     */
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 50, message = "用户名长度必须在 2-50 个字符之间")
    private String username;

    /**
     * 密码
     */
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 100, message = "密码长度必须在 6-100 个字符之间")
    private String password;

    /**
     * 昵称（显示名称）
     */
    @Size(max = 50, message = "昵称长度不能超过 50 个字符")
    private String nickname;

    /**
     * 状态（0: 禁用, 1: 启用）
     */
    private Integer status = 1;
}
