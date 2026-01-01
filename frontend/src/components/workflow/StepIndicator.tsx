'use client';

interface Step {
  key: string;
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  /** 步骤列表 */
  steps: Step[];
  /** 当前步骤索引 */
  currentStep: number;
  /** 点击步骤回调 */
  onStepClick?: (index: number) => void;
  /** 是否允许点击跳转 */
  allowClick?: boolean;
}

/**
 * 步骤指示器组件
 *
 * 功能：
 * - 显示流程步骤
 * - 当前步骤高亮
 * - 已完成步骤标记
 * - 可选的点击跳转
 */
export default function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  allowClick = false,
}: StepIndicatorProps) {
  const handleClick = (index: number) => {
    if (allowClick && index < currentStep && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = allowClick && isCompleted;

          return (
            <li
              key={step.key}
              className={`
                relative flex-1
                ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}
              `}
            >
              {/* 连接线 */}
              {index !== steps.length - 1 && (
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div
                    className={`
                      h-0.5 w-full
                      ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}
                    `}
                  />
                </div>
              )}

              {/* 步骤节点 */}
              <div
                onClick={() => handleClick(index)}
                className={`
                  relative flex flex-col items-center group
                  ${isClickable ? 'cursor-pointer' : ''}
                `}
              >
                {/* 圆圈 */}
                <span
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors
                    ${isCompleted
                      ? 'bg-blue-600 border-blue-600'
                      : isCurrent
                        ? 'bg-white border-blue-600'
                        : 'bg-white border-gray-300'
                    }
                    ${isClickable ? 'group-hover:ring-4 group-hover:ring-blue-100' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span
                      className={`
                        text-sm font-medium
                        ${isCurrent ? 'text-blue-600' : 'text-gray-500'}
                      `}
                    >
                      {index + 1}
                    </span>
                  )}
                </span>

                {/* 标题 */}
                <span
                  className={`
                    mt-2 text-sm font-medium text-center
                    ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}
                  `}
                >
                  {step.title}
                </span>

                {/* 描述 */}
                {step.description && (
                  <span className="mt-0.5 text-xs text-gray-400 text-center hidden sm:block">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
