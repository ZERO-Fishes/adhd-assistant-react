'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';
import { TaskTemplate, TaskType } from '@/types';
import { secondsToHoursMinutes } from '@/hooks/useTimer';

interface TemplateManagerProps {
  onTemplateSelect?: (template: TaskTemplate) => void;
}

export function TemplateManager({ onTemplateSelect }: TemplateManagerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [editingTypeIndex, setEditingTypeIndex] = useState<number | null>(null);

  const dataManager = useDataManager();

  // 模板表单状态
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    type: '',
    timerType: 'countdown' as 'countdown' | 'countup',
    countdownHours: 0,
    countdownMinutes: 25,
    countupMinHours: 0,
    countupMinMinutes: 5,
    countupMaxHours: 1,
    countupMaxMinutes: 0,
    forbiddenActions: ['']
  });

  // 任务类型表单状态
  const [typeForm, setTypeForm] = useState({
    name: '',
    color: '#6b7280',
    textColor: '#ffffff'
  });

  // 重置模板表单
  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      type: '',
      timerType: 'countdown',
      countdownHours: 0,
      countdownMinutes: 25,
      countupMinHours: 0,
      countupMinMinutes: 5,
      countupMaxHours: 1,
      countupMaxMinutes: 0,
      forbiddenActions: ['']
    });
    setEditingTemplate(null);
  };

  // 处理模板提交
  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateForm.name.trim()) {
      alert('请输入模板名称');
      return;
    }

    const templateData = {
      name: templateForm.name.trim(),
      description: templateForm.description.trim(),
      type: templateForm.type,
      timerType: templateForm.timerType,
      countdownTime: templateForm.countdownHours * 3600 + templateForm.countdownMinutes * 60,
      countupMinTime: templateForm.countupMinHours * 3600 + templateForm.countupMinMinutes * 60,
      countupMaxTime: templateForm.countupMaxHours * 3600 + templateForm.countupMaxMinutes * 60,
      forbiddenActions: templateForm.forbiddenActions.filter(action => action.trim())
    };

    if (editingTemplate) {
      dataManager.updateTemplate(editingTemplate.id, templateData);
    } else {
      dataManager.createTemplate(templateData);
    }

    resetTemplateForm();
    setIsAddModalOpen(false);
  };

  // 编辑模板
  const editTemplate = (template: TaskTemplate) => {
    const { hours: countdownHours, minutes: countdownMinutes } = secondsToHoursMinutes(template.countdownTime);
    const { hours: countupMinHours, minutes: countupMinMinutes } = secondsToHoursMinutes(template.countupMinTime);
    const { hours: countupMaxHours, minutes: countupMaxMinutes } = secondsToHoursMinutes(template.countupMaxTime);

    setTemplateForm({
      name: template.name,
      description: template.description,
      type: template.type,
      timerType: template.timerType,
      countdownHours,
      countdownMinutes,
      countupMinHours,
      countupMinMinutes,
      countupMaxHours,
      countupMaxMinutes,
      forbiddenActions: template.forbiddenActions.length > 0 ? template.forbiddenActions : ['']
    });
    setEditingTemplate(template);
    setIsAddModalOpen(true);
  };

  // 复制模板
  const copyTemplate = (template: TaskTemplate) => {
    const copiedTemplate = {
      ...template,
      name: template.name + ' (副本)',
      id: undefined
    };
    dataManager.createTemplate(copiedTemplate);
  };

  // 删除模板
  const deleteTemplate = (id: string) => {
    if (confirm('确定要删除这个模板吗？')) {
      dataManager.deleteTemplate(id);
    }
  };

  // 添加约束输入框
  const addForbiddenAction = () => {
    setTemplateForm(prev => ({
      ...prev,
      forbiddenActions: [...prev.forbiddenActions, '']
    }));
  };

  // 删除约束输入框
  const removeForbiddenAction = (index: number) => {
    setTemplateForm(prev => ({
      ...prev,
      forbiddenActions: prev.forbiddenActions.filter((_, i) => i !== index)
    }));
  };

  // 更新约束输入框
  const updateForbiddenAction = (index: number, value: string) => {
    setTemplateForm(prev => ({
      ...prev,
      forbiddenActions: prev.forbiddenActions.map((action, i) => i === index ? value : action)
    }));
  };

  // 处理任务类型提交
  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!typeForm.name.trim()) {
      alert('请输入类型名称');
      return;
    }

    // 检查是否已存在
    const existingTypes = dataManager.data.settings.taskTypes;
    if (existingTypes.some(type => type.name === typeForm.name.trim())) {
      alert('该类型已存在');
      return;
    }

    dataManager.addTaskType({
      name: typeForm.name.trim(),
      color: typeForm.color,
      textColor: typeForm.textColor
    });

    setTypeForm({ name: '', color: '#6b7280', textColor: '#ffffff' });
  };

  // 编辑任务类型
  const editTaskType = (index: number) => {
    const type = dataManager.data.settings.taskTypes[index];
    setTypeForm({
      name: type.name,
      color: type.color,
      textColor: type.textColor
    });
    setEditingTypeIndex(index);
    setIsTypeModalOpen(true);
  };

  // 保存任务类型编辑
  const saveTaskTypeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!typeForm.name.trim()) {
      alert('类型名称不能为空');
      return;
    }

    if (editingTypeIndex !== null) {
      // 检查名称是否重复（排除当前类型）
      const existingTypes = dataManager.data.settings.taskTypes;
      if (existingTypes.some((t, i) => i !== editingTypeIndex && t.name === typeForm.name.trim())) {
        alert('该类型名称已存在');
        return;
      }

      dataManager.updateTaskType(editingTypeIndex, {
        name: typeForm.name.trim(),
        color: typeForm.color,
        textColor: typeForm.textColor
      });
    }

    setTypeForm({ name: '', color: '#6b7280', textColor: '#ffffff' });
    setEditingTypeIndex(null);
    setIsTypeModalOpen(false);
  };

  // 删除任务类型
  const deleteTaskType = (index: number) => {
    if (confirm('确定要删除这个任务类型吗？')) {
      dataManager.deleteTaskType(index);
    }
  };

  // 获取类型颜色
  const getTypeColor = (typeName: string) => {
    return dataManager.getTaskTypeByName(typeName);
  };

  // 格式化计时信息
  const formatTimerInfo = (template: TaskTemplate) => {
    if (template.timerType === 'countdown') {
      const { hours, minutes } = secondsToHoursMinutes(template.countdownTime);
      return `倒计时: ${hours > 0 ? hours + '小时' : ''}${minutes}分钟`;
    } else {
      const minTime = secondsToHoursMinutes(template.countupMinTime);
      const maxTime = secondsToHoursMinutes(template.countupMaxTime);
      const minStr = `${minTime.hours > 0 ? minTime.hours + '小时' : ''}${minTime.minutes}分钟`;
      const maxStr = `${maxTime.hours > 0 ? maxTime.hours + '小时' : ''}${maxTime.minutes}分钟`;
      return `正计时: ${minStr} - ${maxStr}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* 头部操作 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">任务模板管理</h2>
        <div className="flex gap-2">
          <Dialog open={isTypeModalOpen} onOpenChange={setIsTypeModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">管理类型</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTypeIndex !== null ? '编辑任务类型' : '添加新类型'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={editingTypeIndex !== null ? saveTaskTypeEdit : handleTypeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="typeName">类型名称</Label>
                  <Input
                    id="typeName"
                    value={typeForm.name}
                    onChange={(e) => setTypeForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入类型名称"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="typeColor">背景色</Label>
                    <Input
                      id="typeColor"
                      type="color"
                      value={typeForm.color}
                      onChange={(e) => setTypeForm(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="typeTextColor">文字色</Label>
                    <Input
                      id="typeTextColor"
                      type="color"
                      value={typeForm.textColor}
                      onChange={(e) => setTypeForm(prev => ({ ...prev, textColor: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>预览</Label>
                    <div 
                      className="w-full h-10 rounded border flex items-center justify-center text-sm font-medium"
                      style={{ 
                        backgroundColor: typeForm.color, 
                        color: typeForm.textColor 
                      }}
                    >
                      预览
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsTypeModalOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">
                    {editingTypeIndex !== null ? '保存' : '添加'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) resetTemplateForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetTemplateForm();
                setIsAddModalOpen(true);
              }}>
                添加模板
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? '编辑任务模板' : '添加任务模板'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTemplateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">模板名称 *</Label>
                  <Input
                    id="templateName"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入模板名称"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="templateDescription">模板描述</Label>
                  <Textarea
                    id="templateDescription"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="描述这个模板的用途..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="templateType">模板类型</Label>
                  <Select value={templateForm.type} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataManager.data.settings.taskTypes.map((type) => (
                        <SelectItem key={type.name} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timerType">计时类型</Label>
                  <Select value={templateForm.timerType} onValueChange={(value: 'countdown' | 'countup') => setTemplateForm(prev => ({ ...prev, timerType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="countdown">倒计时</SelectItem>
                      <SelectItem value="countup">正计时</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {templateForm.timerType === 'countdown' && (
                  <div className="space-y-2">
                    <Label>倒计时时间</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        value={templateForm.countdownHours}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, countdownHours: parseInt(e.target.value) || 0 }))}
                        min="0"
                        max="23"
                        className="w-20"
                      />
                      <span>小时</span>
                      <Input
                        type="number"
                        value={templateForm.countdownMinutes}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, countdownMinutes: parseInt(e.target.value) || 0 }))}
                        min="0"
                        max="59"
                        className="w-20"
                      />
                      <span>分钟</span>
                    </div>
                  </div>
                )}
                
                {templateForm.timerType === 'countup' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>最小时间</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          value={templateForm.countupMinHours}
                          onChange={(e) => setTemplateForm(prev => ({ ...prev, countupMinHours: parseInt(e.target.value) || 0 }))}
                          min="0"
                          max="23"
                          className="w-20"
                        />
                        <span>小时</span>
                        <Input
                          type="number"
                          value={templateForm.countupMinMinutes}
                          onChange={(e) => setTemplateForm(prev => ({ ...prev, countupMinMinutes: parseInt(e.target.value) || 0 }))}
                          min="0"
                          max="59"
                          className="w-20"
                        />
                        <span>分钟</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>最大时间</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          value={templateForm.countupMaxHours}
                          onChange={(e) => setTemplateForm(prev => ({ ...prev, countupMaxHours: parseInt(e.target.value) || 0 }))}
                          min="0"
                          max="23"
                          className="w-20"
                        />
                        <span>小时</span>
                        <Input
                          type="number"
                          value={templateForm.countupMaxMinutes}
                          onChange={(e) => setTemplateForm(prev => ({ ...prev, countupMaxMinutes: parseInt(e.target.value) || 0 }))}
                          min="0"
                          max="59"
                          className="w-20"
                        />
                        <span>分钟</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>神圣座位约束清单</Label>
                  <div className="space-y-2">
                    {templateForm.forbiddenActions.map((action, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={action}
                          onChange={(e) => updateForbiddenAction(index, e.target.value)}
                          placeholder="输入禁止的行为"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeForbiddenAction(index)}
                        >
                          删除
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addForbiddenAction}>
                    添加约束
                  </Button>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">
                    {editingTemplate ? '保存' : '添加'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="grid gap-4">
        {dataManager.data.templates.map((template) => {
          const typeColor = getTypeColor(template.type);
          const constraintsInfo = template.forbiddenActions.length > 0 
            ? `约束: ${template.forbiddenActions.join(', ')}`
            : '无约束';

          return (
            <Card key={template.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{template.name}</h3>
                      <Badge 
                        style={{ 
                          backgroundColor: typeColor.color, 
                          color: typeColor.textColor 
                        }}
                      >
                        {template.type}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-2">
                      {template.description || '无描述'}
                    </p>
                    <div className="text-sm text-muted-foreground mb-2">
                      {formatTimerInfo(template)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {constraintsInfo}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onTemplateSelect?.(template)}
                    >
                      预约
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyTemplate(template)}
                    >
                      复制
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editTemplate(template)}
                    >
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {dataManager.data.templates.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              暂无任务模板，点击"添加模板"创建第一个模板
            </CardContent>
          </Card>
        )}
      </div>

      {/* 任务类型管理 */}
      <Card>
        <CardHeader>
          <CardTitle>任务类型管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {dataManager.data.settings.taskTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <Badge 
                  style={{ 
                    backgroundColor: type.color, 
                    color: type.textColor 
                  }}
                >
                  {type.name}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editTaskType(index)}
                  >
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteTaskType(index)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
