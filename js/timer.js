/**
 * 计时器模块 - 处理预约倒计时和任务计时
 */
class Timer {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.intervalId = null;
    this.remainingSeconds = 0;
    this.totalSeconds = 0;
    this.type = 'countdown'; // 'countdown' 或 'countup'
    this.callbacks = {
      onTick: null,
      onComplete: null,
      onPause: null,
      onResume: null
    };
  }

  /**
   * 设置计时器
   */
  setTimer(seconds, type = 'countdown') {
    this.totalSeconds = seconds;
    this.remainingSeconds = type === 'countdown' ? seconds : 0;
    this.type = type;
    this.isRunning = false;
    this.isPaused = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 开始计时
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;

    this.intervalId = setInterval(() => {
      if (this.type === 'countdown') {
        this.remainingSeconds--;
        if (this.remainingSeconds <= 0) {
          this.complete();
        }
      } else {
        this.remainingSeconds++;
        if (this.remainingSeconds >= this.totalSeconds) {
          this.complete();
        }
      }

      // 触发tick回调
      if (this.callbacks.onTick) {
        this.callbacks.onTick(this.getDisplayTime(), this.remainingSeconds);
      }
    }, 1000);

    // 触发tick回调
    if (this.callbacks.onTick) {
      this.callbacks.onTick(this.getDisplayTime(), this.remainingSeconds);
    }
  }

  /**
   * 暂停计时
   */
  pause() {
    if (!this.isRunning || this.isPaused) return;

    this.isPaused = true;
    clearInterval(this.intervalId);
    this.intervalId = null;

    if (this.callbacks.onPause) {
      this.callbacks.onPause();
    }
  }

  /**
   * 恢复计时
   */
  resume() {
    if (!this.isRunning || !this.isPaused) return;

    this.isPaused = false;
    this.start();

    if (this.callbacks.onResume) {
      this.callbacks.onResume();
    }
  }

  /**
   * 停止计时
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 重置计时器
   */
  reset() {
    this.stop();
    this.remainingSeconds = this.type === 'countdown' ? this.totalSeconds : 0;
  }

  /**
   * 完成计时
   */
  complete() {
    this.stop();
    
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete();
    }
  }

  /**
   * 获取显示时间
   */
  getDisplayTime() {
    const hours = Math.floor(this.remainingSeconds / 3600);
    const minutes = Math.floor((this.remainingSeconds % 3600) / 60);
    const seconds = this.remainingSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * 获取进度百分比
   */
  getProgress() {
    if (this.type === 'countdown') {
      return ((this.totalSeconds - this.remainingSeconds) / this.totalSeconds) * 100;
    } else {
      return (this.remainingSeconds / this.totalSeconds) * 100;
    }
  }

  /**
   * 设置回调函数
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * 获取状态
   */
  getStatus() {
    if (!this.isRunning) return 'stopped';
    if (this.isPaused) return 'paused';
    return 'running';
  }

  /**
   * 获取剩余时间（秒）
   */
  getRemainingSeconds() {
    return this.remainingSeconds;
  }

  /**
   * 获取总时间（秒）
   */
  getTotalSeconds() {
    return this.totalSeconds;
  }

  /**
   * 检查是否完成
   */
  isCompleted() {
    if (this.type === 'countdown') {
      return this.remainingSeconds <= 0;
    } else {
      return this.remainingSeconds >= this.totalSeconds;
    }
  }

  /**
   * 格式化时间（秒转换为可读格式）
   */
  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}小时${minutes}分钟${secs}秒`;
    } else if (minutes > 0) {
      return `${minutes}分钟${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  }

  /**
   * 解析时间字符串为秒数
   */
  static parseTime(timeString) {
    // 支持格式: "25:00", "1:30:00", "1500"
    if (typeof timeString === 'number') {
      return timeString;
    }

    if (typeof timeString === 'string') {
      // 如果是纯数字字符串，直接转换
      if (/^\d+$/.test(timeString)) {
        return parseInt(timeString);
      }

      // 解析时间格式 "HH:MM:SS" 或 "MM:SS"
      const parts = timeString.split(':').map(part => parseInt(part));
      
      if (parts.length === 2) {
        // MM:SS 格式
        return parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        // HH:MM:SS 格式
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }

    return 0;
  }
}

// 导出计时器类
window.Timer = Timer;
