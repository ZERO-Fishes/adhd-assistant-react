import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerType = 'countdown' | 'countup';
export type TimerStatus = 'stopped' | 'running' | 'paused';

export interface TimerCallbacks {
  onTick?: (displayTime: string, remainingSeconds: number) => void;
  onComplete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  type: TimerType;
  status: TimerStatus;
}

export const useTimer = () => {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    remainingSeconds: 0,
    totalSeconds: 0,
    type: 'countdown',
    status: 'stopped'
  });

  const intervalRef = useRef<number | null>(null);
  const callbacksRef = useRef<TimerCallbacks>({});

  // 设置计时器
  const setTimer = useCallback((seconds: number, type: TimerType = 'countdown') => {
    setState(prev => ({
      ...prev,
      totalSeconds: seconds,
      remainingSeconds: type === 'countdown' ? seconds : 0,
      type,
      isRunning: false,
      isPaused: false,
      status: 'stopped'
    }));

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 开始计时
  const start = useCallback(() => {
    if (state.isRunning) return;

    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      status: 'running'
    }));

    intervalRef.current = setInterval(() => {
      setState(prev => {
        let newRemainingSeconds = prev.remainingSeconds;
        
        if (prev.type === 'countdown') {
          newRemainingSeconds--;
          if (newRemainingSeconds <= 0) {
            // 倒计时完成
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
            setTimeout(() => {
              callbacksRef.current.onComplete?.();
            }, 0);
            
            return {
              ...prev,
              remainingSeconds: 0,
              isRunning: false,
              status: 'stopped'
            };
          }
        } else {
          newRemainingSeconds++;
          if (newRemainingSeconds >= prev.totalSeconds) {
            // 正计时完成
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
            setTimeout(() => {
              callbacksRef.current.onComplete?.();
            }, 0);
            
            return {
              ...prev,
              remainingSeconds: prev.totalSeconds,
              isRunning: false,
              status: 'stopped'
            };
          }
        }

        // 触发tick回调
        const displayTime = formatDisplayTime(newRemainingSeconds);
        callbacksRef.current.onTick?.(displayTime, newRemainingSeconds);

        return {
          ...prev,
          remainingSeconds: newRemainingSeconds
        };
      });
    }, 1000);

    // 立即触发一次tick回调
    const displayTime = formatDisplayTime(state.remainingSeconds);
    callbacksRef.current.onTick?.(displayTime, state.remainingSeconds);
  }, [state.isRunning, state.remainingSeconds, state.type, state.totalSeconds]);

  // 暂停计时
  const pause = useCallback(() => {
    if (!state.isRunning || state.isPaused) return;

    setState(prev => ({
      ...prev,
      isPaused: true,
      status: 'paused'
    }));

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    callbacksRef.current.onPause?.();
  }, [state.isRunning, state.isPaused]);

  // 恢复计时
  const resume = useCallback(() => {
    if (!state.isRunning || !state.isPaused) return;

    setState(prev => ({
      ...prev,
      isPaused: false,
      status: 'running'
    }));

    intervalRef.current = setInterval(() => {
      setState(prev => {
        let newRemainingSeconds = prev.remainingSeconds;
        
        if (prev.type === 'countdown') {
          newRemainingSeconds--;
          if (newRemainingSeconds <= 0) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
            setTimeout(() => {
              callbacksRef.current.onComplete?.();
            }, 0);
            
            return {
              ...prev,
              remainingSeconds: 0,
              isRunning: false,
              status: 'stopped'
            };
          }
        } else {
          newRemainingSeconds++;
          if (newRemainingSeconds >= prev.totalSeconds) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
            setTimeout(() => {
              callbacksRef.current.onComplete?.();
            }, 0);
            
            return {
              ...prev,
              remainingSeconds: prev.totalSeconds,
              isRunning: false,
              status: 'stopped'
            };
          }
        }

        const displayTime = formatDisplayTime(newRemainingSeconds);
        callbacksRef.current.onTick?.(displayTime, newRemainingSeconds);

        return {
          ...prev,
          remainingSeconds: newRemainingSeconds
        };
      });
    }, 1000);

    callbacksRef.current.onResume?.();
  }, [state.isRunning, state.isPaused, state.remainingSeconds, state.type, state.totalSeconds]);

  // 停止计时
  const stop = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      status: 'stopped'
    }));
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 重置计时器
  const reset = useCallback(() => {
    stop();
    setState(prev => ({
      ...prev,
      remainingSeconds: prev.type === 'countdown' ? prev.totalSeconds : 0
    }));
  }, [stop]);

  // 设置回调函数
  const setCallbacks = useCallback((callbacks: TimerCallbacks) => {
    callbacksRef.current = { ...callbacksRef.current, ...callbacks };
  }, []);

  // 获取显示时间
  const getDisplayTime = useCallback(() => {
    return formatDisplayTime(state.remainingSeconds);
  }, [state.remainingSeconds]);

  // 获取进度百分比
  const getProgress = useCallback(() => {
    if (state.type === 'countdown') {
      return ((state.totalSeconds - state.remainingSeconds) / state.totalSeconds) * 100;
    } else {
      return (state.remainingSeconds / state.totalSeconds) * 100;
    }
  }, [state.type, state.totalSeconds, state.remainingSeconds]);

  // 检查是否完成
  const isCompleted = useCallback(() => {
    if (state.type === 'countdown') {
      return state.remainingSeconds <= 0;
    } else {
      return state.remainingSeconds >= state.totalSeconds;
    }
  }, [state.type, state.remainingSeconds, state.totalSeconds]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    setTimer,
    start,
    pause,
    resume,
    stop,
    reset,
    setCallbacks,
    getDisplayTime,
    getProgress,
    isCompleted
  };
};

// 格式化显示时间
const formatDisplayTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};

// 格式化时间（秒转换为可读格式）
export const formatTime = (seconds: number): string => {
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
};

// 解析时间字符串为秒数
export const parseTime = (timeString: string | number): number => {
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
};

// 将秒数转换为小时和分钟
export const secondsToHoursMinutes = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return { hours, minutes };
};
