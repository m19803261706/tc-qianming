/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 standalone 输出模式（用于 Docker 部署）
  output: 'standalone',

  // 图片优化配置
  images: {
    // 允许的图片域名
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '60.10.240.4',
      },
    ],
    // 禁用图片优化（如需开启可删除此行）
    unoptimized: true,
  },
};

export default nextConfig;
