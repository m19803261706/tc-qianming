'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  StepIndicator,
  ContractSelectStep,
  SealSelectStep,
  PositionSelectStep,
  CompleteStep,
} from '@/components/workflow';
import { type Contract } from '@/lib/contract-api';
import { type Seal } from '@/lib/seal-api';

// 流程步骤定义
const WORKFLOW_STEPS = [
  { key: 'contract', title: '选择合同', description: '上传或选择' },
  { key: 'seal', title: '选择印章', description: '公章或签名' },
  { key: 'position', title: '选择位置', description: '放置印章' },
  { key: 'complete', title: '完成', description: '下载分享' },
];

/**
 * 签章流程主页面
 *
 * 功能：
 * - 步骤导航
 * - 合同选择
 * - 印章选择
 * - 位置选择
 * - 完成下载
 */
export default function SealWorkflowPage() {
  // 当前步骤
  const [currentStep, setCurrentStep] = useState(0);

  // 流程数据
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedSeal, setSelectedSeal] = useState<Seal | null>(null);
  const [sealSize, setSealSize] = useState(80);

  // 完成状态
  const [completeResult, setCompleteResult] = useState<{ success: boolean; message: string } | null>(null);

  // 下一步
  const goNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, WORKFLOW_STEPS.length - 1));
  }, []);

  // 上一步
  const goPrev = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  // 跳转到指定步骤
  const goToStep = useCallback((step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  }, [currentStep]);

  // 完成回调
  const handleComplete = useCallback((success: boolean, message: string) => {
    setCompleteResult({ success, message });
    setCurrentStep(3);
  }, []);

  // 重新开始
  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setSelectedContract(null);
    setSelectedSeal(null);
    setSealSize(80);
    setCompleteResult(null);
  }, []);

  // 渲染当前步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ContractSelectStep
            selectedContract={selectedContract}
            onSelect={setSelectedContract}
            onNext={goNext}
          />
        );
      case 1:
        return (
          <SealSelectStep
            selectedSeal={selectedSeal}
            onSelect={setSelectedSeal}
            sealSize={sealSize}
            onSizeChange={setSealSize}
            onPrev={goPrev}
            onNext={goNext}
          />
        );
      case 2:
        if (!selectedContract || !selectedSeal) {
          return (
            <div className="text-center py-12 text-gray-500">
              请先完成前面的步骤
            </div>
          );
        }
        return (
          <PositionSelectStep
            contract={selectedContract}
            seal={selectedSeal}
            sealSize={sealSize}
            operatorId={1} // TODO: 从用户上下文获取
            operatorName="管理员"
            onPrev={goPrev}
            onComplete={handleComplete}
          />
        );
      case 3:
        if (!selectedContract || !completeResult) {
          return (
            <div className="text-center py-12 text-gray-500">
              请先完成签章流程
            </div>
          );
        }
        return (
          <CompleteStep
            contract={selectedContract}
            success={completeResult.success}
            message={completeResult.message}
            onRestart={handleRestart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 页面头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">签章流程</h1>
              <p className="text-sm text-gray-500 mt-1">
                按步骤完成合同签章
              </p>
            </div>
            <Link
              href="/contracts"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              返回合同列表
            </Link>
          </div>
        </div>
      </div>

      {/* 步骤指示器 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <StepIndicator
            steps={WORKFLOW_STEPS}
            currentStep={currentStep}
            onStepClick={goToStep}
            allowClick={currentStep < 3}
          />
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm h-full min-h-[600px] p-6">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
