package cn.tcxingji.seal.dto.auth;

import cn.tcxingji.seal.entity.SysUser;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 用户信息 DTO
 *
 * @author TC System
 * @since 2026-01-03
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {

    /**
     * 用户ID
     */
    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 状态
     */
    private Integer status;

    /**
     * 是否管理员
     */
    private Boolean isAdmin;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 从实体类转换
     *
     * @param user 用户实体
     * @return 用户信息 DTO
     */
    public static UserInfo fromEntity(SysUser user) {
        if (user == null) {
            return null;
        }
        return UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .status(user.getStatus())
                .isAdmin(SysUser.IsAdmin.YES == user.getIsAdmin())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
