package cn.tcxingji.seal.exception;

import lombok.Getter;

/**
 * 业务异常类
 * <p>
 * 用于处理业务逻辑异常
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Getter
public class BusinessException extends RuntimeException {

    /**
     * 错误码
     */
    private final Integer code;

    /**
     * 构造函数
     *
     * @param message 错误消息
     */
    public BusinessException(String message) {
        super(message);
        this.code = 400;
    }

    /**
     * 构造函数
     *
     * @param code    错误码
     * @param message 错误消息
     */
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }
}
