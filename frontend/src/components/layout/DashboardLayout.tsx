'use client';

/**
 * 仪表盘布局组件
 *
 * 提供带有侧边栏的主布局结构，包含：
 * - 左侧导航栏（AppSidebar）
 * - 主内容区域（SidebarInset）
 * - 顶部导航栏（包含移动端菜单触发器）
 */

import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';

/**
 * 路由到面包屑映射
 */
const routeLabels: Record<string, string> = {
  '/': '首页',
  '/seals': '印章管理',
  '/contracts': '合同管理',
  '/signatures': '电子签名',
  '/records': '签章记录',
  '/settings': '系统设置',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  /**
   * 生成面包屑导航
   */
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: { href: string; label: string; isLast: boolean }[] = [];

    // 首页始终显示
    breadcrumbs.push({
      href: '/',
      label: '首页',
      isLast: segments.length === 0,
    });

    // 添加路径段
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[currentPath] || segment;
      breadcrumbs.push({
        href: currentPath,
        label,
        isLast: index === segments.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      {/* 左侧导航栏 */}
      <AppSidebar />

      {/* 主内容区域 */}
      <SidebarInset>
        {/* 顶部导航栏 */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          {/* 移动端侧边栏触发器 */}
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          {/* 面包屑导航 */}
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
