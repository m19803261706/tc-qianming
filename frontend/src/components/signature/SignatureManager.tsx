'use client';

import { useState, useEffect, useCallback } from 'react';
import SignaturePad from './SignaturePad';
import FontSignatureGenerator from './FontSignatureGenerator';
import {
  getSignaturesByUserId,
  deleteSignature,
  setDefaultSignature,
  updateSignatureStatus,
  saveHandwriteSignature,
  type Signature,
  SIGNATURE_TYPES,
  SIGNATURE_STATUS,
} from '@/lib/signature-api';

interface SignatureManagerProps {
  /** 用户ID */
  userId: number;
  /** 创建者 */
  createBy?: string;
  /** 选择签名回调 */
  onSelect?: (signature: Signature) => void;
  /** 是否选择模式 */
  selectMode?: boolean;
}

type TabType = 'list' | 'handwrite' | 'font';

/**
 * 签名管理组件
 *
 * 功能：
 * - 签名列表展示
 * - 手写签名创建
 * - 字体签名生成
 * - 设置默认签名
 * - 启用/禁用签名
 * - 删除签名
 */
export default function SignatureManager({
  userId,
  createBy,
  onSelect,
  selectMode = false,
}: SignatureManagerProps) {
  // 签名列表
  const [signatures, setSignatures] = useState<Signature[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 当前标签页
  const [activeTab, setActiveTab] = useState<TabType>('list');
  // 手写签名数据
  const [handwriteData, setHandwriteData] = useState<string | null>(null);
  // 保存状态
  const [saving, setSaving] = useState(false);
  // 操作中的签名ID
  const [operatingId, setOperatingId] = useState<number | null>(null);
  // 错误信息
  const [error, setError] = useState<string | null>(null);
  // 成功提示
  const [success, setSuccess] = useState<string | null>(null);

  // 加载签名列表
  const loadSignatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSignaturesByUserId(userId);
      if (response.success && response.data) {
        setSignatures(response.data);
      } else {
        setError(response.message || '加载签名列表失败');
      }
    } catch (err) {
      console.error('加载签名失败:', err);
      setError('加载签名列表失败');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 初始加载
  useEffect(() => {
    loadSignatures();
  }, [loadSignatures]);

  // 显示成功提示
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  // 保存手写签名
  const handleSaveHandwrite = async () => {
    if (!handwriteData) {
      setError('请先完成签名');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await saveHandwriteSignature({
        userId,
        imageData: handwriteData,
        createBy,
        setDefault: signatures.length === 0, // 如果是第一个签名，设为默认
      });

      if (response.success) {
        showSuccess('签名保存成功');
        setHandwriteData(null);
        setActiveTab('list');
        loadSignatures();
      } else {
        setError(response.message || '保存签名失败');
      }
    } catch (err) {
      console.error('保存签名失败:', err);
      setError('保存签名失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 字体签名生成完成
  const handleFontGenerated = () => {
    showSuccess('签名生成成功');
    setActiveTab('list');
    loadSignatures();
  };

  // 设置默认签名
  const handleSetDefault = async (signature: Signature) => {
    if (signature.isDefault === 1) return;

    setOperatingId(signature.id);
    try {
      const response = await setDefaultSignature(signature.id, userId);
      if (response.success) {
        showSuccess('已设为默认签名');
        loadSignatures();
      } else {
        setError(response.message || '设置失败');
      }
    } catch (err) {
      console.error('设置默认签名失败:', err);
      setError('设置默认签名失败');
    } finally {
      setOperatingId(null);
    }
  };

  // 切换签名状态
  const handleToggleStatus = async (signature: Signature) => {
    const newStatus = signature.status === 1 ? 0 : 1;
    setOperatingId(signature.id);

    try {
      const response = await updateSignatureStatus(signature.id, newStatus);
      if (response.success) {
        showSuccess(newStatus === 1 ? '已启用' : '已禁用');
        loadSignatures();
      } else {
        setError(response.message || '操作失败');
      }
    } catch (err) {
      console.error('更新状态失败:', err);
      setError('更新状态失败');
    } finally {
      setOperatingId(null);
    }
  };

  // 删除签名
  const handleDelete = async (signature: Signature) => {
    if (!confirm('确定要删除此签名吗？此操作不可恢复。')) return;

    setOperatingId(signature.id);
    try {
      const response = await deleteSignature(signature.id);
      if (response.success) {
        showSuccess('签名已删除');
        loadSignatures();
      } else {
        setError(response.message || '删除失败');
      }
    } catch (err) {
      console.error('删除签名失败:', err);
      setError('删除签名失败');
    } finally {
      setOperatingId(null);
    }
  };

  // 获取签名类型标签
  const getTypeLabel = (type: number) => {
    return SIGNATURE_TYPES.find(t => t.value === type)?.label || '未知';
  };

  // 获取状态样式
  const getStatusStyle = (status: number) => {
    const s = SIGNATURE_STATUS.find(s => s.value === status);
    return s?.color === 'green' ? 'text-green-600' : 'text-gray-400';
  };

  // Tab 配置
  const tabs = [
    { key: 'list' as TabType, label: '我的签名', icon: '📋' },
    { key: 'handwrite' as TabType, label: '手写签名', icon: '✍️' },
    { key: 'font' as TabType, label: '字体签名', icon: '🔤' },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tab 切换 */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex-1 py-3 px-4 text-sm font-medium transition-colors
              ${activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 提示信息 */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          {success}
        </div>
      )}

      {/* 内容区域 */}
      <div className="p-4">
        {/* 签名列表 */}
        {activeTab === 'list' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-gray-500">加载中...</span>
                </div>
              </div>
            ) : signatures.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <p className="text-lg">暂无签名</p>
                <p className="text-sm mt-1">点击上方标签创建签名</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {signatures.map((sig) => (
                  <div
                    key={sig.id}
                    className={`
                      relative border rounded-lg overflow-hidden transition-all
                      ${sig.isDefault === 1 ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}
                      ${operatingId === sig.id ? 'opacity-50' : ''}
                      ${selectMode ? 'cursor-pointer hover:border-blue-400' : ''}
                    `}
                    onClick={() => selectMode && sig.status === 1 && onSelect?.(sig)}
                  >
                    {/* 默认标签 */}
                    {sig.isDefault === 1 && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-bl">
                        默认
                      </div>
                    )}

                    {/* 签名图片 */}
                    <div className="h-24 flex items-center justify-center bg-gray-50 p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sig.signatureImageUrl}
                        alt={sig.signatureName}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* 签名信息 */}
                    <div className="p-2 border-t bg-white">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate flex-1">
                          {sig.signatureName}
                        </span>
                        <span className={`text-xs ${getStatusStyle(sig.status)}`}>
                          {sig.status === 1 ? '启用' : '禁用'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {getTypeLabel(sig.signatureType)}
                      </div>

                      {/* 操作按钮 */}
                      {!selectMode && (
                        <div className="flex gap-1 mt-2 pt-2 border-t">
                          {sig.isDefault !== 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefault(sig);
                              }}
                              disabled={operatingId === sig.id}
                              className="flex-1 text-xs py-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              设默认
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(sig);
                            }}
                            disabled={operatingId === sig.id}
                            className={`flex-1 text-xs py-1 rounded ${
                              sig.status === 1
                                ? 'text-orange-600 hover:bg-orange-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {sig.status === 1 ? '禁用' : '启用'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(sig);
                            }}
                            disabled={operatingId === sig.id}
                            className="flex-1 text-xs py-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 手写签名 */}
        {activeTab === 'handwrite' && (
          <div className="space-y-4">
            <SignaturePad
              width={500}
              height={180}
              onChange={setHandwriteData}
              showToolbar
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setHandwriteData(null);
                  setActiveTab('list');
                }}
                className="flex-1 py-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveHandwrite}
                disabled={!handwriteData || saving}
                className={`
                  flex-1 py-2.5 font-medium rounded-lg transition-colors
                  ${handwriteData
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }
                  disabled:opacity-50
                `}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    保存中...
                  </span>
                ) : (
                  '保存签名'
                )}
              </button>
            </div>
          </div>
        )}

        {/* 字体签名 */}
        {activeTab === 'font' && (
          <FontSignatureGenerator
            userId={userId}
            createBy={createBy}
            onGenerated={handleFontGenerated}
            onCancel={() => setActiveTab('list')}
          />
        )}
      </div>
    </div>
  );
}
