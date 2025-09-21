'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';
import { TaskSession, HistoryFilters } from '@/types';
import { secondsToHoursMinutes } from '@/hooks/useTimer';

export function HistoryManager() {
  const [filters, setFilters] = useState<HistoryFilters>({});
  const dataManager = useDataManager();

  // 获取筛选后的会话数据
  const filteredSessions = useMemo(() => {
    return dataManager.getTaskSessions(filters);
  }, [dataManager, filters]);

  // 获取统计信息
  const stats = useMemo(() => {
    return dataManager.getHistoryStats(filters);
  }, [dataManager, filters]);

  // 应用筛选
  const applyFilters = () => {
    // 筛选逻辑已在 useMemo 中处理
  };

  // 清除筛选
  const clearFilters = () => {
    setFilters({});
  };

  // 删除任务会话
  const deleteTaskSession = (sessionId: string) => {
    if (confirm('确定要删除这个任务会话吗？这将删除相关的所有记录。')) {
      // 删除该会话的所有记录
      const records = dataManager.data.history;
      const sessionRecords = records.filter(r => r.sessionId === sessionId);
      
      sessionRecords.forEach(record => {
        dataManager.deleteHistoryRecord(record.id);
      });
    }
  };

  // 清空所有历史记录
  const clearAllHistory = () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
      dataManager.clearHistory();
    }
  };

  // 获取类型颜色
  const getTypeColor = (typeName: string) => {
    return dataManager.getTaskTypeByName(typeName);
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 格式化时间节点
  const formatTimeNode = (dateString: string | null) => {
    if (!dateString) return 'null';
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 格式化持续时间
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return 'null';
    const { hours, minutes } = secondsToHoursMinutes(seconds);
    return hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'success': '成功',
      'failed': '失败',
      'incomplete': '未完成'
    };
    return statusMap[status] || status;
  };

  // 获取状态样式
  const getStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
      'success': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'incomplete': 'bg-yellow-100 text-yellow-800'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <Card>
        <CardHeader>
          <CardTitle>统计概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <div className="text-sm text-muted-foreground">任务会话</div>
              <div className="text-xs text-muted-foreground">
                完成: {stats.sessions.success} | 失败: {stats.sessions.failed} | 未完成: {stats.sessions.incomplete}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalRecords}</div>
              <div className="text-sm text-muted-foreground">总记录数</div>
              <div className="text-xs text-muted-foreground">
                预约: {stats.appointments.total} | 任务: {stats.tasks.total}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.appointments.success}</div>
              <div className="text-sm text-muted-foreground">预约成功</div>
              <div className="text-xs text-muted-foreground">
                成功率: {stats.appointments.total > 0 ? Math.round(stats.appointments.success / stats.appointments.total * 100) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.tasks.success}</div>
              <div className="text-sm text-muted-foreground">任务成功</div>
              <div className="text-xs text-muted-foreground">
                成功率: {stats.tasks.total > 0 ? Math.round(stats.tasks.success / stats.tasks.total * 100) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</div>
              <div className="text-sm text-muted-foreground">平均执行时长</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filterType">记录类型</Label>
              <Select value={filters.type || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  <SelectItem value="appointment">预约</SelectItem>
                  <SelectItem value="task">任务</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterStatus">执行状态</Label>
              <Select value={filters.status || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterTemplateType">任务类型</Label>
              <Select value={filters.templateType || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, templateType: value || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  {dataManager.data.settings.taskTypes.map((type) => (
                    <SelectItem key={type.name} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterSearch">搜索模板</Label>
              <Input
                id="filterSearch"
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
                placeholder="输入模板名称..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterStartDate">开始日期</Label>
              <Input
                id="filterStartDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value || undefined }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterEndDate">结束日期</Label>
              <Input
                id="filterEndDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value || undefined }))}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters}>应用筛选</Button>
            <Button variant="outline" onClick={clearFilters}>清除筛选</Button>
          </div>
        </CardContent>
      </Card>

      {/* 历史记录列表 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>历史记录</CardTitle>
            <Button variant="destructive" onClick={clearAllHistory}>
              清空历史
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const typeColor = getTypeColor(session.templateType);
              const startTime = formatTime(session.createdAt);
              
              return (
                <div key={session.sessionId} className="border rounded-lg p-4 space-y-3">
                  {/* 基本信息 */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{session.templateName}</h3>
                        <Badge 
                          style={{ 
                            backgroundColor: typeColor.color, 
                            color: typeColor.textColor 
                          }}
                        >
                          {session.templateType}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        🕐 {startTime}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusClass(session.overallStatus)}>
                        {getStatusText(session.overallStatus)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteTaskSession(session.sessionId)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                  
                  {/* 预约信息 */}
                  {session.appointment && (
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">📅 预约信息</span>
                        </div>
                        <Badge className={getStatusClass(session.appointment.status)}>
                          {getStatusText(session.appointment.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">开始时间:</span>
                          <span className="ml-2">{formatTimeNode(session.appointment.timeNodes.appointmentStart)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">等待时间:</span>
                          <span className="ml-2">
                            {session.appointment.status === 'success' && session.task && session.task.timeNodes.taskStart
                              ? formatDuration(Math.floor((new Date(session.task.timeNodes.taskStart).getTime() - new Date(session.appointment.timeNodes.appointmentStart!).getTime()) / 1000))
                              : 'null'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 任务信息 */}
                  {session.appointment && session.appointment.status === 'failed' ? (
                    <div className="bg-red-50 p-3 rounded">
                      <div className="text-sm text-red-600">
                        预约失败，任务未开始
                      </div>
                    </div>
                  ) : session.task ? (
                    <div className="bg-green-50 p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">🎯 任务信息</span>
                        </div>
                        <Badge className={getStatusClass(session.task.status)}>
                          {getStatusText(session.task.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">开始时间:</span>
                          <span className="ml-2">{formatTimeNode(session.task.timeNodes.taskStart)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">结束时间:</span>
                          <span className="ml-2">
                            {session.task.status === 'success' ? formatTimeNode(session.task.timeNodes.taskEnd) : 'null'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">持续时间:</span>
                          <span className="ml-2">
                            {session.task.status === 'success' ? formatDuration(session.task.duration) : 'null'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
            
            {filteredSessions.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                暂无历史记录
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
