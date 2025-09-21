'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataManager } from '@/hooks/useDataManager';
import { useTimer } from '@/hooks/useTimer';
import { TaskTemplate, HistoryRecord } from '@/types';
import { TemplateManager } from '@/components/TemplateManager';
import { HistoryManager } from '@/components/HistoryManager';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';

type View = 'home' | 'templates' | 'chains' | 'history' | 'settings';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [currentAppointment, setCurrentAppointment] = useState<{
    templateId: string;
    template: TaskTemplate;
    scheduledAt: Date;
    sessionId: string;
    appointmentStartTime: Date;
    abandonTime?: Date;
  } | null>(null);
  const [currentTask, setCurrentTask] = useState<{
    templateId: string;
    template: TaskTemplate;
    scheduledAt: Date;
    sessionId: string;
    appointmentStartTime: Date;
    actualStartTime: Date;
    taskStartTime: Date;
    abandonTime?: Date;
  } | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const dataManager = useDataManager();
  const timer = useTimer();

  // 开始预约
  const startAppointment = () => {
    const templateSelect = document.getElementById('templateSelect') as HTMLSelectElement;
    if (!templateSelect?.value) {
      alert('请选择任务模板');
      return;
    }

    const template = dataManager.getTemplate(templateSelect.value);
    if (!template) return;

    const appointmentTime = dataManager.data.settings.defaultAppointmentTime;
    const appointmentStartTime = new Date();
    const sessionId = dataManager.generateId();
    
    setCurrentSessionId(sessionId);
    setCurrentAppointment({
      templateId: template.id,
      template,
      scheduledAt: new Date(Date.now() + appointmentTime * 1000),
      sessionId,
      appointmentStartTime
    });

    timer.setTimer(appointmentTime, 'countdown');
    timer.start();
  };

  // 开始任务
  const startTask = () => {
    if (!currentAppointment) {
      alert('请先开始预约');
      return;
    }

    const template = currentAppointment.template;
    const taskStartTime = new Date();
    let taskTime;
    
    if (template.timerType === 'countdown') {
      taskTime = template.countdownTime;
    } else {
      taskTime = template.countupMaxTime;
    }

    // 保存预约成功记录
    saveAppointmentRecord('success');

    setCurrentTask({
      ...currentAppointment,
      actualStartTime: taskStartTime,
      taskStartTime
    });

    timer.setTimer(taskTime, template.timerType);
    timer.start();
  };

  // 放弃当前操作
  const abandonCurrent = () => {
    if (currentTask) {
      if (confirm('确定要放弃当前任务吗？这将标记为任务失败。')) {
        handleTaskAbandon();
      }
    } else if (currentAppointment) {
      if (confirm('确定要放弃当前预约吗？这将标记为预约失败。')) {
        handleAppointmentAbandon();
      }
    }
  };

  // 处理任务放弃
  const handleTaskAbandon = () => {
    const abandonTime = new Date();
    if (currentTask) {
      setCurrentTask(prev => prev ? { ...prev, abandonTime } : null);
    }
    
    saveTaskRecord('failed');
    
    timer.reset();
    setCurrentAppointment(null);
    setCurrentTask(null);
    setCurrentSessionId(null);
  };

  // 处理预约放弃
  const handleAppointmentAbandon = () => {
    const abandonTime = new Date();
    if (currentAppointment) {
      setCurrentAppointment(prev => prev ? { ...prev, abandonTime } : null);
    }
    
    saveAppointmentRecord('failed');
    
    timer.reset();
    setCurrentAppointment(null);
    setCurrentTask(null);
    setCurrentSessionId(null);
  };

  // 保存预约记录
  const saveAppointmentRecord = (status: 'success' | 'failed') => {
    if (!currentAppointment) return;

    const template = currentAppointment.template;
    const now = new Date();
    
    const recordData: Omit<HistoryRecord, 'id' | 'createdAt'> = {
      sessionId: currentSessionId!,
      type: 'appointment',
      status,
      templateId: template.id,
      templateName: template.name,
      templateType: template.type,
      scheduledTime: currentAppointment.scheduledAt.toISOString(),
      actualStartTime: null,
      endTime: now.toISOString(),
      duration: null,
      violations: [],
      notes: status === 'success' ? '预约倒计时完成' : '预约被放弃',
      timeNodes: {
        appointmentStart: currentAppointment.appointmentStartTime.toISOString(),
        taskStart: null,
        taskEnd: null,
        abandonTime: status === 'failed' ? (currentAppointment as any).abandonTime?.toISOString() || null : null
      }
    };

    dataManager.addHistoryRecord(recordData);
  };

  // 保存任务记录
  const saveTaskRecord = (status: 'success' | 'failed') => {
    if (!currentTask) return;

    const template = currentTask.template;
    const now = new Date();
    
    // 计算实际执行时长
    let duration = null;
    if (currentTask.actualStartTime) {
      duration = Math.floor((now.getTime() - currentTask.actualStartTime.getTime()) / 1000);
    }

    const recordData: Omit<HistoryRecord, 'id' | 'createdAt'> = {
      sessionId: currentSessionId!,
      type: 'task',
      status,
      templateId: template.id,
      templateName: template.name,
      templateType: template.type,
      scheduledTime: currentTask.scheduledAt.toISOString(),
      actualStartTime: currentTask.actualStartTime.toISOString(),
      endTime: now.toISOString(),
      duration,
      violations: [],
      notes: status === 'success' ? '任务完成' : '任务被放弃',
      timeNodes: {
        appointmentStart: currentTask.appointmentStartTime.toISOString(),
        taskStart: currentTask.taskStartTime.toISOString(),
        taskEnd: status === 'success' ? now.toISOString() : null,
        abandonTime: status === 'failed' ? (currentTask as any).abandonTime?.toISOString() || null : null
      }
    };

    dataManager.addHistoryRecord(recordData);
  };

  // 设置计时器回调
  const setupTimerCallbacks = () => {
    timer.setCallbacks({
      onTick: (displayTime, remainingSeconds) => {
        // 更新显示
      },
      onComplete: () => {
        if (currentAppointment && !currentTask) {
          // 预约倒计时完成
        } else if (currentTask) {
          // 任务计时完成
          saveTaskRecord('success');
          setCurrentAppointment(null);
          setCurrentTask(null);
          setCurrentSessionId(null);
        }
      }
    });
  };

  // 播放提示音
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('无法播放提示音:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">ADHD助手</h1>
          <p className="text-muted-foreground">基于CTDP理论的时间管理工具</p>
        </div>

        {/* 导航 */}
        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as View)} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="home">首页</TabsTrigger>
            <TabsTrigger value="templates">任务模板</TabsTrigger>
            <TabsTrigger value="chains">任务链</TabsTrigger>
            <TabsTrigger value="history">历史记录</TabsTrigger>
            <TabsTrigger value="settings">设置</TabsTrigger>
          </TabsList>

          {/* 首页 */}
          <TabsContent value="home" className="space-y-6">
            {/* 任务链状态 */}
            <Card>
              <CardHeader>
                <CardTitle>当前任务链状态</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <h3 className="text-lg font-semibold mb-2">暂无活跃任务链</h3>
                  <p>请先创建任务链</p>
                </div>
              </CardContent>
            </Card>

            {/* 周历视图 */}
            <WeeklyCalendar />

            {/* 计时器区域 */}
            <Card>
              <CardHeader>
                <CardTitle>CTDP计时器</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 任务类型选择 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">选择任务类型</label>
                  <select 
                    id="taskTypeSelect" 
                    className="w-full p-2 border rounded-md"
                    onChange={(e) => {
                      // 更新模板选择
                    }}
                  >
                    <option value="">选择任务类型</option>
                    {dataManager.data.settings.taskTypes.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 模板选择 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">选择任务模板</label>
                  <select 
                    id="templateSelect" 
                    className="w-full p-2 border rounded-md"
                    disabled
                  >
                    <option value="">请先选择任务类型</option>
                  </select>
                </div>

                {/* 计时器显示 */}
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold mb-4">
                    {timer.getDisplayTime()}
                  </div>
                  
                  {/* 控制按钮 */}
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={startAppointment}
                      disabled={timer.status !== 'stopped'}
                    >
                      预约开始
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={startTask}
                      disabled={!currentAppointment || currentTask !== null}
                      style={{ display: currentAppointment && !currentTask ? 'inline-flex' : 'none' }}
                    >
                      任务开始
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={abandonCurrent}
                      disabled={timer.status === 'stopped'}
                    >
                      放弃
                    </Button>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  {timer.status === 'stopped' && '准备就绪'}
                  {currentAppointment && !currentTask && '预约倒计时进行中...'}
                  {currentTask && '任务进行中...'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 任务模板 */}
          <TabsContent value="templates">
            <TemplateManager />
          </TabsContent>

          {/* 任务链 */}
          <TabsContent value="chains">
            <Card>
              <CardHeader>
                <CardTitle>任务链管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">
                  任务链功能开发中...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 历史记录 */}
          <TabsContent value="history">
            <HistoryManager />
          </TabsContent>

          {/* 设置 */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={dataManager.exportData}>
                    导出数据
                  </Button>
                  <Button variant="outline">
                    导入数据
                  </Button>
                  <Button variant="destructive" onClick={dataManager.clearAllData}>
                    清空数据
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
