package cn.tcxingji.seal.context;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户上下文
 * <p>
 * 使用 ThreadLocal 存储当前请求的用户信息，
 * 供 Controller 和 Service 层获取当前登录用户
 * </p>
 *
 * @author TC System
 * @since 2026-01-03
 */
public class UserContext {

    /**
     * ThreadLocal 存储当前用户信息
     */
    private static final ThreadLocal<UserInfo> CURRENT_USER = new ThreadLocal<>();

    /**
     * 设置当前用户
     *
     * @param userInfo 用户信息
     */
    public static void setCurrentUser(UserInfo userInfo) {
        CURRENT_USER.set(userInfo);
    }

    /**
     * 获取当前用户
     *
     * @return 用户信息，未登录返回 null
     */
    public static UserInfo getCurrentUser() {
        return CURRENT_USER.get();
    }

    /**
     * 获取当前用户ID
     *
     * @return 用户ID，未登录返回 null
     */
    public static Long getCurrentUserId() {
        UserInfo user = CURRENT_USER.get();
        return user != null ? user.getUserId() : null;
    }

    /**
     * 获取当前用户名
     *
     * @return 用户名，未登录返回 null
     */
    public static String getCurrentUsername() {
        UserInfo user = CURRENT_USER.get();
        return user != null ? user.getUsername() : null;
    }

    /**
     * 判断当前用户是否为管理员
     *
     * @return true-是管理员，false-不是或未登录
     */
    public static boolean isAdmin() {
        UserInfo user = CURRENT_USER.get();
        return user != null && Boolean.TRUE.equals(user.getIsAdmin());
    }

    /**
     * 清除当前用户（请求结束时调用）
     */
    public static void clear() {
        CURRENT_USER.remove();
    }

    /**
     * 用户信息（存储在 ThreadLocal 中的数据结构）
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        /**
         * 用户ID
         */
        private Long userId;

        /**
         * 用户名
         */
        private String username;

        /**
         * 昵称
         */
        private String nickname;

        /**
         * 是否管理员
         */
        private Boolean isAdmin;
    }
}
