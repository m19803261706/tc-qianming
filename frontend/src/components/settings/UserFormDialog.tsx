'use client';

/**
 * 用户表单弹窗组件
 *
 * 用于新增和编辑用户
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, CreateUserRequest, UpdateUserRequest, UserStatus } from '@/lib/user-api';
import { Loader2 } from 'lucide-react';

interface UserFormDialogProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onOpenChange: (open: boolean) => void;
  /** 编辑模式下的用户数据（为空表示新增） */
  user?: User | null;
  /** 保存回调 */
  onSave: (data: CreateUserRequest | UpdateUserRequest, isEdit: boolean) => Promise<void>;
}

/**
 * 用户表单弹窗
 */
export function UserFormDialog({ open, onOpenChange, user, onSave }: UserFormDialogProps) {
  const isEdit = !!user;

  // 表单状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [status, setStatus] = useState(UserStatus.ENABLED);

  // 加载和错误状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化表单数据
  useEffect(() => {
    if (open) {
      if (user) {
        // 编辑模式：填充数据
        setUsername(user.username);
        setPassword(''); // 密码不回填
        setNickname(user.nickname || '');
        setStatus(user.status);
      } else {
        // 新增模式：重置表单
        setUsername('');
        setPassword('');
        setNickname('');
        setStatus(UserStatus.ENABLED);
      }
      setError(null);
    }
  }, [open, user]);

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 表单验证
    if (!isEdit && !username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!isEdit && !password.trim()) {
      setError('请输入密码');
      return;
    }
    if (!isEdit && password.length < 6) {
      setError('密码长度至少 6 位');
      return;
    }
    if (isEdit && password && password.length < 6) {
      setError('密码长度至少 6 位');
      return;
    }

    setIsLoading(true);

    try {
      if (isEdit) {
        // 编辑模式
        const data: UpdateUserRequest = {
          nickname: nickname.trim() || undefined,
          status,
        };
        // 只有填写了密码才更新密码
        if (password.trim()) {
          data.password = password;
        }
        await onSave(data, true);
      } else {
        // 新增模式
        const data: CreateUserRequest = {
          username: username.trim(),
          password: password,
          nickname: nickname.trim() || undefined,
          status,
        };
        await onSave(data, false);
      }
      onOpenChange(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('操作失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑用户' : '新增用户'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改用户信息，密码留空则不修改' : '创建新的系统用户'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* 错误提示 */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            {/* 用户名 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                用户名
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
                placeholder="请输入用户名"
                disabled={isEdit || isLoading}
                autoComplete="off"
              />
            </div>

            {/* 密码 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                密码
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder={isEdit ? '留空则不修改密码' : '请输入密码'}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            {/* 昵称 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nickname" className="text-right">
                昵称
              </Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="col-span-3"
                placeholder="请输入昵称（可选）"
                disabled={isLoading}
              />
            </div>

            {/* 状态 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">状态</Label>
              <div className="col-span-3 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === UserStatus.ENABLED}
                    onChange={() => setStatus(UserStatus.ENABLED)}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span>启用</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === UserStatus.DISABLED}
                    onChange={() => setStatus(UserStatus.DISABLED)}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span>禁用</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
