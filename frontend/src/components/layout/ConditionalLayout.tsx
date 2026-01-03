'use client';

/**
 * 条件布局组件
 *
 * 根据当前路径决定是否显示 DashboardLayout
 * - 登录页：不显示侧边栏布局
 * - 其他页面：显示 DashboardLayout
 */

import { usePathname } from 'next/navigation';
import { DashboardLayout } from './DashboardLayout';

/**
 * 不需要 DashboardLayout 的页面路径
 */
const NO_LAYOUT_PATHS = ['/login'];

/**
 * 检查路径是否不需要布局
 */
function isNoLayoutPath(pathname: string): boolean {
  return NO_LAYOUT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

/**
 * 条件布局组件
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const noLayout = isNoLayoutPath(pathname);

  if (noLayout) {
    // 登录页等不需要侧边栏的页面
    return <>{children}</>;
  }

  // 正常页面显示 DashboardLayout
  return <DashboardLayout>{children}</DashboardLayout>;
}
