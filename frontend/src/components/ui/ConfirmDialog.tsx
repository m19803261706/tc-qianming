/**
 * 确认对话框组件
 *
 * 基于 AlertDialog 封装的通用确认弹窗
 * 支持危险操作样式和加载状态
 *
 * 兼容两种属性命名风格：
 * - isOpen/onClose/message/danger（印章/合同页面使用）
 * - open/onOpenChange/description/destructive（账号管理页面使用）
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  /** 是否打开弹窗（兼容 isOpen 和 open 两种命名） */
  isOpen?: boolean;
  open?: boolean;
  /** 关闭弹窗回调（兼容 onClose 和 onOpenChange 两种命名） */
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  /** 确认按钮回调 */
  onConfirm: () => void;
  /** 弹窗标题 */
  title: string;
  /** 弹窗消息内容（兼容 message 和 description 两种命名） */
  message?: string;
  description?: string;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 是否为危险操作（红色按钮）（兼容 danger 和 destructive 两种命名） */
  danger?: boolean;
  destructive?: boolean;
  /** 是否正在加载 */
  loading?: boolean;
}

/**
 * 确认对话框组件
 *
 * @example
 * // 用法一（印章/合同页面风格）
 * <ConfirmDialog
 *   isOpen={deleteDialogOpen}
 *   onClose={() => setDeleteDialogOpen(false)}
 *   onConfirm={handleDelete}
 *   title="确认删除"
 *   message="确定要删除吗？此操作不可恢复。"
 *   confirmText="删除"
 *   danger
 *   loading={deleteLoading}
 * />
 *
 * @example
 * // 用法二（账号管理页面风格）
 * <ConfirmDialog
 *   open={deleteConfirmOpen}
 *   onOpenChange={setDeleteConfirmOpen}
 *   title="确认删除"
 *   description="确定要删除吗？此操作不可恢复。"
 *   onConfirm={handleDelete}
 *   confirmText="删除"
 *   destructive
 * />
 */
export function ConfirmDialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  onConfirm,
  title,
  message,
  description,
  confirmText = '确认',
  cancelText = '取消',
  danger = false,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  // 兼容两种属性命名
  const isDialogOpen = isOpen ?? open ?? false;
  const dialogMessage = message ?? description ?? '';
  const isDanger = danger || destructive;

  // 处理关闭事件
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      if (onClose) {
        onClose();
      } else if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={isDanger ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                处理中...
              </span>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// 默认导出以兼容 `import ConfirmDialog from ...` 语法
export default ConfirmDialog;
