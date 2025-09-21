/**
 * ADHD助手主应用
 */
class ADHDAssistant {
  constructor() {
    this.dataManager = new DataManager();
    this.timer = new Timer();
    this.currentView = 'home';
    this.currentAppointment = null;
    this.currentTask = null;
    this.currentSessionId = null; // 当前任务会话ID
    
    this.init();
  }

  /**
   * 初始化应用
   */
  init() {
    this.setupEventListeners();
    this.setupTimerCallbacks();
    this.loadTemplates();
    this.updateTypeSelect(); // 初始化类型选择框
    this.updateTaskTypeSelect(); // 初始化任务类型选择框
    this.showView('home');
    this.updateUI();
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 导航按钮
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        this.showView(view);
      });
    });

    // 标题编辑
    const titleElement = document.getElementById('pageTitle');
    if (titleElement) {
      titleElement.addEventListener('click', () => titleElement.focus());
      titleElement.addEventListener('blur', () => this.saveTitle());
      titleElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          titleElement.blur();
        }
      });
    }

    // 模板管理
    this.setupTemplateListeners();
    
    // 预约和任务控制
    this.setupAppointmentListeners();
    
    // 任务类型和模板选择
    this.setupSelectionListeners();
    
    // 数据导入导出
    this.setupDataListeners();
    
    // 历史记录删除按钮事件委托
    this.setupHistoryListeners();
  }

  /**
   * 设置计时器回调
   */
  setupTimerCallbacks() {
    this.timer.setCallbacks({
      onTick: (displayTime, remainingSeconds) => {
        this.updateTimerDisplay(displayTime, remainingSeconds);
      },
      onComplete: () => {
        this.handleTimerComplete();
      }
    });
  }

  /**
   * 显示指定视图
   */
  showView(viewName) {
    // 隐藏所有视图
    document.querySelectorAll('.main-content').forEach(view => {
      view.classList.remove('active');
    });

    // 显示指定视图
    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    this.currentView = viewName;
    this.updateUI();
  }

  /**
   * 更新UI
   */
  updateUI() {
    switch (this.currentView) {
      case 'home':
        this.updateHomeView();
        break;
      case 'templates':
        this.updateTemplatesView();
        break;
      case 'chains':
        this.updateChainsView();
        break;
      case 'history':
        this.updateHistoryView();
        break;
      case 'settings':
        this.updateSettingsView();
        break;
    }
  }

  /**
   * 更新首页视图
   */
  updateHomeView() {
    const currentChain = this.dataManager.getCurrentChain();
    
    // 更新任务类型选择
    this.updateTaskTypeSelect();
    
    // 更新任务链状态
    this.updateChainStatus(currentChain);
    
    // 更新周历视图
    this.updateWeeklyCalendar();
  }

  /**
   * 更新任务链状态显示
   */
  updateChainStatus(chain) {
    const chainStatusElement = document.getElementById('chainStatus');
    if (chainStatusElement) {
      if (chain) {
        chainStatusElement.innerHTML = `
          <div class="chain-info">
            <h3>当前任务链: ${chain.name}</h3>
            <p>连续成功: ${chain.currentStreak} 次</p>
            <p>历史最高: ${chain.maxStreak} 次</p>
          </div>
        `;
      } else {
        chainStatusElement.innerHTML = `
          <div class="chain-info">
            <h3>暂无活跃任务链</h3>
            <p>请先创建任务链</p>
          </div>
        `;
      }
    }
  }

  /**
   * 设置模板管理监听器
   */
  setupTemplateListeners() {
    // 添加模板按钮
    const addTemplateBtn = document.getElementById('addTemplateBtn');
    if (addTemplateBtn) {
      addTemplateBtn.addEventListener('click', () => this.showAddTemplateModal());
    }

    // 模板表单提交
    const templateForm = document.getElementById('templateForm');
    if (templateForm) {
      templateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleTemplateSubmit();
      });
    }

    // 模板类型选择
    const timerTypeSelect = document.getElementById('timerType');
    if (timerTypeSelect) {
      timerTypeSelect.addEventListener('change', (e) => {
        this.toggleTimerTypeFields(e.target.value);
      });
    }

    // 时间输入监听器
    this.setupTimeInputListeners();
  }

  /**
   * 设置时间输入监听器
   */
  setupTimeInputListeners() {
    // 倒计时时间输入
    const countdownHours = document.getElementById('countdownHours');
    const countdownMinutes = document.getElementById('countdownMinutes');
    const countdownTime = document.getElementById('countdownTime');

    if (countdownHours && countdownMinutes && countdownTime) {
      const updateCountdownTime = () => {
        const hours = parseInt(countdownHours.value) || 0;
        const minutes = parseInt(countdownMinutes.value) || 0;
        const totalSeconds = hours * 3600 + minutes * 60;
        countdownTime.value = totalSeconds;
      };

      countdownHours.addEventListener('input', updateCountdownTime);
      countdownMinutes.addEventListener('input', updateCountdownTime);
    }

    // 正计时最小时间输入
    const countupMinHours = document.getElementById('countupMinHours');
    const countupMinMinutes = document.getElementById('countupMinMinutes');
    const countupMinTime = document.getElementById('countupMinTime');

    if (countupMinHours && countupMinMinutes && countupMinTime) {
      const updateCountupMinTime = () => {
        const hours = parseInt(countupMinHours.value) || 0;
        const minutes = parseInt(countupMinMinutes.value) || 0;
        const totalSeconds = hours * 3600 + minutes * 60;
        countupMinTime.value = totalSeconds;
      };

      countupMinHours.addEventListener('input', updateCountupMinTime);
      countupMinMinutes.addEventListener('input', updateCountupMinTime);
    }

    // 正计时最大时间输入
    const countupMaxHours = document.getElementById('countupMaxHours');
    const countupMaxMinutes = document.getElementById('countupMaxMinutes');
    const countupMaxTime = document.getElementById('countupMaxTime');

    if (countupMaxHours && countupMaxMinutes && countupMaxTime) {
      const updateCountupMaxTime = () => {
        const hours = parseInt(countupMaxHours.value) || 0;
        const minutes = parseInt(countupMaxMinutes.value) || 0;
        const totalSeconds = hours * 3600 + minutes * 60;
        countupMaxTime.value = totalSeconds;
      };

      countupMaxHours.addEventListener('input', updateCountupMaxTime);
      countupMaxMinutes.addEventListener('input', updateCountupMaxTime);
    }
  }

  /**
   * 显示添加模板模态框
   */
  showAddTemplateModal() {
    const modal = document.getElementById('templateModal');
    if (modal) {
      modal.classList.add('active');
      this.resetTemplateForm();
    }
  }

  /**
   * 重置模板表单
   */
  resetTemplateForm() {
    const form = document.getElementById('templateForm');
    const modal = document.getElementById('templateModal');
    
    if (form) {
      form.reset();
      this.toggleTimerTypeFields('countdown');
      
      // 重置时间字段为默认值
      this.resetTimeFields();
      
      // 重置模态框状态
      modal.removeAttribute('data-edit-mode');
      modal.removeAttribute('data-template-id');
      
      // 更新模态框标题
      const modalTitle = modal.querySelector('.modal-title');
      if (modalTitle) {
        modalTitle.textContent = '添加任务模板';
      }
      
      // 重置约束清单
      this.populateForbiddenActions([]);
    }
  }

  /**
   * 重置时间字段为默认值
   */
  resetTimeFields() {
    // 重置倒计时时间（25分钟）
    const countdownHours = document.getElementById('countdownHours');
    const countdownMinutes = document.getElementById('countdownMinutes');
    const countdownTime = document.getElementById('countdownTime');
    
    if (countdownHours && countdownMinutes && countdownTime) {
      countdownHours.value = 0;
      countdownMinutes.value = 25;
      countdownTime.value = 1500;
    }

    // 重置正计时最小时间（5分钟）
    const countupMinHours = document.getElementById('countupMinHours');
    const countupMinMinutes = document.getElementById('countupMinMinutes');
    const countupMinTime = document.getElementById('countupMinTime');
    
    if (countupMinHours && countupMinMinutes && countupMinTime) {
      countupMinHours.value = 0;
      countupMinMinutes.value = 5;
      countupMinTime.value = 300;
    }

    // 重置正计时最大时间（1小时）
    const countupMaxHours = document.getElementById('countupMaxHours');
    const countupMaxMinutes = document.getElementById('countupMaxMinutes');
    const countupMaxTime = document.getElementById('countupMaxTime');
    
    if (countupMaxHours && countupMaxMinutes && countupMaxTime) {
      countupMaxHours.value = 1;
      countupMaxMinutes.value = 0;
      countupMaxTime.value = 3600;
    }
  }

  /**
   * 切换计时器类型字段显示
   */
  toggleTimerTypeFields(timerType) {
    const countdownFields = document.getElementById('countdownFields');
    const countupFields = document.getElementById('countupFields');
    
    if (timerType === 'countdown') {
      countdownFields.style.display = 'block';
      countupFields.style.display = 'none';
    } else {
      countdownFields.style.display = 'none';
      countupFields.style.display = 'block';
    }
  }

  /**
   * 处理模板表单提交
   */
  handleTemplateSubmit() {
    const formData = new FormData(document.getElementById('templateForm'));
    const modal = document.getElementById('templateModal');
    const isEditMode = modal.dataset.editMode === 'true';
    const templateId = modal.dataset.templateId;

    const templateData = {
      name: formData.get('name'),
      description: formData.get('description'),
      type: formData.get('type'),
      timerType: formData.get('timerType'),
      countdownTime: parseInt(formData.get('countdownTime')) || 1500,
      countupMinTime: parseInt(formData.get('countupMinTime')) || 300,
      countupMaxTime: parseInt(formData.get('countupMaxTime')) || 3600,
      forbiddenActions: this.getForbiddenActions()
    };

    if (!templateData.name) {
      alert('请输入模板名称');
      return;
    }

    if (isEditMode && templateId) {
      // 编辑模式：更新现有模板
      this.dataManager.updateTemplate(templateId, templateData);
    } else {
      // 新建模式：创建新模板
      this.dataManager.createTemplate(templateData);
    }

    this.closeModal('templateModal');
    this.updateTemplatesView();
    this.updateHomeView();
  }

  /**
   * 获取约束清单
   */
  getForbiddenActions() {
    const actions = [];
    const forbiddenActionsContainer = document.getElementById('forbiddenActions');
    if (forbiddenActionsContainer) {
      const inputs = forbiddenActionsContainer.querySelectorAll('input[type="text"]');
      inputs.forEach(input => {
        if (input.value.trim()) {
          actions.push(input.value.trim());
        }
      });
    }
    return actions;
  }

  /**
   * 更新模板视图
   */
  updateTemplatesView() {
    const templates = this.dataManager.getTemplates();
    const templatesList = document.getElementById('templatesList');
    
    if (templatesList) {
      templatesList.innerHTML = '';
      
      templates.forEach(template => {
        const templateElement = this.createTemplateElement(template);
        templatesList.appendChild(templateElement);
      });
    }

    // 更新类型选择下拉框
    this.updateTypeSelect();
  }

  /**
   * 显示任务类型管理模态框
   */
  showTypeManagementModal() {
    const modal = document.getElementById('typeManagementModal');
    if (modal) {
      modal.classList.add('active');
      this.updateExistingTypesList();
      this.setupColorPreviewListeners();
    }
  }

  /**
   * 设置颜色预览监听器
   */
  setupColorPreviewListeners() {
    const colorInput = document.getElementById('newTypeColor');
    const textColorInput = document.getElementById('newTypeTextColor');
    const preview = document.getElementById('newTypePreview');

    if (colorInput && textColorInput && preview) {
      const updatePreview = () => {
        preview.style.backgroundColor = colorInput.value;
        preview.style.color = textColorInput.value;
      };

      colorInput.addEventListener('input', updatePreview);
      textColorInput.addEventListener('input', updatePreview);
      
      // 初始更新
      updatePreview();
    }
  }

  /**
   * 更新类型选择下拉框
   */
  updateTypeSelect() {
    const typeSelect = document.getElementById('templateType');
    if (!typeSelect) return;

    const currentValue = typeSelect.value;
    typeSelect.innerHTML = '<option value="">选择类型</option>';
    
    const taskTypes = this.dataManager.getTaskTypes();
    taskTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type.name;
      option.textContent = type.name;
      option.style.backgroundColor = type.color;
      option.style.color = type.textColor;
      typeSelect.appendChild(option);
    });

    // 恢复之前选择的值
    if (currentValue) {
      typeSelect.value = currentValue;
    }
  }

  /**
   * 更新任务类型选择下拉框
   */
  updateTaskTypeSelect() {
    const taskTypeSelect = document.getElementById('taskTypeSelect');
    if (!taskTypeSelect) return;

    const currentValue = taskTypeSelect.value;
    taskTypeSelect.innerHTML = '<option value="">选择任务类型</option>';
    
    const taskTypes = this.dataManager.getTaskTypes();
    taskTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type.name;
      option.textContent = type.name;
      option.style.backgroundColor = type.color;
      option.style.color = type.textColor;
      taskTypeSelect.appendChild(option);
    });

    // 恢复之前选择的值
    if (currentValue) {
      taskTypeSelect.value = currentValue;
    }
  }

  /**
   * 更新模板选择下拉框
   */
  updateTemplateSelect(selectedType = '') {
    const templateSelect = document.getElementById('templateSelect');
    if (!templateSelect) return;

    templateSelect.innerHTML = '<option value="">请先选择任务类型</option>';
    
    if (!selectedType) {
      templateSelect.disabled = true;
      return;
    }

    templateSelect.disabled = false;
    templateSelect.innerHTML = '<option value="">选择任务模板</option>';
    
    const templates = this.dataManager.getTemplates();
    const filteredTemplates = templates.filter(template => template.type === selectedType);
    
    filteredTemplates.forEach(template => {
      const option = document.createElement('option');
      option.value = template.id;
      
      // 显示模板名称和计时信息
      let timerInfo;
      if (template.timerType === 'countdown') {
        const { hours, minutes } = this.secondsToHoursMinutes(template.countdownTime);
        timerInfo = `倒计时: ${hours > 0 ? hours + '小时' : ''}${minutes}分钟`;
      } else {
        const minTime = this.secondsToHoursMinutes(template.countupMinTime);
        const maxTime = this.secondsToHoursMinutes(template.countupMaxTime);
        const minStr = `${minTime.hours > 0 ? minTime.hours + '小时' : ''}${minTime.minutes}分钟`;
        const maxStr = `${maxTime.hours > 0 ? maxTime.hours + '小时' : ''}${maxTime.minutes}分钟`;
        timerInfo = `正计时: ${minStr} - ${maxStr}`;
      }
      
      option.textContent = `${template.name} (${timerInfo})`;
      templateSelect.appendChild(option);
    });
  }

  /**
   * 创建模板元素
   */
  createTemplateElement(template) {
    const li = document.createElement('li');
    li.className = 'list-item';
    
    let timerInfo;
    if (template.timerType === 'countdown') {
      const { hours, minutes } = this.secondsToHoursMinutes(template.countdownTime);
      timerInfo = `倒计时: ${hours > 0 ? hours + '小时' : ''}${minutes}分钟`;
    } else {
      const minTime = this.secondsToHoursMinutes(template.countupMinTime);
      const maxTime = this.secondsToHoursMinutes(template.countupMaxTime);
      const minStr = `${minTime.hours > 0 ? minTime.hours + '小时' : ''}${minTime.minutes}分钟`;
      const maxStr = `${maxTime.hours > 0 ? maxTime.hours + '小时' : ''}${maxTime.minutes}分钟`;
      timerInfo = `正计时: ${minStr} - ${maxStr}`;
    }

    // 生成约束清单显示
    const constraintsInfo = template.forbiddenActions && template.forbiddenActions.length > 0 
      ? `约束: ${template.forbiddenActions.join(', ')}`
      : '无约束';

    // 获取类型颜色
    const typeColor = this.getTypeColor(template.type);
    
    li.innerHTML = `
      <div class="list-item-content">
        <div class="list-item-title">${template.name}</div>
        <div class="list-item-description">${template.description || '无描述'}</div>
        <div class="list-item-meta">
          <span class="type-badge" style="background-color: ${typeColor.color}; color: ${typeColor.textColor};">${template.type}</span>
          ${timerInfo}
        </div>
        <div class="list-item-constraints">
          ${constraintsInfo}
        </div>
      </div>
      <div class="list-item-actions">
        <button class="btn primary" onclick="app.showAppointmentModal('${template.id}')">预约</button>
        <button class="btn" onclick="app.copyTemplate('${template.id}')">复制</button>
        <button class="btn" onclick="app.editTemplate('${template.id}')">编辑</button>
        <button class="btn danger" onclick="app.deleteTemplate('${template.id}')">删除</button>
      </div>
    `;
    
    return li;
  }

  /**
   * 编辑模板
   */
  editTemplate(templateId) {
    const template = this.dataManager.getTemplate(templateId);
    if (!template) return;

    // 显示模态框
    const modal = document.getElementById('templateModal');
    modal.classList.add('active');
    
    // 设置编辑模式
    modal.dataset.editMode = 'true';
    modal.dataset.templateId = templateId;
    
    // 更新模态框标题
    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) {
      modalTitle.textContent = '编辑任务模板';
    }

    // 填充表单
    document.getElementById('templateName').value = template.name;
    document.getElementById('templateDescription').value = template.description;
    document.getElementById('templateType').value = template.type;
    document.getElementById('timerType').value = template.timerType;

    // 填充时间字段（转换为时分显示）
    this.fillTimeFields(template);

    // 切换计时器类型字段显示
    this.toggleTimerTypeFields(template.timerType);

    // 填充约束清单
    this.populateForbiddenActions(template.forbiddenActions);
  }

  /**
   * 填充时间字段
   */
  fillTimeFields(template) {
    // 倒计时时间
    const countdownHours = document.getElementById('countdownHours');
    const countdownMinutes = document.getElementById('countdownMinutes');
    const countdownTime = document.getElementById('countdownTime');
    
    if (countdownHours && countdownMinutes && countdownTime) {
      const { hours, minutes } = this.secondsToHoursMinutes(template.countdownTime);
      countdownHours.value = hours;
      countdownMinutes.value = minutes;
      countdownTime.value = template.countdownTime;
    }

    // 正计时最小时间
    const countupMinHours = document.getElementById('countupMinHours');
    const countupMinMinutes = document.getElementById('countupMinMinutes');
    const countupMinTime = document.getElementById('countupMinTime');
    
    if (countupMinHours && countupMinMinutes && countupMinTime) {
      const { hours, minutes } = this.secondsToHoursMinutes(template.countupMinTime);
      countupMinHours.value = hours;
      countupMinMinutes.value = minutes;
      countupMinTime.value = template.countupMinTime;
    }

    // 正计时最大时间
    const countupMaxHours = document.getElementById('countupMaxHours');
    const countupMaxMinutes = document.getElementById('countupMaxMinutes');
    const countupMaxTime = document.getElementById('countupMaxTime');
    
    if (countupMaxHours && countupMaxMinutes && countupMaxTime) {
      const { hours, minutes } = this.secondsToHoursMinutes(template.countupMaxTime);
      countupMaxHours.value = hours;
      countupMaxMinutes.value = minutes;
      countupMaxTime.value = template.countupMaxTime;
    }
  }

  /**
   * 将秒数转换为小时和分钟
   */
  secondsToHoursMinutes(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return { hours, minutes };
  }

  /**
   * 获取任务类型颜色
   */
  getTypeColor(typeName) {
    return this.dataManager.getTaskTypeByName(typeName);
  }

  /**
   * 填充约束清单
   */
  populateForbiddenActions(actions) {
    const container = document.getElementById('forbiddenActions');
    container.innerHTML = '';
    
    actions.forEach(action => {
      this.addForbiddenActionInput(action);
    });
    
    // 至少有一个输入框
    if (actions.length === 0) {
      this.addForbiddenActionInput('');
    }
  }

  /**
   * 添加约束清单输入框
   */
  addForbiddenActionInput(value = '') {
    const container = document.getElementById('forbiddenActions');
    const inputGroup = document.createElement('div');
    inputGroup.className = 'form-group';
    inputGroup.style.display = 'flex';
    inputGroup.style.gap = '10px';
    
    inputGroup.innerHTML = `
      <input type="text" class="form-input" value="${value}" placeholder="输入禁止的行为">
      <button type="button" class="btn danger" onclick="this.parentElement.remove()">删除</button>
    `;
    
    container.appendChild(inputGroup);
  }

  /**
   * 复制模板
   */
  copyTemplate(templateId) {
    const template = this.dataManager.getTemplate(templateId);
    if (!template) return;

    // 创建模板副本
    const copiedTemplate = {
      ...template,
      name: template.name + ' (副本)',
      id: undefined // 让系统生成新ID
    };

    // 创建新模板
    this.dataManager.createTemplate(copiedTemplate);
    this.updateTemplatesView();
    this.updateHomeView();
  }

  /**
   * 删除模板
   */
  deleteTemplate(templateId) {
    if (confirm('确定要删除这个模板吗？')) {
      this.dataManager.deleteTemplate(templateId);
      this.updateTemplatesView();
      this.updateHomeView();
    }
  }

  /**
   * 关闭模态框
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.removeAttribute('data-edit-mode');
      modal.removeAttribute('data-template-id');
    }
  }

  /**
   * 保存标题
   */
  saveTitle() {
    const titleElement = document.getElementById('pageTitle');
    if (titleElement) {
      localStorage.setItem('pageTitle', titleElement.textContent);
    }
  }

  /**
   * 加载模板
   */
  loadTemplates() {
    // 模板数据已通过dataManager加载
  }

  /**
   * 更新计时器显示
   */
  updateTimerDisplay(displayTime, remainingSeconds) {
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
      timerDisplay.textContent = displayTime;
    }
  }

  /**
   * 更新计时器状态
   */
  updateTimerStatus(status) {
    const statusElement = document.getElementById('timerStatus');
    if (statusElement) {
      statusElement.textContent = status;
      statusElement.className = `timer-status ${this.timer.getStatus()}`;
    }
  }

  /**
   * 更新计时器信息
   */
  updateTimerInfo(info) {
    const infoElement = document.getElementById('timerInfo');
    if (infoElement) {
      infoElement.textContent = info;
    }
  }

  /**
   * 处理计时器完成
   */
  handleTimerComplete() {
    this.playNotificationSound();
    
    if (this.currentAppointment && !this.currentTask) {
      // 预约倒计时完成
      this.handleAppointmentComplete();
    } else if (this.currentTask) {
      // 任务计时完成
      this.handleTaskComplete();
    }
  }

  /**
   * 播放提示音
   */
  playNotificationSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
  }

  /**
   * 处理预约完成
   */
  handleAppointmentComplete() {
    // 预约倒计时完成，可以开始任务
    this.updateTimerStatus('预约完成！');
    this.updateTimerInfo('可以开始任务了');
    
    // 预约倒计时完成，但不保存记录，等用户点击"任务开始"时再保存预约成功记录
    
    this.updateAppointmentButtons();
  }

  /**
   * 处理任务完成
   */
  handleTaskComplete() {
    // 任务计时完成
    this.updateTimerStatus('任务完成！');
    this.updateTimerInfo('恭喜完成任务！');
    
    // 保存任务成功记录
    this.saveTaskRecord('success');
    
    this.updateAppointmentButtons();
  }

  /**
   * 设置选择监听器
   */
  setupSelectionListeners() {
    // 任务类型选择
    const taskTypeSelect = document.getElementById('taskTypeSelect');
    if (taskTypeSelect) {
      taskTypeSelect.addEventListener('change', (e) => {
        const selectedType = e.target.value;
        this.updateTemplateSelect(selectedType);
        this.updateAppointmentButtons();
      });
    }

    // 模板选择
    const templateSelect = document.getElementById('templateSelect');
    if (templateSelect) {
      templateSelect.addEventListener('change', () => {
        this.updateAppointmentButtons();
      });
    }
  }

  /**
   * 设置预约监听器
   */
  setupAppointmentListeners() {
    // 预约按钮
    const startAppointmentBtn = document.getElementById('startAppointmentBtn');
    if (startAppointmentBtn) {
      startAppointmentBtn.addEventListener('click', () => this.startAppointment());
    }

    // 任务开始按钮
    const startTaskBtn = document.getElementById('startTaskBtn');
    if (startTaskBtn) {
      startTaskBtn.addEventListener('click', () => this.startTask());
    }

    // 放弃按钮
    const abandonBtn = document.getElementById('abandonBtn');
    if (abandonBtn) {
      abandonBtn.addEventListener('click', () => this.abandonCurrent());
    }
  }

  /**
   * 开始预约
   */
  startAppointment() {
    const templateId = document.getElementById('templateSelect').value;
    if (!templateId) {
      alert('请选择任务模板');
      return;
    }

    const template = this.dataManager.getTemplate(templateId);
    if (!template) return;

    const appointmentTime = this.dataManager.getSettings().defaultAppointmentTime;
    const appointmentStartTime = new Date();
    
    // 生成新的会话ID
    this.currentSessionId = this.dataManager.generateId();
    
    this.currentAppointment = {
      templateId: templateId,
      template: template,
      scheduledAt: new Date(Date.now() + appointmentTime * 1000),
      sessionId: this.currentSessionId,
      appointmentStartTime: appointmentStartTime
    };

    this.timer.setTimer(appointmentTime, 'countdown');
    this.timer.start();
    
    this.updateTimerStatus('预约倒计时进行中...');
    this.updateTimerInfo(`${template.name} 预约进行中`);
    this.updateAppointmentButtons();
  }

  /**
   * 开始任务
   */
  startTask() {
    if (!this.currentAppointment) {
      alert('请先开始预约');
      return;
    }

    const template = this.currentAppointment.template;
    const taskStartTime = new Date();
    let taskTime;
    
    if (template.timerType === 'countdown') {
      taskTime = template.countdownTime;
    } else {
      taskTime = template.countupMaxTime;
    }

    // 保存预约成功记录（用户点击任务开始表示预约成功）
    this.saveAppointmentRecord('success');

    this.currentTask = {
      ...this.currentAppointment,
      actualStartTime: taskStartTime,
      sessionId: this.currentSessionId,
      taskStartTime: taskStartTime
    };

    this.timer.setTimer(taskTime, template.timerType);
    this.timer.start();
    
    this.updateTimerStatus('任务进行中...');
    this.updateTimerInfo(`${template.name} 任务进行中`);
    this.updateAppointmentButtons();
  }

  /**
   * 放弃当前操作
   */
  abandonCurrent() {
    if (this.currentTask) {
      // 放弃任务
      if (confirm('确定要放弃当前任务吗？这将标记为任务失败。')) {
        this.handleTaskAbandon();
      }
    } else if (this.currentAppointment) {
      // 放弃预约
      if (confirm('确定要放弃当前预约吗？这将标记为预约失败。')) {
        this.handleAppointmentAbandon();
      }
    }
  }

  /**
   * 处理任务放弃
   */
  handleTaskAbandon() {
    // 记录放弃时间
    const abandonTime = new Date();
    this.currentTask.abandonTime = abandonTime;
    
    // 保存任务失败记录
    this.saveTaskRecord('failed');
    
    this.timer.reset();
    this.updateTimerStatus('任务失败');
    this.updateTimerInfo('任务已放弃');
    this.currentAppointment = null;
    this.currentTask = null;
    this.currentSessionId = null;
    this.updateAppointmentButtons();
  }

  /**
   * 处理预约放弃
   */
  handleAppointmentAbandon() {
    // 记录放弃时间
    const abandonTime = new Date();
    this.currentAppointment.abandonTime = abandonTime;
    
    // 调试信息
    console.log('预约放弃，保存失败记录:', this.currentAppointment);
    console.log('会话ID:', this.currentSessionId);
    
    // 保存预约失败记录
    this.saveAppointmentRecord('failed');
    
    this.timer.reset();
    this.updateTimerStatus('预约失败');
    this.updateTimerInfo('预约已放弃');
    this.currentAppointment = null;
    this.currentTask = null;
    this.currentSessionId = null;
    this.updateAppointmentButtons();
  }

  /**
   * 更新预约按钮状态
   */
  updateAppointmentButtons() {
    const startAppointmentBtn = document.getElementById('startAppointmentBtn');
    const startTaskBtn = document.getElementById('startTaskBtn');
    const abandonBtn = document.getElementById('abandonBtn');
    const templateSelect = document.getElementById('templateSelect');

    if (this.timer.getStatus() === 'stopped') {
      // 初始状态：只能开始预约（需要选择模板）
      const hasTemplate = templateSelect && templateSelect.value;
      startAppointmentBtn.disabled = !hasTemplate;
      startTaskBtn.style.display = 'none'; // 隐藏任务开始按钮
      abandonBtn.disabled = true;
    } else if (this.currentAppointment && !this.currentTask) {
      // 预约进行中：显示任务开始按钮，可以开始任务或放弃预约
      startAppointmentBtn.disabled = true;
      startTaskBtn.style.display = 'inline-block'; // 显示任务开始按钮
      startTaskBtn.disabled = false;
      abandonBtn.disabled = false;
    } else if (this.currentTask) {
      // 任务进行中：只能放弃任务
      startAppointmentBtn.disabled = true;
      startTaskBtn.style.display = 'inline-block';
      startTaskBtn.disabled = true;
      abandonBtn.disabled = false;
    }
  }

  /**
   * 显示预约模态框
   */
  showAppointmentModal(templateId) {
    // 这里可以实现预约模态框
    console.log('显示预约模态框:', templateId);
  }

  /**
   * 设置数据监听器
   */
  setupDataListeners() {
    // 导出数据按钮
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.dataManager.exportData());
    }

    // 导入数据按钮
    const importBtn = document.getElementById('importDataBtn');
    if (importBtn) {
      importBtn.addEventListener('click', () => this.showImportModal());
    }

    // 清空数据按钮
    const clearBtn = document.getElementById('clearDataBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAllData());
    }
  }

  /**
   * 设置历史记录相关事件监听器
   */
  setupHistoryListeners() {
    // 使用事件委托处理历史记录删除按钮
    const historyList = document.getElementById('historyList');
    if (historyList) {
      historyList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-session-btn')) {
          const historyItem = e.target.closest('.history-item');
          if (historyItem && historyItem.dataset.sessionId) {
            this.deleteTaskSession(historyItem.dataset.sessionId);
          }
        }
      });
    }
  }

  /**
   * 显示导入模态框
   */
  showImportModal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this.dataManager.importData(file)
          .then(message => {
            alert(message);
            this.updateUI();
          })
          .catch(error => {
            alert('导入失败: ' + error);
          });
      }
    };
    input.click();
  }

  /**
   * 清空所有数据
   */
  clearAllData() {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      this.dataManager.clearAllData();
      this.updateUI();
      alert('数据已清空');
    }
  }


  /**
   * 更新现有类型列表
   */
  updateExistingTypesList() {
    const container = document.getElementById('existingTypes');
    if (!container) return;

    container.innerHTML = '';
    const taskTypes = this.dataManager.getTaskTypes();
    
    taskTypes.forEach((type, index) => {
      const typeElement = document.createElement('div');
      typeElement.className = 'list-item';
      typeElement.style.marginBottom = '10px';
      
      typeElement.innerHTML = `
        <div class="list-item-content">
          <span class="type-badge" style="background-color: ${type.color}; color: ${type.textColor}; padding: 4px 8px; border-radius: 4px; font-size: 0.9rem;">
            ${type.name}
          </span>
        </div>
        <div class="list-item-actions">
          <button class="btn" onclick="app.editTaskType(${index})">编辑</button>
          <button class="btn danger" onclick="app.deleteTaskType(${index})">删除</button>
        </div>
      `;
      
      container.appendChild(typeElement);
    });
  }

  /**
   * 添加新任务类型
   */
  addNewTaskType() {
    const name = document.getElementById('newTypeName').value.trim();
    const color = document.getElementById('newTypeColor').value;
    const textColor = document.getElementById('newTypeTextColor').value;

    if (!name) {
      alert('请输入类型名称');
      return;
    }

    // 检查是否已存在
    const existingTypes = this.dataManager.getTaskTypes();
    if (existingTypes.some(type => type.name === name)) {
      alert('该类型已存在');
      return;
    }

    this.dataManager.addTaskType({ name, color, textColor });
    
    // 清空表单
    document.getElementById('newTypeName').value = '';
    document.getElementById('newTypeColor').value = '#6b7280';
    document.getElementById('newTypeTextColor').value = '#ffffff';
    
    // 更新列表
    this.updateExistingTypesList();
    this.updateTypeSelect();
    this.updateTaskTypeSelect();
    
    alert('类型添加成功！');
  }

  /**
   * 编辑任务类型
   */
  editTaskType(index) {
    const taskTypes = this.dataManager.getTaskTypes();
    const type = taskTypes[index];
    if (!type) return;

    // 创建编辑表单
    const editForm = document.createElement('div');
    editForm.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 1001;
      min-width: 400px;
    `;

    editForm.innerHTML = `
      <h3 style="margin-bottom: 20px;">编辑任务类型</h3>
      <div class="form-group">
        <label class="form-label">类型名称</label>
        <input type="text" id="editTypeName" class="form-input" value="${type.name}">
      </div>
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <div class="form-group" style="flex: 1;">
          <label class="form-label">背景色</label>
          <input type="color" id="editTypeColor" class="form-input" value="${type.color}">
        </div>
        <div class="form-group" style="flex: 1;">
          <label class="form-label">文字色</label>
          <input type="color" id="editTypeTextColor" class="form-input" value="${type.textColor}">
        </div>
        <div class="form-group" style="width: 80px;">
          <label class="form-label">预览</label>
          <div id="editTypePreview" class="type-preview" style="background-color: ${type.color}; color: ${type.textColor}; padding: 8px; border-radius: 4px; text-align: center; font-size: 0.9rem;">
            预览
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button class="btn" onclick="this.parentElement.parentElement.remove()">取消</button>
        <button class="btn primary" onclick="app.saveTaskTypeEdit(${index})">保存</button>
      </div>
    `;

    // 添加背景遮罩
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
    `;
    overlay.onclick = () => {
      overlay.remove();
      editForm.remove();
    };

    document.body.appendChild(overlay);
    document.body.appendChild(editForm);

    // 设置颜色预览监听器
    const colorInput = document.getElementById('editTypeColor');
    const textColorInput = document.getElementById('editTypeTextColor');
    const preview = document.getElementById('editTypePreview');

    if (colorInput && textColorInput && preview) {
      const updatePreview = () => {
        preview.style.backgroundColor = colorInput.value;
        preview.style.color = textColorInput.value;
      };

      colorInput.addEventListener('input', updatePreview);
      textColorInput.addEventListener('input', updatePreview);
    }
  }

  /**
   * 保存任务类型编辑
   */
  saveTaskTypeEdit(index) {
    const name = document.getElementById('editTypeName').value.trim();
    const color = document.getElementById('editTypeColor').value;
    const textColor = document.getElementById('editTypeTextColor').value;

    if (!name) {
      alert('类型名称不能为空');
      return;
    }

    // 检查名称是否重复（排除当前类型）
    const existingTypes = this.dataManager.getTaskTypes();
    if (existingTypes.some((t, i) => i !== index && t.name === name)) {
      alert('该类型名称已存在');
      return;
    }

    // 更新类型
    this.dataManager.updateTaskType(index, { name, color, textColor });
    this.updateExistingTypesList();
    this.updateTypeSelect();
    this.updateTaskTypeSelect();
    this.updateTemplatesView();
    
    // 关闭编辑表单
    const overlay = document.querySelector('div[style*="rgba(0,0,0,0.5)"]');
    const editForm = document.querySelector('div[style*="min-width: 400px"]');
    if (overlay) overlay.remove();
    if (editForm) editForm.remove();
    
    alert('类型更新成功！');
  }

  /**
   * 删除任务类型
   */
  deleteTaskType(index) {
    if (confirm('确定要删除这个任务类型吗？')) {
      this.dataManager.deleteTaskType(index);
      this.updateExistingTypesList();
      this.updateTypeSelect();
      this.updateTaskTypeSelect();
      this.updateTemplatesView();
    }
  }

  /**
   * 保存预约记录
   */
  saveAppointmentRecord(status) {
    if (!this.currentAppointment) {
      console.log('保存预约记录失败：没有当前预约');
      return;
    }

    const template = this.currentAppointment.template;
    const now = new Date();
    
    const recordData = {
      sessionId: this.currentSessionId,
      type: 'appointment',
      status: status,
      templateId: template.id,
      templateName: template.name,
      templateType: template.type,
      scheduledTime: this.currentAppointment.scheduledAt,
      actualStartTime: null,
      endTime: now,
      duration: null,
      violations: [],
      notes: status === 'success' ? '预约倒计时完成' : '预约被放弃',
      timeNodes: {
        appointmentStart: this.currentAppointment.appointmentStartTime,
        taskStart: null,
        taskEnd: null,
        abandonTime: status === 'failed' ? this.currentAppointment.abandonTime : null
      }
    };

    console.log('保存预约记录:', recordData);
    this.dataManager.addHistoryRecord(recordData);
    console.log('预约记录已保存');
  }

  /**
   * 保存任务记录
   */
  saveTaskRecord(status) {
    if (!this.currentTask) return;

    const template = this.currentTask.template;
    const now = new Date();
    
    // 计算实际执行时长
    let duration = null;
    if (this.currentTask.actualStartTime) {
      duration = Math.floor((now - new Date(this.currentTask.actualStartTime)) / 1000);
    }

    const recordData = {
      sessionId: this.currentSessionId,
      type: 'task',
      status: status,
      templateId: template.id,
      templateName: template.name,
      templateType: template.type,
      scheduledTime: this.currentTask.scheduledAt,
      actualStartTime: this.currentTask.actualStartTime,
      endTime: now,
      duration: duration,
      violations: [],
      notes: status === 'success' ? '任务完成' : '任务被放弃',
      timeNodes: {
        appointmentStart: this.currentTask.appointmentStartTime,
        taskStart: this.currentTask.taskStartTime,
        taskEnd: status === 'success' ? now : null,
        abandonTime: status === 'failed' ? this.currentTask.abandonTime : null
      }
    };

    this.dataManager.addHistoryRecord(recordData);
  }

  /**
   * 更新其他视图（占位方法）
   */
  updateChainsView() {
    // 任务链视图更新逻辑
  }

  updateHistoryView() {
    // 历史记录视图更新逻辑
    this.loadHistoryRecords();
    this.updateHistoryStats();
    this.updateHistoryFilters();
  }

  /**
   * 加载历史记录
   */
  loadHistoryRecords() {
    const filters = this.getCurrentHistoryFilters();
    const sessions = this.dataManager.getTaskSessions(filters);
    const historyList = document.getElementById('historyList');
    
    if (historyList) {
      historyList.innerHTML = '';
      
      if (sessions.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #787774; padding: 40px;">暂无历史记录</p>';
        return;
      }
      
      sessions.forEach(session => {
        const sessionElement = this.createTaskSessionElement(session);
        historyList.appendChild(sessionElement);
      });
    }
  }

  /**
   * 创建任务会话元素
   */
  createTaskSessionElement(session) {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.dataset.sessionId = session.sessionId;
    
    // 获取类型颜色
    const typeColor = this.getTypeColor(session.templateType);
    
    // 模块1：基本信息
    const startTime = new Date(session.createdAt);
    const startTimeStr = startTime.toLocaleString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // 整体状态
    let overallStatusText = '';
    let overallStatusClass = '';
    switch (session.overallStatus) {
      case 'success':
        overallStatusText = '完成';
        overallStatusClass = 'session-success';
        break;
      case 'failed':
        overallStatusText = '失败';
        overallStatusClass = 'session-failed';
        break;
      case 'incomplete':
        overallStatusText = '未完成';
        overallStatusClass = 'session-incomplete';
        break;
    }
    
    // 模块2：预约信息
    let appointmentInfo = '';
    if (session.appointment) {
      const appointmentStatus = session.appointment.status === 'success' ? '成功' : '失败';
      const appointmentStatusClass = session.appointment.status;
      
      // 预约开始时间
      let appointmentStartStr = '';
      if (session.appointment.timeNodes && session.appointment.timeNodes.appointmentStart) {
        const appointmentStart = new Date(session.appointment.timeNodes.appointmentStart);
        appointmentStartStr = appointmentStart.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      }
      
      // 等待时间（预约开始到任务开始的时间，如果预约失败则为null）
      let waitingTimeStr = '';
      if (session.appointment.status === 'success' && session.task && session.task.timeNodes && session.task.timeNodes.taskStart) {
        const appointmentStart = new Date(session.appointment.timeNodes.appointmentStart);
        const taskStart = new Date(session.task.timeNodes.taskStart);
        const waitingSeconds = Math.floor((taskStart - appointmentStart) / 1000);
        const { hours, minutes } = this.secondsToHoursMinutes(waitingSeconds);
        waitingTimeStr = hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
      } else if (session.appointment.status === 'failed') {
        waitingTimeStr = 'null';
      }
      
      appointmentInfo = `
        <div class="history-appointment-info">
          <div class="appointment-header">
            <div class="appointment-label">
              📅 预约信息
            </div>
            <span class="appointment-status ${appointmentStatusClass}">${appointmentStatus}</span>
          </div>
          <div class="appointment-details">
            <div class="appointment-detail-item">
              <span class="appointment-detail-label">开始时间:</span>
              <span class="appointment-detail-value">${appointmentStartStr}</span>
            </div>
            <div class="appointment-detail-item">
              <span class="appointment-detail-label">等待时间:</span>
              <span class="appointment-detail-value">${waitingTimeStr}</span>
            </div>
          </div>
        </div>
      `;
    }
    
    // 模块3：任务信息
    let taskInfo = '';
    if (session.appointment && session.appointment.status === 'failed') {
      // 预约失败，只显示失败信息
      taskInfo = `
        <div class="history-task-info">
          <div class="appointment-failed-message">
            预约失败，任务未开始
          </div>
        </div>
      `;
    } else if (session.task) {
      // 预约成功，显示任务信息
      const taskStatus = session.task.status === 'success' ? '成功' : '失败';
      const taskStatusClass = session.task.status;
      
      // 任务开始时间
      let taskStartStr = '';
      if (session.task.timeNodes && session.task.timeNodes.taskStart) {
        const taskStart = new Date(session.task.timeNodes.taskStart);
        taskStartStr = taskStart.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      }
      
      // 任务结束时间（如果失败则为null）
      let taskEndStr = '';
      if (session.task.status === 'success' && session.task.timeNodes && session.task.timeNodes.taskEnd) {
        const taskEnd = new Date(session.task.timeNodes.taskEnd);
        taskEndStr = taskEnd.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      } else if (session.task.status === 'failed') {
        taskEndStr = 'null';
      }
      
      // 持续时间（如果失败则为null）
      let durationStr = '';
      if (session.task.status === 'success' && session.task.duration !== null) {
        const { hours, minutes } = this.secondsToHoursMinutes(session.task.duration);
        durationStr = hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
      } else if (session.task.status === 'failed') {
        durationStr = 'null';
      }
      
      taskInfo = `
        <div class="history-task-info">
          <div class="task-header">
            <div class="task-label">
              🎯 任务信息
            </div>
            <span class="task-status ${taskStatusClass}">${taskStatus}</span>
          </div>
          <div class="task-details">
            <div class="task-detail-item">
              <span class="task-detail-label">开始时间:</span>
              <span class="task-detail-value">${taskStartStr}</span>
            </div>
            <div class="task-detail-item">
              <span class="task-detail-label">结束时间:</span>
              <span class="task-detail-value">${taskEndStr}</span>
            </div>
            <div class="task-detail-item">
              <span class="task-detail-label">持续时间:</span>
              <span class="task-detail-value">${durationStr}</span>
            </div>
          </div>
        </div>
      `;
    }
    
    div.innerHTML = `
      <!-- 模块1：基本信息 -->
      <div class="history-basic-info">
        <div class="basic-info-left">
          <div class="history-title">
            ${session.templateName}
            <span class="task-type-badge" style="background-color: ${typeColor.color}; color: ${typeColor.textColor};">${session.templateType}</span>
          </div>
          <div class="history-start-time">
            🕐 ${startTimeStr}
          </div>
        </div>
        <div class="basic-info-right">
          <span class="status-badge ${overallStatusClass}">${overallStatusText}</span>
          <button class="btn danger delete-session-btn" style="padding: 4px 8px; font-size: 0.8rem;">删除</button>
        </div>
      </div>
      
      <!-- 模块2：预约信息 -->
      ${appointmentInfo}
      
      <!-- 模块3：任务信息 -->
      ${taskInfo}
    `;
    
    return div;
  }

  /**
   * 更新历史记录统计
   */
  updateHistoryStats() {
    const filters = this.getCurrentHistoryFilters();
    const stats = this.dataManager.getHistoryStats(filters);
    const statsContainer = document.getElementById('historyStats');
    
    if (statsContainer) {
      const { hours: avgHours, minutes: avgMinutes } = this.secondsToHoursMinutes(stats.averageDuration);
      const avgDurationStr = avgHours > 0 ? `${avgHours}小时${avgMinutes}分钟` : `${avgMinutes}分钟`;
      
      statsContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-value">${stats.totalSessions}</div>
          <div class="stat-label">任务会话</div>
          <div class="stat-detail">完成: ${stats.sessions.success} | 失败: ${stats.sessions.failed} | 未完成: ${stats.sessions.incomplete}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalRecords}</div>
          <div class="stat-label">总记录数</div>
          <div class="stat-detail">预约: ${stats.appointments.total} | 任务: ${stats.tasks.total}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.appointments.success}</div>
          <div class="stat-label">预约成功</div>
          <div class="stat-detail">成功率: ${stats.appointments.total > 0 ? Math.round(stats.appointments.success / stats.appointments.total * 100) : 0}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.tasks.success}</div>
          <div class="stat-label">任务成功</div>
          <div class="stat-detail">成功率: ${stats.tasks.total > 0 ? Math.round(stats.tasks.success / stats.tasks.total * 100) : 0}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${avgDurationStr}</div>
          <div class="stat-label">平均执行时长</div>
        </div>
      `;
    }
  }

  /**
   * 更新历史记录筛选器
   */
  updateHistoryFilters() {
    const templateTypeSelect = document.getElementById('filterTemplateType');
    if (templateTypeSelect) {
      const currentValue = templateTypeSelect.value;
      templateTypeSelect.innerHTML = '<option value="">全部</option>';
      
      const taskTypes = this.dataManager.getTaskTypes();
      taskTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name;
        templateTypeSelect.appendChild(option);
      });
      
      if (currentValue) {
        templateTypeSelect.value = currentValue;
      }
    }
  }

  /**
   * 获取当前筛选条件
   */
  getCurrentHistoryFilters() {
    return {
      type: document.getElementById('filterType')?.value || '',
      status: document.getElementById('filterStatus')?.value || '',
      templateType: document.getElementById('filterTemplateType')?.value || '',
      search: document.getElementById('filterSearch')?.value || '',
      startDate: document.getElementById('filterStartDate')?.value || '',
      endDate: document.getElementById('filterEndDate')?.value || ''
    };
  }

  /**
   * 应用历史记录筛选
   */
  applyHistoryFilters() {
    this.loadHistoryRecords();
    this.updateHistoryStats();
  }

  /**
   * 清除历史记录筛选
   */
  clearHistoryFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterTemplateType').value = '';
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    
    this.loadHistoryRecords();
    this.updateHistoryStats();
  }

  /**
   * 删除任务会话
   */
  deleteTaskSession(sessionId) {
    if (confirm('确定要删除这个任务会话吗？这将删除相关的所有记录。')) {
      // 删除该会话的所有记录
      const records = this.dataManager.getHistoryRecords();
      const sessionRecords = records.filter(r => r.sessionId === sessionId);
      
      sessionRecords.forEach(record => {
        this.dataManager.deleteHistoryRecord(record.id);
      });
      
      this.loadHistoryRecords();
      this.updateHistoryStats();
    }
  }

  /**
   * 清空所有历史记录
   */
  clearAllHistory() {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
      this.dataManager.clearHistory();
      this.loadHistoryRecords();
      this.updateHistoryStats();
      alert('历史记录已清空');
    }
  }

  updateSettingsView() {
    // 设置视图更新逻辑
  }

  /**
   * 周历视图相关方法
   */
  updateWeeklyCalendar() {
    const weeklyCalendar = document.getElementById('weeklyCalendar');
    if (!weeklyCalendar) return;

    // 获取当前周的历史记录
    const sessions = this.dataManager.getTaskSessions();
    const weeklyData = this.convertSessionsToWeeklyData(sessions);
    
    // 生成周历HTML
    const weeklyHTML = this.generateWeeklyHTML(weeklyData);
    weeklyCalendar.innerHTML = weeklyHTML;
    
    // 绑定事件
    this.bindWeeklyEvents();
  }

  convertSessionsToWeeklyData(sessions) {
    const weeklyData = new Map();
    
    sessions.forEach(session => {
      const date = new Date(session.createdAt);
      const dayOfWeek = date.getDay(); // 0=周日, 1=周一, ..., 6=周六
      const timeSlot = this.getTimeSlot(date);
      
      if (!weeklyData.has(dayOfWeek)) {
        weeklyData.set(dayOfWeek, new Map());
      }
      
      if (!weeklyData.get(dayOfWeek).has(timeSlot)) {
        weeklyData.get(dayOfWeek).set(timeSlot, []);
      }
      
      const event = {
        id: session.sessionId,
        name: session.templateName,
        time: this.formatTime(date),
        datetime: date.toISOString(),
        status: session.overallStatus,
        session: session
      };
      
      weeklyData.get(dayOfWeek).get(timeSlot).push(event);
    });
    
    return weeklyData;
  }

  getTimeSlot(date) {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return Math.floor((hour * 60 + minute) / 30); // 每30分钟一个时间段
  }

  formatTime(date) {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  generateWeeklyHTML(weeklyData) {
    const today = new Date();
    const currentWeekStart = this.getWeekStart(today);
    
    // 生成周历网格
    let weeklyHTML = `
      <div class="weekly-calendar-grid">
        <div class="weekly-time-column">
    `;
    
    // 生成时间轴（6:00 - 22:00，每30分钟一个时间段）
    for (let hour = 6; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        weeklyHTML += `<div class="weekly-time-slot">${timeStr}</div>`;
      }
    }
    
    weeklyHTML += '</div>';
    
    // 生成7天的列
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(currentWeekStart);
      currentDate.setDate(currentWeekStart.getDate() + day);
      const isToday = this.isSameDay(currentDate, today);
      const isWeekend = day === 0 || day === 6;
      
      let dayClass = 'weekly-day-column';
      let headerClass = 'weekly-day-header';
      if (isToday) headerClass += ' today';
      if (isWeekend) headerClass += ' weekend';
      
      weeklyHTML += `
        <div class="${dayClass}">
          <div class="${headerClass}">
            ${dayNames[day]}<br>
            <small>${currentDate.getDate()}</small>
          </div>
      `;
      
      // 生成时间槽
      for (let hour = 6; hour < 22; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeSlot = this.getTimeSlot(new Date(2024, 0, 1, hour, minute));
          const events = weeklyData.get(day)?.get(timeSlot) || [];
          
          weeklyHTML += `<div class="weekly-time-slot-cell">`;
          
          // 显示事件
          events.forEach(event => {
            weeklyHTML += `
              <div class="weekly-event ${event.status}" onclick="app.showWeeklyEventDetail('${event.id}')">
                ${event.name}
              </div>
            `;
          });
          
          weeklyHTML += '</div>';
        }
      }
      
      weeklyHTML += '</div>';
    }
    
    weeklyHTML += '</div>';
    return weeklyHTML;
  }

  getWeekStart(date) {
    const day = date.getDay();
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - day);
    return weekStart;
  }

  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  bindWeeklyEvents() {
    // 周历事件绑定逻辑
  }

  previousWeek() {
    // 切换到上周
    // 这里可以添加周切换逻辑
  }

  nextWeek() {
    // 切换到下周
    // 这里可以添加周切换逻辑
  }

  goToCurrentWeek() {
    // 回到本周
    // 这里可以添加回到本周逻辑
  }

  showWeeklyEventDetail(sessionId) {
    const sessions = this.dataManager.getTaskSessions();
    const session = sessions.find(s => s.sessionId === sessionId);
    
    if (!session) return;
    
    // 创建事件详情弹窗
    const overlay = document.createElement('div');
    overlay.className = 'weekly-event-detail-overlay';
    overlay.onclick = () => this.closeWeeklyEventDetail();
    
    const detail = document.createElement('div');
    detail.className = 'weekly-event-detail';
    detail.onclick = (e) => e.stopPropagation();
    
    detail.innerHTML = `
      <div class="weekly-event-detail-header">
        <h3 class="weekly-event-detail-title">${session.templateName}</h3>
        <button class="weekly-event-detail-close" onclick="app.closeWeeklyEventDetail()">×</button>
      </div>
      <div class="weekly-event-detail-content">
        <div class="weekly-event-detail-item">
          <span class="weekly-event-detail-label">任务类型:</span>
          <span class="weekly-event-detail-value">${session.templateType}</span>
        </div>
        <div class="weekly-event-detail-item">
          <span class="weekly-event-detail-label">开始时间:</span>
          <span class="weekly-event-detail-value">${new Date(session.createdAt).toLocaleString('zh-CN')}</span>
        </div>
        <div class="weekly-event-detail-item">
          <span class="weekly-event-detail-label">整体状态:</span>
          <span class="weekly-event-detail-value">${this.getStatusText(session.overallStatus)}</span>
        </div>
        ${session.appointment ? `
        <div class="weekly-event-detail-item">
          <span class="weekly-event-detail-label">预约状态:</span>
          <span class="weekly-event-detail-value">${this.getStatusText(session.appointment.status)}</span>
        </div>
        ` : ''}
        ${session.task ? `
        <div class="weekly-event-detail-item">
          <span class="weekly-event-detail-label">任务状态:</span>
          <span class="weekly-event-detail-value">${this.getStatusText(session.task.status)}</span>
        </div>
        ` : ''}
      </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(detail);
  }

  closeWeeklyEventDetail() {
    const overlay = document.querySelector('.weekly-event-detail-overlay');
    const detail = document.querySelector('.weekly-event-detail');
    
    if (overlay) overlay.remove();
    if (detail) detail.remove();
  }

  getStatusText(status) {
    const statusMap = {
      'success': '成功',
      'failed': '失败',
      'incomplete': '未完成'
    };
    return statusMap[status] || status;
  }
}

// 全局应用实例
let app;

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  app = new ADHDAssistant();
  
  // 加载保存的标题
  const savedTitle = localStorage.getItem('pageTitle');
  if (savedTitle) {
    const titleElement = document.getElementById('pageTitle');
    if (titleElement) {
      titleElement.textContent = savedTitle;
    }
  }
});

// 注册Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
