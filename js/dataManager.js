/**
 * 数据管理器 - 处理本地存储、导入导出
 */
class DataManager {
  constructor() {
    this.storageKey = 'adhd_assistant_data';
    this.data = this.loadData();
  }

  /**
   * 加载数据
   */
  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          templates: parsed.templates || [],
          chains: parsed.chains || [],
          settings: parsed.settings || this.getDefaultSettings(),
          currentChain: parsed.currentChain || null,
          history: parsed.history || [],
          ...parsed
        };
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
    
    return this.getDefaultData();
  }

  /**
   * 获取默认数据
   */
  getDefaultData() {
    return {
      templates: [],
      chains: [],
      settings: this.getDefaultSettings(),
      currentChain: null,
      history: [], // 历史记录
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 获取默认设置
   */
  getDefaultSettings() {
    return {
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
    };
  }

  /**
   * 保存数据
   */
  saveData() {
    try {
      this.data.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      return false;
    }
  }

  /**
   * 任务模板管理
   */
  // 创建任务模板
  createTemplate(templateData) {
    const template = {
      id: this.generateId(),
      name: templateData.name,
      description: templateData.description || '',
      type: templateData.type || '默认类型',
      timerType: templateData.timerType || 'countdown',
      countdownTime: templateData.countdownTime || 1500, // 25分钟
      countupMinTime: templateData.countupMinTime || 300, // 5分钟
      countupMaxTime: templateData.countupMaxTime || 3600, // 60分钟
      forbiddenActions: templateData.forbiddenActions || [],
      createdAt: new Date().toISOString()
    };

    this.data.templates.push(template);
    this.saveData();
    return template;
  }

  // 更新任务模板
  updateTemplate(id, updateData) {
    const index = this.data.templates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.data.templates[index] = {
        ...this.data.templates[index],
        ...updateData,
        id: id // 确保ID不被修改
      };
      this.saveData();
      return this.data.templates[index];
    }
    return null;
  }

  // 删除任务模板
  deleteTemplate(id) {
    const index = this.data.templates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.data.templates.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // 获取任务模板
  getTemplate(id) {
    return this.data.templates.find(t => t.id === id);
  }

  // 获取所有任务模板
  getTemplates() {
    return this.data.templates;
  }

  /**
   * 任务链管理
   */
  // 创建任务链
  createChain(chainData) {
    const chain = {
      id: this.generateId(),
      name: chainData.name,
      items: [],
      currentStreak: 0,
      maxStreak: 0,
      createdAt: new Date().toISOString()
    };

    this.data.chains.push(chain);
    this.saveData();
    return chain;
  }

  // 更新任务链
  updateChain(id, updateData) {
    const index = this.data.chains.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.chains[index] = {
        ...this.data.chains[index],
        ...updateData,
        id: id
      };
      this.saveData();
      return this.data.chains[index];
    }
    return null;
  }

  // 获取任务链
  getChain(id) {
    return this.data.chains.find(c => c.id === id);
  }

  // 获取所有任务链
  getChains() {
    return this.data.chains;
  }

  // 设置当前任务链
  setCurrentChain(chainId) {
    this.data.currentChain = chainId;
    this.saveData();
  }

  // 获取当前任务链
  getCurrentChain() {
    if (this.data.currentChain) {
      return this.getChain(this.data.currentChain);
    }
    return null;
  }

  /**
   * 任务单元管理
   */
  // 创建任务单元
  createTaskUnit(templateId, scheduledAt) {
    const taskUnit = {
      id: this.generateId(),
      templateId: templateId,
      scheduledAt: scheduledAt,
      actualStartTime: null,
      completed: false,
      appointmentStatus: 'pending',
      violations: [],
      createdAt: new Date().toISOString()
    };

    return taskUnit;
  }

  // 更新任务单元
  updateTaskUnit(taskUnit) {
    // 任务单元通常存储在任务链中，这里提供更新逻辑
    return taskUnit;
  }

  /**
   * 设置管理
   */
  // 更新设置
  updateSettings(settings) {
    this.data.settings = {
      ...this.data.settings,
      ...settings
    };
    this.saveData();
    return this.data.settings;
  }

  // 获取设置
  getSettings() {
    return this.data.settings;
  }

  /**
   * 任务类型管理
   */
  // 获取所有任务类型
  getTaskTypes() {
    return this.data.settings.taskTypes || [];
  }

  // 添加任务类型
  addTaskType(typeData) {
    if (!this.data.settings.taskTypes) {
      this.data.settings.taskTypes = [];
    }
    
    const newType = {
      name: typeData.name,
      color: typeData.color || '#6b7280',
      textColor: typeData.textColor || '#ffffff'
    };
    
    this.data.settings.taskTypes.push(newType);
    this.saveData();
    return newType;
  }

  // 更新任务类型
  updateTaskType(index, typeData) {
    if (this.data.settings.taskTypes && this.data.settings.taskTypes[index]) {
      this.data.settings.taskTypes[index] = {
        ...this.data.settings.taskTypes[index],
        ...typeData
      };
      this.saveData();
      return this.data.settings.taskTypes[index];
    }
    return null;
  }

  // 删除任务类型
  deleteTaskType(index) {
    if (this.data.settings.taskTypes && this.data.settings.taskTypes[index]) {
      this.data.settings.taskTypes.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // 根据名称获取任务类型
  getTaskTypeByName(name) {
    const types = this.getTaskTypes();
    return types.find(type => type.name === name) || { name: name, color: '#6b7280', textColor: '#ffffff' };
  }

  /**
   * 历史记录管理
   */
  // 添加历史记录
  addHistoryRecord(recordData) {
    const record = {
      id: this.generateId(),
      sessionId: recordData.sessionId, // 任务会话ID，用于关联预约和任务记录
      type: recordData.type, // 'appointment' 或 'task'
      status: recordData.status, // 'success' 或 'failed'
      templateId: recordData.templateId,
      templateName: recordData.templateName,
      templateType: recordData.templateType,
      scheduledTime: recordData.scheduledTime,
      actualStartTime: recordData.actualStartTime,
      endTime: recordData.endTime,
      duration: recordData.duration, // 实际执行时长（秒）
      violations: recordData.violations || [], // 违规记录
      notes: recordData.notes || '',
      // 详细时间节点记录
      timeNodes: {
        appointmentStart: recordData.timeNodes?.appointmentStart || null, // 预约开始时间
        taskStart: recordData.timeNodes?.taskStart || null, // 任务开始时间
        taskEnd: recordData.timeNodes?.taskEnd || null, // 任务结束时间
        abandonTime: recordData.timeNodes?.abandonTime || null // 放弃时间
      },
      createdAt: new Date().toISOString()
    };

    console.log('DataManager: 添加历史记录:', record);
    this.data.history.push(record);
    this.saveData();
    console.log('DataManager: 历史记录已保存，当前记录数量:', this.data.history.length);
    return record;
  }

  // 获取任务会话记录
  getTaskSessions(filters = {}) {
    const records = this.getHistoryRecords(filters);
    
    // 按sessionId分组
    const sessionMap = new Map();
    
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
          overallStatus: 'incomplete' // incomplete, success, failed
        });
      }
      
      const session = sessionMap.get(sessionId);
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
    sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return sessions;
  }

  // 获取历史记录
  getHistoryRecords(filters = {}) {
    let records = [...this.data.history];

    // 按类型筛选
    if (filters.type) {
      records = records.filter(record => record.type === filters.type);
    }

    // 按状态筛选
    if (filters.status) {
      records = records.filter(record => record.status === filters.status);
    }

    // 按模板类型筛选
    if (filters.templateType) {
      records = records.filter(record => record.templateType === filters.templateType);
    }

    // 按时间范围筛选
    if (filters.startDate) {
      records = records.filter(record => new Date(record.createdAt) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      records = records.filter(record => new Date(record.createdAt) <= new Date(filters.endDate));
    }

    // 按模板名称搜索
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      records = records.filter(record => 
        record.templateName.toLowerCase().includes(searchTerm)
      );
    }

    // 排序（默认按时间倒序）
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return records;
  }

  // 获取历史记录统计
  getHistoryStats(filters = {}) {
    const sessions = this.getTaskSessions(filters);
    const records = this.getHistoryRecords(filters);
    
    const stats = {
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
    const typeStats = {};
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
      const totalDuration = taskRecords.reduce((sum, r) => sum + r.duration, 0);
      stats.averageDuration = Math.round(totalDuration / taskRecords.length);
    }

    return stats;
  }

  // 删除历史记录
  deleteHistoryRecord(id) {
    const index = this.data.history.findIndex(r => r.id === id);
    if (index !== -1) {
      this.data.history.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // 清空历史记录
  clearHistory() {
    this.data.history = [];
    this.saveData();
  }

  /**
   * 数据导入导出
   */
  // 导出数据
  exportData() {
    const exportData = {
      ...this.data,
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
  }

  // 导入数据
  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          // 验证数据格式
          if (this.validateImportData(importedData)) {
            // 备份当前数据
            const backup = { ...this.data };
            
            try {
              // 导入新数据
              this.data = {
                ...this.getDefaultData(),
                ...importedData,
                lastUpdated: new Date().toISOString()
              };
              
              this.saveData();
              resolve('数据导入成功');
            } catch (error) {
              // 恢复备份
              this.data = backup;
              this.saveData();
              reject('数据导入失败: ' + error.message);
            }
          } else {
            reject('数据格式不正确');
          }
        } catch (error) {
          reject('文件解析失败: ' + error.message);
        }
      };
      reader.onerror = () => reject('文件读取失败');
      reader.readAsText(file);
    });
  }

  // 验证导入数据
  validateImportData(data) {
    return data && 
           Array.isArray(data.templates) && 
           Array.isArray(data.chains) && 
           data.settings;
  }

  /**
   * 工具方法
   */
  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 清空所有数据
  clearAllData() {
    this.data = this.getDefaultData();
    this.saveData();
  }

  // 获取数据统计
  getStats() {
    return {
      templatesCount: this.data.templates.length,
      chainsCount: this.data.chains.length,
      totalTaskUnits: this.data.chains.reduce((total, chain) => {
        return total + this.countTaskUnits(chain);
      }, 0),
      lastUpdated: this.data.lastUpdated
    };
  }

  // 递归计算任务单元数量
  countTaskUnits(chain) {
    let count = 0;
    for (const item of chain.items) {
      if (item.type === 'taskUnit') {
        count++;
      } else if (item.type === 'chain') {
        count += this.countTaskUnits(item);
      }
    }
    return count;
  }
}

// 导出数据管理器
window.DataManager = DataManager;
