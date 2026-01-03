'use client';

/**
 * 全局 Providers 组件
 *
 * 包裹所有需要客户端运行的 Context Provider
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { setUnauthorizedCallback } from '@/lib/api-client';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * 内部组件：设置 401 回调
 */
function AuthCallbackSetter({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // 设置 401 响应的回调，跳转到登录页
    setUnauthorizedCallback(() => {
      console.log('[Providers] 401 回调触发，跳转到登录页');
      router.replace('/login');
    });
  }, [router]);

  return <>{children}</>;
}

/**
 * 全局 Providers
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <AuthCallbackSetter>
        <AuthGuard>{children}</AuthGuard>
      </AuthCallbackSetter>
    </AuthProvider>
  );
}
