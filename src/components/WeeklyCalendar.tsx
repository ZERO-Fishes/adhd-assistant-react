'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';
import { TaskSession } from '@/types';

interface WeeklyEvent {
  id: string;
  name: string;
  time: string;
  datetime: string;
  status: string;
  session: TaskSession;
}

interface WeeklyCalendarProps {
  onEventClick?: (session: TaskSession) => void;
}

export function WeeklyCalendar({ onEventClick }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const dataManager = useDataManager();

  // 获取当前周的数据
  const weeklyData = useMemo(() => {
    const sessions = dataManager.getTaskSessions();
    const weeklyDataMap = new Map<number, Map<number, WeeklyEvent[]>>();
    
    sessions.forEach(session => {
      const date = new Date(session.createdAt);
      const dayOfWeek = date.getDay(); // 0=周日, 1=周一, ..., 6=周六
      const timeSlot = getTimeSlot(date);
      
      if (!weeklyDataMap.has(dayOfWeek)) {
        weeklyDataMap.set(dayOfWeek, new Map());
      }
      
      if (!weeklyDataMap.get(dayOfWeek)!.has(timeSlot)) {
        weeklyDataMap.get(dayOfWeek)!.set(timeSlot, []);
      }
      
      const event: WeeklyEvent = {
        id: session.sessionId,
        name: session.templateName,
        time: formatTime(date),
        datetime: date.toISOString(),
        status: session.overallStatus,
        session
      };
      
      weeklyDataMap.get(dayOfWeek)!.get(timeSlot)!.push(event);
    });
    
    return weeklyDataMap;
  }, [dataManager, currentWeek]);

  // 获取时间槽
  const getTimeSlot = (date: Date): number => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return Math.floor((hour * 60 + minute) / 30); // 每30分钟一个时间段
  };

  // 格式化时间
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 获取周开始日期
  const getWeekStart = (date: Date): Date => {
    const day = date.getDay();
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - day);
    return weekStart;
  };

  // 判断是否是同一天
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // 获取状态样式
  const getStatusClass = (status: string): string => {
    const classMap: Record<string, string> = {
      'success': 'bg-green-100 text-green-800 border-green-200',
      'failed': 'bg-red-100 text-red-800 border-red-200',
      'incomplete': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 获取状态文本
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'success': '成功',
      'failed': '失败',
      'incomplete': '未完成'
    };
    return statusMap[status] || status;
  };

  // 获取类型颜色
  const getTypeColor = (typeName: string) => {
    return dataManager.getTaskTypeByName(typeName);
  };

  // 导航到上一周
  const previousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  // 导航到下一周
  const nextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  // 回到当前周
  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  // 显示事件详情
  const showEventDetail = (session: TaskSession) => {
    onEventClick?.(session);
  };

  const weekStart = getWeekStart(currentWeek);
  const today = new Date();
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>本周任务安排</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previousWeek}>
              ← 上周
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              本周
            </Button>
            <Button variant="outline" size="sm" onClick={nextWeek}>
              下周 →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* 周历网格 */}
            <div className="grid grid-cols-8 gap-1">
              {/* 时间列 */}
              <div className="space-y-1">
                <div className="h-12 flex items-center justify-center text-sm font-medium text-muted-foreground border-b">
                  时间
                </div>
                {Array.from({ length: 32 }, (_, i) => {
                  const hour = Math.floor(i / 2) + 6;
                  const minute = (i % 2) * 30;
                  const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                  return (
                    <div key={i} className="h-8 flex items-center justify-center text-xs text-muted-foreground border-b">
                      {timeStr}
                    </div>
                  );
                })}
              </div>

              {/* 7天的列 */}
              {Array.from({ length: 7 }, (_, day) => {
                const currentDate = new Date(weekStart);
                currentDate.setDate(weekStart.getDate() + day);
                const isToday = isSameDay(currentDate, today);
                const isWeekend = day === 0 || day === 6;

                return (
                  <div key={day} className="space-y-1">
                    {/* 日期头部 */}
                    <div className={`h-12 flex flex-col items-center justify-center text-sm font-medium border-b ${
                      isToday ? 'bg-blue-100 text-blue-800' : 
                      isWeekend ? 'bg-gray-50 text-gray-600' : 
                      'bg-white text-gray-900'
                    }`}>
                      <div>{dayNames[day]}</div>
                      <div className="text-xs">{currentDate.getDate()}</div>
                    </div>

                    {/* 时间槽 */}
                    {Array.from({ length: 32 }, (_, i) => {
                      const timeSlot = i;
                      const events = weeklyData.get(day)?.get(timeSlot) || [];

                      return (
                        <div key={i} className="h-8 border-b border-gray-100 relative">
                          {/* 显示事件 */}
                          {events.map((event) => {
                            const typeColor = getTypeColor(event.session.templateType);
                            return (
                              <div
                                key={event.id}
                                className={`absolute inset-0 m-0.5 rounded text-xs p-1 cursor-pointer hover:shadow-md transition-shadow ${getStatusClass(event.status)}`}
                                style={{
                                  backgroundColor: typeColor.color,
                                  color: typeColor.textColor,
                                  borderColor: typeColor.color
                                }}
                                onClick={() => showEventDetail(event.session)}
                                title={`${event.name} - ${getStatusText(event.status)} - ${event.time}`}
                              >
                                <div className="truncate font-medium">{event.name}</div>
                                <div className="truncate opacity-90">{event.time}</div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 图例 */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
            <span>成功</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
            <span>失败</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></div>
            <span>未完成</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
