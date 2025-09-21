# ADHD助手 - React版本

基于CTDP理论的ADHD患者时间管理工具，使用React + Next.js + shadcn/ui构建。

## 功能特性

### ✅ 已实现功能

1. **数据管理**
   - 本地存储数据持久化
   - 数据导入导出
   - 数据备份和恢复

2. **任务模板管理**
   - 创建、编辑、删除任务模板
   - 支持倒计时和正计时两种模式
   - 自定义任务类型和颜色
   - 神圣座位约束清单

3. **计时器功能**
   - 预约倒计时（15分钟）
   - 任务计时（可配置）
   - 实时显示和状态管理
   - 音频提醒

4. **历史记录**
   - 详细的预约和任务记录
   - 按会话分组显示
   - 多维度筛选和搜索
   - 统计信息展示

5. **周历视图**
   - 课程表样式的周历显示
   - 时间轴和事件可视化
   - 周导航功能

6. **任务类型管理**
   - 自定义任务类型
   - 颜色和文字颜色配置
   - 类型预览功能

## 技术栈

- **框架**: Next.js 15 + React 19
- **UI组件**: shadcn/ui + Tailwind CSS
- **类型系统**: TypeScript
- **状态管理**: React Hooks
- **数据存储**: LocalStorage

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 主页面
│   ├── layout.tsx         # 布局组件
│   └── globals.css        # 全局样式
├── components/            # React组件
│   ├── ui/               # shadcn/ui组件
│   ├── TemplateManager.tsx    # 模板管理组件
│   ├── HistoryManager.tsx     # 历史记录组件
│   └── WeeklyCalendar.tsx     # 周历组件
├── hooks/                # 自定义Hooks
│   ├── useDataManager.ts      # 数据管理Hook
│   └── useTimer.ts            # 计时器Hook
└── types/                # TypeScript类型定义
    └── index.ts
```

## 安装和运行

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **构建生产版本**
   ```bash
   npm run build
   npm start
   ```

## 使用说明

### 1. 任务模板管理
- 在"任务模板"页面创建和管理任务模板
- 设置计时类型（倒计时/正计时）和时间
- 配置任务类型和约束清单

### 2. 任务执行
- 在首页选择任务类型和模板
- 点击"预约开始"开始15分钟倒计时
- 倒计时结束后点击"任务开始"开始任务
- 可随时点击"放弃"终止当前操作

### 3. 历史记录查看
- 在"历史记录"页面查看所有任务会话
- 使用筛选器按类型、状态、时间等筛选
- 查看详细的预约和任务信息

### 4. 周历视图
- 在首页查看本周的任务安排
- 支持周导航和事件详情查看

## 数据迁移

从原HTML版本迁移数据：

1. 在原版本中导出数据（设置页面 → 导出数据）
2. 在新版本中导入数据（设置页面 → 导入数据）

## 开发说明

### 添加新功能
1. 在`src/types/index.ts`中定义类型
2. 在`src/hooks/`中创建相关Hook
3. 在`src/components/`中创建组件
4. 在主页面中集成新功能

### 样式定制
- 使用Tailwind CSS类名
- 通过`src/app/globals.css`修改全局样式
- 使用shadcn/ui主题系统

## 许可证

MIT License
# adhd-assistant-react
