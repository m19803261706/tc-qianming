import Link from 'next/link';

/**
 * 太初星集电子签章系统 - 首页
 */
export default function Home() {
  const features = [
    {
      title: '印章管理',
      description: '管理企业印章、财务章、法人章等各类印章',
      href: '/seals',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: '合同管理',
      description: '上传、预览和管理待签章的合同文件',
      href: '/contracts',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: '电子签名',
      description: '创建和管理个人手写签名或字体签名',
      href: '/signatures',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
    {
      title: '签章记录',
      description: '查看所有签章操作的历史记录和审计日志',
      href: '/records',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">太初星集</span>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <Link href="/seals" className="text-gray-600 hover:text-gray-900 transition-colors">
                印章管理
              </Link>
              <Link href="/contracts" className="text-gray-600 hover:text-gray-900 transition-colors">
                合同管理
              </Link>
              <Link href="/signatures" className="text-gray-600 hover:text-gray-900 transition-colors">
                电子签名
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主标题区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            电子签章系统
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            安全、高效、便捷的企业电子签章解决方案，让合同签署更简单
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/seals"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              开始使用
            </Link>
            <Link
              href="#features"
              className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow"
            >
              了解更多
            </Link>
          </div>
        </div>
      </div>

      {/* 功能卡片 */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2026 太初星集电子签章系统. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
