package cn.tcxingji.seal.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 密码工具类
 *
 * 使用 BCrypt 算法进行密码加密和验证
 *
 * @author TC System
 * @since 1.0.0
 */
@Component
public class PasswordUtil {

    /**
     * BCrypt 密码编码器
     * strength=10 表示加密强度，值越大越安全但性能越低
     */
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);

    /**
     * 加密密码
     *
     * @param rawPassword 原始密码
     * @return 加密后的密码字符串
     */
    public String encode(String rawPassword) {
        if (rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("密码不能为空");
        }
        return encoder.encode(rawPassword);
    }

    /**
     * 验证密码
     *
     * @param rawPassword     原始密码（用户输入）
     * @param encodedPassword 加密后的密码（数据库存储）
     * @return true-密码匹配，false-密码不匹配
     */
    public boolean matches(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }
        return encoder.matches(rawPassword, encodedPassword);
    }

    /**
     * 生成加密密码（静态方法，便于脚本调用）
     *
     * 用于生成 Flyway 迁移脚本中的初始密码
     *
     * @param rawPassword 原始密码
     * @return 加密后的密码字符串
     */
    public static String encodeStatic(String rawPassword) {
        BCryptPasswordEncoder staticEncoder = new BCryptPasswordEncoder(10);
        return staticEncoder.encode(rawPassword);
    }

    /**
     * 主方法，用于命令行生成加密密码
     *
     * 使用方法: java -cp ... cn.tcxingji.seal.util.PasswordUtil yourpassword
     *
     * @param args 命令行参数，第一个参数为要加密的密码
     */
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("用法: PasswordUtil <password>");
            System.out.println("示例: PasswordUtil tcxj888");
            return;
        }
        String password = args[0];
        String encoded = encodeStatic(password);
        System.out.println("原始密码: " + password);
        System.out.println("加密密码: " + encoded);
    }
}
