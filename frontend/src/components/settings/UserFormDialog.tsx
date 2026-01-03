'use client';

/**
 * 用户表单弹窗组件
 *
 * 用于新增和编辑用户
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { User, CreateUserRequest, UpdateUserRequest, UserStatus } from '@/lib/user-api';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (data: CreateUserRequest | UpdateUserRequest, isEdit: boolean) => Promise<void>;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: UserFormDialogProps) {
  const isEdit = !!user;

  // 表单状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState<UserStatus>(UserStatus.ENABLED);

  // 加载和错误状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化表单
  useEffect(() => {
    if (open) {
      if (user) {
        setUsername(user.username);
        setPassword('');
        setNickname(user.nickname || '');
        setIsAdmin(user.isAdmin);
        setStatus(user.status);
      } else {
        setUsername('');
        setPassword('');
        setNickname('');
        setIsAdmin(false);
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
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!isEdit && !password.trim()) {
      setError('请输入密码');
      return;
    }
    if (!isEdit && password.length < 6) {
      setError('密码长度不能少于6位');
      return;
    }

    setIsLoading(true);

    try {
      if (isEdit) {
        const updateData: UpdateUserRequest = {
          nickname: nickname.trim() || undefined,
          isAdmin,
          status,
        };
        if (password.trim()) {
          updateData.password = password;
        }
        await onSave(updateData, true);
      } else {
        const createData: CreateUserRequest = {
          username: username.trim(),
          password,
          nickname: nickname.trim() || undefined,
          isAdmin,
        };
        await onSave(createData, false);
      }
      onOpenChange(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('操作失败，请重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? '编辑用户' : '新增用户'}</DialogTitle>
            <DialogDescription>
              {isEdit ? '修改用户信息，留空密码则不修改' : '创建新的系统用户'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 错误提示 */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            {/* 用户名 */}
            <div className="grid gap-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                disabled={isEdit || isLoading}
              />
            </div>

            {/* 密码 */}
            <div className="grid gap-2">
              <Label htmlFor="password">
                密码{isEdit && <span className="text-muted-foreground text-xs ml-1">(留空不修改)</span>}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? '留空则不修改密码' : '请输入密码'}
                disabled={isLoading}
              />
            </div>

            {/* 昵称 */}
            <div className="grid gap-2">
              <Label htmlFor="nickname">昵称</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入昵称（可选）"
                disabled={isLoading}
              />
            </div>

            {/* 管理员 */}
            <div className="flex items-center justify-between">
              <Label htmlFor="isAdmin">管理员权限</Label>
              <Switch
                id="isAdmin"
                checked={isAdmin}
                onCheckedChange={setIsAdmin}
                disabled={isLoading}
              />
            </div>

            {/* 状态（仅编辑时显示） */}
            {isEdit && (
              <div className="flex items-center justify-between">
                <Label htmlFor="status">启用状态</Label>
                <Switch
                  id="status"
                  checked={status === UserStatus.ENABLED}
                  onCheckedChange={(checked) =>
                    setStatus(checked ? UserStatus.ENABLED : UserStatus.DISABLED)
                  }
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
