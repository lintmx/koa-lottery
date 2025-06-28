# 🎰 KOA 抽奖系统

一个基于 Vue 3 + TypeScript + Three.js 的现代化 3D 抽奖系统，支持自定义参与者、奖品管理和炫酷的 3D 抽奖动画效果。

## ✨ 功能特性

- 🎮 **3D 抽奖动画** - 基于 Three.js 的炫酷 3D 球体动画效果
- 👥 **参与者管理** - 支持 CSV 导入/导出、手动添加/删除参与者
- 🏆 **奖品管理** - 灵活的奖品配置，支持多份同样奖品
- 📊 **结果记录** - 完整的抽奖历史记录和结果导出
- ⚙️ **自定义设置** - 可配置站点名称、动画时长等参数
- 💾 **本地存储** - 数据自动保存到浏览器本地存储
- 📱 **响应式设计** - 适配桌面和移动设备
- 🎨 **现代化 UI** - 基于 Element Plus 的精美界面

## 🚀 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **3D 图形**: Three.js
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: CSS3 + Element Plus 主题定制
- **工具库**: UUID、Papa Parse (CSV 处理)

## 📦 安装和运行

### 环境要求

- Node.js >= 18
- pnpm (推荐) 或 npm

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 或
npm run dev
```

访问 http://localhost:5173 查看应用

### 生产构建

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 类型检查

```bash
# 运行 TypeScript 类型检查
pnpm type-check
```

## 🎯 使用说明

### 1. 参与者管理

- **导入参与者**: 点击"导入参与者"按钮，支持 CSV 文件导入
- **手动添加**: 在参与者列表中直接添加新的参与者
- **批量操作**: 支持批量删除和重置中奖状态

### 2. 奖品设置

- **添加奖品**: 设置奖品名称和数量
- **奖品管理**: 可编辑、删除已添加的奖品
- **奖品状态**: 实时显示已中奖数量和剩余数量

### 3. 开始抽奖

1. 选择要抽取的奖品
2. 点击"开始抽奖"按钮
3. 享受 3D 动画效果
4. 查看抽奖结果
5. 点击继续进行下一轮抽奖

### 4. 结果管理

- **查看历史**: 在结果页面查看所有抽奖记录
- **导出结果**: 支持将抽奖结果导出为 CSV 文件
- **重置数据**: 可清空所有数据重新开始

### 5. 系统设置

- **站点名称**: 自定义抽奖活动标题
- **动画时长**: 调整 3D 抽奖动画持续时间
- **其他配置**: 音效开关等个性化设置

## 📁 项目结构

```
koa-lottery/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 样式和静态资源
│   ├── components/        # Vue 组件
│   │   ├── Lottery3D.vue    # 3D 抽奖组件
│   │   ├── ParticipantImport.vue # 参与者导入
│   │   ├── PrizeImport.vue       # 奖品管理
│   │   ├── ResultsDialog.vue     # 结果对话框
│   │   └── SettingsDialog.vue    # 设置对话框
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   │   └── lottery.ts       # 抽奖状态管理
│   ├── types/             # TypeScript 类型定义
│   │   └── lottery.ts       # 抽奖相关类型
│   ├── utils/             # 工具函数
│   │   ├── csv.ts          # CSV 处理
│   │   └── storage.ts      # 本地存储
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── package.json
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── vercel.json            # Vercel 部署配置
```

## 🎨 主要功能组件

### Lottery3D 组件

核心的 3D 抽奖动画组件，基于 Three.js 实现：

- 3D 球体粒子系统
- 平滑的相机动画
- 参与者名字的动态显示
- 获奖者的特效展示

### 状态管理

使用 Pinia 进行全局状态管理：

- 参与者列表管理
- 奖品配置管理
- 抽奖结果记录
- 系统设置保存

## 🔧 自定义配置

### 修改默认设置

在 `src/stores/lottery.ts` 中可以修改默认配置：

```typescript
const settings = ref<LotterySettings>({
  siteName: 'KOA 季度新番抽奖',  // 修改默认标题
  animationDuration: 3000,        // 修改动画时长
  autoPlayMusic: false,           // 音效设置
  backgroundMusic: ''
})
```

### 样式定制

在 `src/assets/` 目录下修改 CSS 文件来自定义界面样式。

## 🚀 部署

### Vercel 部署

项目已配置 Vercel 部署，直接连接 GitHub 仓库即可自动部署。

### 其他平台部署

```bash
# 构建项目
pnpm build

# 将 dist 目录部署到任何静态文件托管服务
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🎉 特别感谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Three.js](https://threejs.org/) - 3D 图形库
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Vite](https://vitejs.dev/) - 现代化构建工具

---

🎊 **祝您抽奖愉快！** 🎊