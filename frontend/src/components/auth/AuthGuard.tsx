'use client';

/**
 * 路由守卫组件
 *
 * 保护需要认证的页面：
 * - 未登录用户访问受保护页面 → 跳转登录页
 * - 已登录用户访问登录页 → 跳转首页
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * 公开页面路径（不需要登录）
 */
const PUBLIC_PATHS = ['/login'];

/**
 * 检查路径是否为公开页面
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 认证守卫组件
 *
 * 使用方法：在需要保护的布局或页面中包裹此组件
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 还在加载中，不做任何操作
    if (isLoading) return;

    const isPublic = isPublicPath(pathname);

    if (!isAuthenticated && !isPublic) {
      // 未登录且访问受保护页面 → 跳转登录页
      console.log('[AuthGuard] 未登录，跳转到登录页');
      router.replace('/login');
    } else if (isAuthenticated && isPublic) {
      // 已登录且访问公开页面（如登录页） → 跳转首页
      console.log('[AuthGuard] 已登录，跳转到首页');
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // 加载中显示 loading 状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">正在加载...</p>
        </div>
      </div>
    );
  }

  // 未登录且访问受保护页面时，显示 loading（等待跳转）
  if (!isAuthenticated && !isPublicPath(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">正在跳转到登录页...</p>
        </div>
      </div>
    );
  }

  // 已登录且访问公开页面时，显示 loading（等待跳转）
  if (isAuthenticated && isPublicPath(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">正在跳转...</p>
        </div>
      </div>
    );
  }

  // 正常渲染子组件
  return <>{children}</>;
}
