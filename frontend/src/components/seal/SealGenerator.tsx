'use client';

/**
 * 印章生成器组件 - Shadcn/UI 版本
 *
 * 使用 Shadcn/UI 组件重构，提供更现代化的用户界面
 * 功能：模板选择、企业名称输入、中心文字、颜色选择、实时预览
 */

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Loader2, Zap, Check, Star, Building2, FileText, Stamp } from 'lucide-react';

// Shadcn/UI 组件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// API 类型
import {
  type SealTemplate,
  type SealGenerateRequest,
  type FileUploadResponse,
  generateSeal,
  getSealTemplates,
} from '@/lib/seal-api';

interface SealGeneratorProps {
  /** 是否显示弹窗 */
  isOpen: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 生成成功回调 */
  onSuccess: (result: FileUploadResponse) => void;
}

// 模板图标映射
const templateIcons: Record<string, React.ReactNode> = {
  CIRCLE_STANDARD: <Star className="w-5 h-5" />,
  ELLIPSE_FINANCE: <Building2 className="w-5 h-5" />,
  SQUARE_LEGAL: <FileText className="w-5 h-5" />,
};

// 预设颜色
const presetColors = [
  { name: '标准红', value: '#DC2626', className: 'bg-red-600' },
  { name: '深红', value: '#991B1B', className: 'bg-red-800' },
  { name: '朱红', value: '#EF4444', className: 'bg-red-500' },
  { name: '蓝色', value: '#2563EB', className: 'bg-blue-600' },
  { name: '黑色', value: '#1F2937', className: 'bg-gray-800' },
];

export default function SealGenerator({
  isOpen,
  onClose,
  onSuccess,
}: SealGeneratorProps) {
  // 模板数据
  const [templates, setTemplates] = useState<SealTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // 表单状态
  const [selectedTemplateCode, setSelectedTemplateCode] = useState<string>('');
  const [companyName, setCompanyName] = useState('');
  const [centerText, setCenterText] = useState('');
  const [sealColor, setSealColor] = useState('#DC2626');

  // 加载和预览状态
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<FileUploadResponse | null>(null);

  // 加载模板列表
  const loadTemplates = useCallback(async () => {
    if (templates.length > 0) return;

    setLoadingTemplates(true);
    try {
      const response = await getSealTemplates();
      if (response.success) {
        setTemplates(response.data);
        if (response.data.length > 0) {
          setSelectedTemplateCode(response.data[0].code);
        }
      }
    } catch (error) {
      console.error('加载模板失败:', error);
    } finally {
      setLoadingTemplates(false);
    }
  }, [templates.length]);

  // 弹窗打开时加载模板
  const handleOpenChange = (open: boolean) => {
    if (open) {
      loadTemplates();
    } else {
      handleClose();
    }
  };

  // 获取选中的模板
  const selectedTemplate = templates.find((t) => t.code === selectedTemplateCode);

  // 生成预览
  const handleGeneratePreview = useCallback(async () => {
    if (!selectedTemplate || !companyName.trim()) return;

    setGenerating(true);
    setPreviewUrl(null);
    setPreviewResult(null);

    try {
      const request: SealGenerateRequest = {
        companyName: companyName.trim(),
        centerText: centerText.trim() || undefined,
        templateCode: selectedTemplate.code,
        color: sealColor,
      };

      const response = await generateSeal(request);
      if (response.success) {
        setPreviewUrl(response.data.fileUrl);
        setPreviewResult(response.data);
      } else {
        alert(response.message || '生成失败');
      }
    } catch (error) {
      console.error('生成印章失败:', error);
      alert('生成印章失败，请重试');
    } finally {
      setGenerating(false);
    }
  }, [selectedTemplate, companyName, centerText, sealColor]);

  // 确认使用
  const handleConfirm = () => {
    if (previewResult) {
      onSuccess(previewResult);
      handleClose();
    }
  };

  // 关闭并重置
  const handleClose = () => {
    setSelectedTemplateCode(templates[0]?.code || '');
    setCompanyName('');
    setCenterText('');
    setSealColor('#DC2626');
    setPreviewUrl(null);
    setPreviewResult(null);
    onClose();
  };

  // 是否可以生成
  const canGenerate = selectedTemplate && companyName.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Stamp className="w-5 h-5 text-red-500" />
            自动生成印章
          </DialogTitle>
          <DialogDescription>
            选择模板并填写信息，系统将自动为您生成专业印章
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 py-4">
          {/* 左侧配置区域 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 步骤1: 选择模板 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Badge variant="default" className="bg-red-500 hover:bg-red-500">1</Badge>
                选择印章模板
              </Label>

              {loadingTemplates ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <RadioGroup
                  value={selectedTemplateCode}
                  onValueChange={setSelectedTemplateCode}
                  className="space-y-2"
                >
                  {templates.map((template) => (
                    <Card
                      key={template.code}
                      className={cn(
                        'cursor-pointer transition-all',
                        selectedTemplateCode === template.code
                          ? 'border-red-500 ring-2 ring-red-100 bg-red-50/50'
                          : 'hover:border-gray-300 hover:bg-gray-50/50'
                      )}
                      onClick={() => setSelectedTemplateCode(template.code)}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center',
                          selectedTemplateCode === template.code
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600'
                        )}>
                          {templateIcons[template.code] || <Stamp className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {template.name}
                            </span>
                            {template.code === 'CIRCLE_STANDARD' && (
                              <Badge variant="secondary" className="text-xs">推荐</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span>{template.defaultSize}px</span>
                            <span>{template.defaultFont}</span>
                          </div>
                        </div>
                        <RadioGroupItem
                          value={template.code}
                          className="border-2"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              )}
            </div>

            {/* 步骤2 & 3: 企业名称和中心文字 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-base font-semibold flex items-center gap-2">
                  <Badge variant="default" className="bg-red-500 hover:bg-red-500">2</Badge>
                  企业名称
                  <span className="text-red-500 text-xs font-normal">*必填</span>
                </Label>
                <div className="relative">
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    maxLength={30}
                    disabled={generating}
                    placeholder="请输入企业/组织名称"
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {companyName.length}/30
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="centerText" className="text-base font-semibold flex items-center gap-2">
                  <Badge variant="secondary">3</Badge>
                  中心文字
                  <span className="text-muted-foreground text-xs font-normal">可选</span>
                </Label>
                <Input
                  id="centerText"
                  value={centerText}
                  onChange={(e) => setCenterText(e.target.value)}
                  maxLength={10}
                  disabled={generating}
                  placeholder="如：合同专用章"
                />
              </div>
            </div>

            {/* 步骤4: 颜色选择 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Badge variant="secondary">4</Badge>
                印章颜色
              </Label>
              <div className="flex flex-wrap gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSealColor(color.value)}
                    disabled={generating}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm',
                      sealColor === color.value
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-background hover:bg-accent'
                    )}
                  >
                    <span
                      className={cn('w-4 h-4 rounded-full', color.className)}
                    />
                    <span className={cn(
                      sealColor === color.value ? 'font-medium' : 'text-muted-foreground'
                    )}>
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧预览区域 */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-4 h-full flex flex-col">
                <Label className="text-base font-semibold mb-3">预览效果</Label>

                {/* 预览框 */}
                <div className="flex-1 min-h-[240px] bg-muted/30 rounded-lg border-2 border-dashed border-muted flex items-center justify-center">
                  {previewUrl ? (
                    <div className="text-center p-4">
                      <div className="relative inline-block p-3 bg-white rounded-lg shadow-sm">
                        <Image
                          src={previewUrl}
                          alt="印章预览"
                          width={150}
                          height={150}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-1.5 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">生成成功</span>
                      </div>
                    </div>
                  ) : generating ? (
                    <div className="text-center text-muted-foreground">
                      <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2" />
                      <p className="text-sm font-medium">生成中...</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                        <Stamp className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium">等待生成</p>
                      <p className="text-xs mt-1">填写信息后点击生成</p>
                    </div>
                  )}
                </div>

                {/* 生成按钮 */}
                <Button
                  onClick={handleGeneratePreview}
                  disabled={!canGenerate || generating}
                  className="w-full mt-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      生成预览
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex-1 text-sm text-muted-foreground">
            {previewResult ? (
              <span className="text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                印章已就绪，可以使用
              </span>
            ) : (
              '生成后可使用印章'
            )}
          </div>
          <Button variant="outline" onClick={handleClose} disabled={generating}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!previewResult || generating}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4" />
            使用此印章
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
