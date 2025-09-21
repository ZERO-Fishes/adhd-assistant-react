import { useState, useEffect, useCallback } from 'react';
import { 
  AppData, 
  TaskTemplate, 
  TaskType, 
  TaskChain, 
  HistoryRecord, 
  TaskSession, 
  AppSettings, 
  HistoryFilters, 
  HistoryStats 
} from '@/types';

const STORAGE_KEY = 'adhd_assistant_data';

// 默认设置
const getDefaultSettings = (): AppSettings => ({
  defaultAppointmentTime: 900, // 15分钟
  theme: 'light',
  notifications: true,
  autoSave: true,
  taskTypes: [
    { name: '学习', color: '#2383e2', textColor: '#ffffff' },
    { name: '工作', color: '#10b981', textColor: '#ffffff' },
    { name: '运动', color: '#f59e0b', textColor: '#ffffff' },
    { name: '休息', color: '#8b5cf6', textColor: '#ffffff' },
    { name: '娱乐', color: '#ef4444', textColor: '#ffffff' }
  ]
});

// 默认数据
const getDefaultData = (): AppData => ({
  templates: [],
  chains: [],
  settings: getDefaultSettings(),
  currentChain: null,
  history: [],
  lastUpdated: new Date().toISOString()
});

// 生成唯一ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useDataManager = () => {
  const [data, setData] = useState<AppData>(getDefaultData());
  const [loading, setLoading] = useState(true);

  // 加载数据
  const loadData = useCallback((): AppData => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          templates: parsed.templates || [],
          chains: parsed.chains || [],
          settings: parsed.settings || getDefaultSettings(),
          currentChain: parsed.currentChain || null,
          history: parsed.history || [],
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
          ...parsed
        };
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
    return getDefaultData();
  }, []);

  // 保存数据
  const saveData = useCallback((newData: AppData): boolean => {
    try {
      const dataToSave = {
        ...newData,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      return false;
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    const loadedData = loadData();
    setData(loadedData);
    setLoading(false);
  }, [loadData]);

  // 更新数据并保存
  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setData(prev => {
      const newData = updater(prev);
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  // 任务模板管理
  const createTemplate = useCallback((templateData: Omit<TaskTemplate, 'id' | 'createdAt'>) => {
    const template: TaskTemplate = {
      id: generateId(),
      ...templateData,
      createdAt: new Date().toISOString()
    };

    updateData(prev => ({
      ...prev,
      templates: [...prev.templates, template]
    }));

    return template;
  }, [updateData]);

  const updateTemplate = useCallback((id: string, updateData: Partial<TaskTemplate>) => {
    updateData(prev => ({
      ...prev,
      templates: prev.templates.map(t => 
        t.id === id ? { ...t, ...updateData, id } : t
      )
    }));
  }, [updateData]);

  const deleteTemplate = useCallback((id: string) => {
    updateData(prev => ({
      ...prev,
      templates: prev.templates.filter(t => t.id !== id)
    }));
  }, [updateData]);

  const getTemplate = useCallback((id: string) => {
    return data.templates.find(t => t.id === id);
  }, [data.templates]);

  // 任务类型管理
  const addTaskType = useCallback((typeData: TaskType) => {
    updateData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        taskTypes: [...prev.settings.taskTypes, typeData]
      }
    }));
  }, [updateData]);

  const updateTaskType = useCallback((index: number, typeData: Partial<TaskType>) => {
    updateData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        taskTypes: prev.settings.taskTypes.map((t, i) => 
          i === index ? { ...t, ...typeData } : t
        )
      }
    }));
  }, [updateData]);

  const deleteTaskType = useCallback((index: number) => {
    updateData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        taskTypes: prev.settings.taskTypes.filter((_, i) => i !== index)
      }
    }));
  }, [updateData]);

  const getTaskTypeByName = useCallback((name: string) => {
    return data.settings.taskTypes.find(type => type.name === name) || 
           { name, color: '#6b7280', textColor: '#ffffff' };
  }, [data.settings.taskTypes]);

  // 历史记录管理
  const addHistoryRecord = useCallback((recordData: Omit<HistoryRecord, 'id' | 'createdAt'>) => {
    const record: HistoryRecord = {
      id: generateId(),
      ...recordData,
      createdAt: new Date().toISOString()
    };

    updateData(prev => ({
      ...prev,
      history: [...prev.history, record]
    }));

    return record;
  }, [updateData]);

  const getTaskSessions = useCallback((filters: HistoryFilters = {}): TaskSession[] => {
    let records = [...data.history];

    // 应用筛选器
    if (filters.type) {
      records = records.filter(record => record.type === filters.type);
    }
    if (filters.status) {
      records = records.filter(record => record.status === filters.status);
    }
    if (filters.templateType) {
      records = records.filter(record => record.templateType === filters.templateType);
    }
    if (filters.startDate) {
      records = records.filter(record => new Date(record.createdAt) >= new Date(filters.startDate!));
    }
    if (filters.endDate) {
      records = records.filter(record => new Date(record.createdAt) <= new Date(filters.endDate!));
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      records = records.filter(record => 
        record.templateName.toLowerCase().includes(searchTerm)
      );
    }

    // 按sessionId分组
    const sessionMap = new Map<string, TaskSession>();
    
    records.forEach(record => {
      const sessionId = record.sessionId;
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          sessionId: sessionId,
          templateId: record.templateId,
          templateName: record.templateName,
          templateType: record.templateType,
          scheduledTime: record.scheduledTime,
          appointment: null,
          task: null,
          createdAt: record.createdAt,
          overallStatus: 'incomplete'
        });
      }
      
      const session = sessionMap.get(sessionId)!;
      if (record.type === 'appointment') {
        session.appointment = record;
      } else if (record.type === 'task') {
        session.task = record;
      }
      
      // 更新会话创建时间（取最早的记录时间）
      if (new Date(record.createdAt) < new Date(session.createdAt)) {
        session.createdAt = record.createdAt;
      }
    });
    
    // 确定会话的整体状态
    sessionMap.forEach(session => {
      if (session.appointment && session.task) {
        // 完整的会话：预约和任务都有
        if (session.appointment.status === 'success' && session.task.status === 'success') {
          session.overallStatus = 'success';
        } else {
          session.overallStatus = 'failed';
        }
      } else if (session.appointment && !session.task) {
        // 只有预约，没有任务
        session.overallStatus = session.appointment.status === 'success' ? 'incomplete' : 'failed';
      } else if (!session.appointment && session.task) {
        // 只有任务，没有预约（异常情况）
        session.overallStatus = session.task.status;
      }
    });
    
    // 转换为数组并排序
    const sessions = Array.from(sessionMap.values());
    sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return sessions;
  }, [data.history]);

  const getHistoryStats = useCallback((filters: HistoryFilters = {}): HistoryStats => {
    const sessions = getTaskSessions(filters);
    const records = data.history.filter(record => {
      if (filters.type && record.type !== filters.type) return false;
      if (filters.status && record.status !== filters.status) return false;
      if (filters.templateType && record.templateType !== filters.templateType) return false;
      if (filters.startDate && new Date(record.createdAt) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(record.createdAt) > new Date(filters.endDate)) return false;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!record.templateName.toLowerCase().includes(searchTerm)) return false;
      }
      return true;
    });
    
    const stats: HistoryStats = {
      totalSessions: sessions.length,
      totalRecords: records.length,
      sessions: {
        success: sessions.filter(s => s.overallStatus === 'success').length,
        failed: sessions.filter(s => s.overallStatus === 'failed').length,
        incomplete: sessions.filter(s => s.overallStatus === 'incomplete').length
      },
      appointments: {
        total: records.filter(r => r.type === 'appointment').length,
        success: records.filter(r => r.type === 'appointment' && r.status === 'success').length,
        failed: records.filter(r => r.type === 'appointment' && r.status === 'failed').length
      },
      tasks: {
        total: records.filter(r => r.type === 'task').length,
        success: records.filter(r => r.type === 'task' && r.status === 'success').length,
        failed: records.filter(r => r.type === 'task' && r.status === 'failed').length
      },
      byType: {},
      averageDuration: 0
    };

    // 按模板类型统计会话
    const typeStats: Record<string, { total: number; success: number; failed: number; incomplete: number }> = {};
    sessions.forEach(session => {
      if (!typeStats[session.templateType]) {
        typeStats[session.templateType] = { total: 0, success: 0, failed: 0, incomplete: 0 };
      }
      typeStats[session.templateType].total++;
      typeStats[session.templateType][session.overallStatus]++;
    });
    stats.byType = typeStats;

    // 计算平均执行时长（仅任务）
    const taskRecords = records.filter(r => r.type === 'task' && r.duration);
    if (taskRecords.length > 0) {
      const totalDuration = taskRecords.reduce((sum, r) => sum + (r.duration || 0), 0);
      stats.averageDuration = Math.round(totalDuration / taskRecords.length);
    }

    return stats;
  }, [data.history, getTaskSessions]);

  const deleteHistoryRecord = useCallback((id: string) => {
    updateData(prev => ({
      ...prev,
      history: prev.history.filter(r => r.id !== id)
    }));
  }, [updateData]);

  const clearHistory = useCallback(() => {
    updateData(prev => ({
      ...prev,
      history: []
    }));
  }, [updateData]);

  // 数据导入导出
  const exportData = useCallback(() => {
    const exportData = {
      ...data,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adhd_assistant_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  const importData = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          // 验证数据格式
          if (importedData && 
              Array.isArray(importedData.templates) && 
              Array.isArray(importedData.chains) && 
              importedData.settings) {
            
            const newData: AppData = {
              ...getDefaultData(),
              ...importedData,
              lastUpdated: new Date().toISOString()
            };
            
            setData(newData);
            saveData(newData);
            resolve('数据导入成功');
          } else {
            reject('数据格式不正确');
          }
        } catch (error) {
          reject('文件解析失败: ' + (error as Error).message);
        }
      };
      reader.onerror = () => reject('文件读取失败');
      reader.readAsText(file);
    });
  }, [saveData]);

  const clearAllData = useCallback(() => {
    const defaultData = getDefaultData();
    setData(defaultData);
    saveData(defaultData);
  }, [saveData]);

  return {
    data,
    loading,
    // 模板管理
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    // 任务类型管理
    addTaskType,
    updateTaskType,
    deleteTaskType,
    getTaskTypeByName,
    // 历史记录管理
    addHistoryRecord,
    getTaskSessions,
    getHistoryStats,
    deleteHistoryRecord,
    clearHistory,
    // 数据导入导出
    exportData,
    importData,
    clearAllData,
    // 工具函数
    generateId
  };
};
