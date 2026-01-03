'use client';

/**
 * 账号管理页面
 *
 * 系统设置 - 账号管理，提供用户的增删改查功能
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UserFormDialog } from '@/components/settings/UserFormDialog';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserStatus,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '@/lib/user-api';
import { Loader2, Plus, Pencil, Trash2, Users, ShieldCheck, ShieldX } from 'lucide-react';

export default function AccountsPage() {
  // 数据状态
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 弹窗状态
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * 加载用户列表
   */
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getUsers();
      if (response.success) {
        setUsers(response.data || []);
      } else {
        setError(response.message || '加载用户列表失败');
      }
    } catch (err) {
      console.error('加载用户列表错误:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * 打开新增弹窗
   */
  const handleAdd = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  /**
   * 打开删除确认
   */
  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setDeleteConfirmOpen(true);
  };

  /**
   * 保存用户（新增或编辑）
   */
  const handleSave = async (data: CreateUserRequest | UpdateUserRequest, isEdit: boolean) => {
    if (isEdit && editingUser) {
      const response = await updateUser(editingUser.id, data as UpdateUserRequest);
      if (!response.success) {
        throw new Error(response.message || '更新失败');
      }
    } else {
      const response = await createUser(data as CreateUserRequest);
      if (!response.success) {
        throw new Error(response.message || '创建失败');
      }
    }
    // 刷新列表
    await loadUsers();
  };

  /**
   * 确认删除
   */
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    try {
      setIsDeleting(true);
      const response = await deleteUser(deletingUser.id);
      if (response.success) {
        // 刷新列表
        await loadUsers();
        setDeleteConfirmOpen(false);
        setDeletingUser(null);
      } else {
        alert(response.message || '删除失败');
      }
    } catch (err) {
      console.error('删除用户错误:', err);
      alert('删除失败，请稍后重试');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">账号管理</h1>
          <p className="text-muted-foreground">管理系统用户账号</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          新增用户
        </Button>
      </div>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            用户列表
          </CardTitle>
          <CardDescription>共 {users.length} 个用户</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-destructive">
              <p>{error}</p>
              <Button variant="outline" onClick={loadUsers} className="mt-4">
                重试
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mb-4" />
              <p>暂无用户数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">用户名</th>
                    <th className="text-left py-3 px-4 font-medium">昵称</th>
                    <th className="text-left py-3 px-4 font-medium">状态</th>
                    <th className="text-left py-3 px-4 font-medium">管理员</th>
                    <th className="text-left py-3 px-4 font-medium">创建时间</th>
                    <th className="text-right py-3 px-4 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{user.username}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {user.nickname || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={user.status === UserStatus.ENABLED ? 'default' : 'secondary'}
                        >
                          {user.status === UserStatus.ENABLED ? '启用' : '禁用'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {user.isAdmin ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <ShieldCheck className="w-4 h-4" />
                            <span>是</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ShieldX className="w-4 h-4" />
                            <span>否</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                            disabled={user.isAdmin}
                            title={user.isAdmin ? '不能删除管理员' : '删除用户'}
                          >
                            <Trash2
                              className={`w-4 h-4 ${
                                user.isAdmin ? 'text-muted-foreground' : 'text-destructive'
                              }`}
                            />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 新增/编辑弹窗 */}
      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
        onSave={handleSave}
      />

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="确认删除"
        description={`确定要删除用户「${deletingUser?.username}」吗？此操作不可撤销。`}
        onConfirm={handleDeleteConfirm}
        confirmText={isDeleting ? '删除中...' : '删除'}
        destructive
      />
    </div>
  );
}
