'use client';

/**
 * 应用侧边栏组件
 *
 * 提供全局导航菜单，包含印章管理、合同管理、电子签名等功能模块
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Stamp,
  FileText,
  PenTool,
  History,
  Home,
  Settings,
  ChevronRight,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

/**
 * 导航菜单配置
 */
const menuItems = [
  {
    title: '首页',
    url: '/',
    icon: Home,
    description: '系统概览',
  },
  {
    title: '印章管理',
    url: '/seals',
    icon: Stamp,
    description: '管理企业印章',
  },
  {
    title: '合同管理',
    url: '/contracts',
    icon: FileText,
    description: '合同文件管理',
  },
  {
    title: '电子签名',
    url: '/signatures',
    icon: PenTool,
    description: '个人签名管理',
  },
  {
    title: '签章记录',
    url: '/records',
    icon: History,
    description: '操作历史记录',
  },
];

/**
 * 系统设置菜单
 */
const settingsItems = [
  {
    title: '系统设置',
    url: '/settings',
    icon: Settings,
    description: '系统配置',
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  /**
   * 判断菜单项是否激活
   */
  const isActive = (url: string) => {
    if (url === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar>
      {/* 侧边栏头部 - Logo 和标题 */}
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <Stamp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">太初星集</h1>
            <p className="text-xs text-muted-foreground">电子签章系统</p>
          </div>
        </Link>
      </SidebarHeader>

      {/* 侧边栏内容 - 主菜单 */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>功能导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.description}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {isActive(item.url) && (
                        <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 系统设置分组 */}
        <SidebarGroup>
          <SidebarGroupLabel>系统</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.description}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 侧边栏底部 */}
      <SidebarFooter className="border-t px-4 py-3">
        <div className="text-xs text-muted-foreground text-center">
          <p>&copy; 2026 太初星集</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
