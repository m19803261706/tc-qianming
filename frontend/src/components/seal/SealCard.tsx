'use client';

import Image from 'next/image';
import { type Seal, SEAL_STATUS } from '@/lib/seal-api';

interface SealCardProps {
  seal: Seal;
  onEdit: (seal: Seal) => void;
  onDelete: (seal: Seal) => void;
  onToggleStatus: (seal: Seal) => void;
}

/**
 * 印章卡片组件
 */
export default function SealCard({
  seal,
  onEdit,
  onDelete,
  onToggleStatus,
}: SealCardProps) {
  const status = SEAL_STATUS.find(s => s.value === seal.status);
  const isEnabled = seal.status === 1;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* 印章图片 */}
      <div className="relative h-40 bg-gray-50 flex items-center justify-center">
        {seal.sealImageUrl ? (
          <Image
            src={seal.sealImageUrl}
            alt={seal.sealName}
            fill
            className="object-contain p-4"
            unoptimized
          />
        ) : (
          <div className="text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}

        {/* 状态标签 */}
        <span
          className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${
            isEnabled
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {status?.label || '未知'}
        </span>
      </div>

      {/* 印章信息 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate" title={seal.sealName}>
          {seal.sealName}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{seal.sealTypeDesc}</p>
        {seal.ownerName && (
          <p className="text-xs text-gray-400 mt-1">所属: {seal.ownerName}</p>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
        <button
          onClick={() => onToggleStatus(seal)}
          className={`text-sm font-medium transition-colors ${
            isEnabled
              ? 'text-orange-600 hover:text-orange-700'
              : 'text-green-600 hover:text-green-700'
          }`}
        >
          {isEnabled ? '禁用' : '启用'}
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => onEdit(seal)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(seal)}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
