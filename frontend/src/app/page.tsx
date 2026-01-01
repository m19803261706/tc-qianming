import Link from 'next/link';
import { Stamp, FileText, PenTool, History, TrendingUp, Shield, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 太初星集电子签章系统 - 首页仪表盘
 *
 * 显示系统概览、快速入口和统计信息
 */
export default function Home() {
  // 功能快捷入口
  const quickActions = [
    {
      title: '印章管理',
      description: '管理企业印章、财务章、法人章',
      href: '/seals',
      icon: Stamp,
      color: 'bg-blue-500',
    },
    {
      title: '合同管理',
      description: '上传、预览待签章合同文件',
      href: '/contracts',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: '电子签名',
      description: '创建和管理个人签名',
      href: '/signatures',
      icon: PenTool,
      color: 'bg-purple-500',
    },
    {
      title: '签章记录',
      description: '查看签章历史和审计日志',
      href: '/records',
      icon: History,
      color: 'bg-orange-500',
    },
  ];

  // 统计数据（后续可以从 API 获取）
  const stats = [
    { label: '印章总数', value: '-', icon: Stamp, trend: '+2 本月新增' },
    { label: '待签合同', value: '-', icon: FileText, trend: '3 个待处理' },
    { label: '本月签章', value: '-', icon: PenTool, trend: '同比 +15%' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">欢迎使用太初星集电子签章系统</h1>
        <p className="text-blue-100 mb-4">
          安全、高效、便捷的企业电子签章解决方案
        </p>
        <div className="flex gap-4">
          <Link
            href="/seals"
            className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            开始使用
          </Link>
          <Link
            href="/settings"
            className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-400 transition-colors"
          >
            系统设置
          </Link>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 快捷入口 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">快捷入口</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white mb-2`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 系统信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              安全保障
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• 采用国密算法保障签章安全</p>
            <p>• 完整的操作审计日志</p>
            <p>• 支持多级权限管理</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              最近动态
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="text-center py-4">暂无最近动态</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
