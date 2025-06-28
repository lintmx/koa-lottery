# KOA 季度新番抽奖系统

一个基于 Vue 3 + TypeScript + Vite + Element Plus 开发的炫酷抽奖系统，具有3D视觉效果和完整的数据管理功能。

## ✨ 特性

- 🎯 **炫酷3D抽奖效果** - 基于 Three.js 的3D抽奖动画
- 📊 **CSV数据导入** - 支持参与者和奖品的CSV文件导入
- 💾 **本地数据存储** - 数据自动保存到本地，刷新不丢失
- 🎲 **公平抽## 🚀 部署

本项目支持多种部署方式：

### Vercel 一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📞 支持

如有问题，请提交 Issue 或联系开发团队。

## 📊 项目统计

- 支持现代浏览器（Chrome 90+、Firefox 88+、Safari 14+）
- 响应式设计，支持移动端和桌面端
- 零配置部署，开箱即用
- 完全本地化，无需服务器

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Vite 文档](https://vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/)
- [Three.js 文档](https://threejs.org/)

---

*最后更新: 2025年6月29日*ercel.com/new/clone?repository-url=https://github.com/your-username/koa-lottery)

### 自动部署

项目已配置 GitHub Actions，推送到主分支时自动部署：
- **Pull Request**: 创建预览部署
- **Push to main/master**: 创建生产部署
- 详细部署配置请参考：[DEPLOYMENT.md](./DEPLOYMENT.md)

### 手动部署

```bash
# 构建项目
pnpm build

# 部署到 Vercel（需要先安装 Vercel CLI）
npm i -g vercel
vercel --prod

# 或者部署到其他静态托管服务
# 将 dist/ 目录下的文件上传到你的服务器
```

### 本地预览生产构建

```bash
# 构建并预览
pnpm build && pnpm preview
```抽
- 📈 **实时统计** - 完整的抽奖统计和进度显示
- 🔄 **结果管理** - 可查看、导出、打印所有抽奖结果
- 📱 **响应式设计** - 适配PC和移动端
- 🎨 **现代化UI** - 基于Element Plus的美观界面

## 🚀 快速开始

### 环境要求

- Node.js 18+ (推荐 22+)
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

### 类型检查

```bash
pnpm type-check
```

## 📖 使用指南

### 1. 导入参与者数据

支持两种方式导入参与者：

#### CSV文件导入
1. 点击"导入参与者"按钮
2. 选择"CSV文件导入"标签页
3. 拖拽或选择CSV文件上传
4. 点击"解析文件"预览数据
5. 确认导入

#### 手动输入
1. 点击"导入参与者"按钮
2. 选择"手动输入"标签页
3. 填写参与者信息
4. 点击"添加参与者"

#### CSV文件格式
参与者CSV文件应包含以下列（支持中英文列名）：
- `name` 或 `姓名`: 参与者姓名（必填）
- `email` 或 `邮箱`: 邮箱地址（可选）
- `department` 或 `部门`: 所属部门（可选）

示例CSV内容：
```csv
name,email,department
张三,zhangsan@example.com,技术部
李四,lisi@example.com,产品部
王五,wangwu@example.com,设计部
```

### 2. 导入奖品数据

同样支持CSV文件和手动输入两种方式：

#### CSV文件格式
奖品CSV文件应包含以下列（支持中英文列名）：
- `name` 或 `奖品名称`: 奖品名称（必填）
- `count` 或 `数量`: 奖品数量（必填，数字）

示例CSV内容：
```csv
name,count
手机,1
平板,2
耳机,5
```

或使用中文列名：
```csv
奖品名称,数量
iPhone 15 Pro,1
iPad Air,2
AirPods Pro,5
```

### 3. 开始抽奖

1. 确保已导入参与者和奖品数据
2. 在左侧奖品列表中选择要抽取的奖品
3. 点击"开始抽奖"按钮
4. 观看炫酷的3D抽奖动画
5. 抽奖结束后会显示中奖者信息

### 4. 管理抽奖结果

- **查看结果**: 点击"查看结果"按钮查看所有中奖记录
- **导出结果**: 支持导出CSV格式的抽奖结果
- **打印结果**: 支持打印抽奖结果清单
- **删除重抽**: 可以删除任意中奖结果，该参与者重新参与抽奖

### 5. 系统设置

点击"设置"按钮可以：
- 修改网站名称
- 调整抽奖动画时长
- 设置背景音乐
- 导出/导入系统数据
- 重置所有数据

## 🛠️ 技术栈

- **前端框架**: Vue 3.5.17 (Composition API)
- **类型检查**: TypeScript 5.8.0
- **构建工具**: Vite 5.4.19
- **包管理**: pnpm
- **UI框架**: Element Plus 2.10.2
- **3D引擎**: Three.js 0.177.0
- **状态管理**: Pinia 3.0.3
- **路由**: Vue Router 4.5.1
- **数据处理**: Papa Parse 5.5.3 (CSV解析)
- **工具库**: UUID 11.1.0
- **开发工具**: Vue DevTools 7.7.7

## 📁 项目结构

```
├── public/              # 静态资源
│   └── favicon.ico     # 网站图标
├── src/
│   ├── components/      # 组件
│   │   ├── Lottery3D.vue      # 3D抽奖组件
│   │   ├── ParticipantImport.vue  # 参与者导入组件
│   │   ├── PrizeImport.vue    # 奖品导入组件
│   │   ├── SettingsDialog.vue # 设置对话框
│   │   ├── ResultsDialog.vue  # 结果查看对话框
│   │   └── icons/             # 图标组件
│   ├── stores/          # 状态管理
│   │   ├── lottery.ts   # 抽奖相关状态
│   │   └── counter.ts   # 计数器状态
│   ├── types/           # 类型定义
│   │   └── lottery.ts   # 抽奖相关类型
│   ├── utils/           # 工具函数
│   │   ├── storage.ts   # 本地存储
│   │   └── csv.ts       # CSV处理
│   ├── views/           # 页面
│   │   ├── HomeView.vue # 主页
│   │   └── AboutView.vue # 关于页面
│   ├── router/          # 路由配置
│   │   └── index.ts     # 路由定义
│   ├── assets/          # 静态资源
│   │   ├── base.css     # 基础样式
│   │   ├── main.css     # 主样式
│   │   └── logo.svg     # Logo
│   └── main.ts          # 应用入口
├── tsconfig.json        # TypeScript 根配置
├── tsconfig.app.json    # 应用 TypeScript 配置
├── tsconfig.node.json   # Node.js TypeScript 配置
├── vite.config.ts       # Vite 配置
├── vercel.json          # Vercel 部署配置
├── package.json         # 项目依赖和脚本
├── pnpm-lock.yaml       # 依赖锁定文件
├── DEPLOYMENT.md        # 部署指南
└── README.md            # 项目说明
```

## 🎨 功能特色

### 3D抽奖动画
- 炫酷的3D球体动画效果
- 粒子背景增强视觉效果
- 平滑的相机运动和转场
- 高亮显示和庆祝动画

### 数据管理
- 自动本地存储，永不丢失数据
- 支持数据导出和导入（JSON 格式）
- 完整的撤销重抽功能
- 实时统计和进度显示
- 支持批量操作和数据备份

### 用户体验
- 响应式设计，适配各种设备
- 直观的操作界面
- 详细的操作提示和帮助
- 完善的错误处理机制

## 🔧 自定义配置

### 修改抽奖动画
在 `components/Lottery3D.vue` 中可以调整：
- 动画持续时间
- 3D效果参数
- 粒子数量和样式
- 相机运动轨迹

### 修改UI样式
在各组件的 `<style>` 部分可以调整：
- 颜色主题
- 布局样式
- 动画效果
- 响应式断点

### 自定义配置文件
- `vite.config.ts`: Vite 构建配置
- `tsconfig.json`: TypeScript 编译配置
- `vercel.json`: Vercel 部署配置

## 🧪 开发指南

### 开发环境设置

1. 克隆项目
```bash
git clone <repository-url>
cd koa-lottery
```

2. 安装依赖
```bash
pnpm install
```

3. 启动开发服务器
```bash
pnpm dev
```

### 代码规范

- 使用 TypeScript 进行类型检查
- 使用 Vue 3 Composition API
- 遵循 Vue 官方风格指南
- 保持代码简洁和可维护性

### 构建优化

- Vite 提供快速的热重载
- TypeScript 严格模式确保代码质量
- 生产构建自动压缩和优化
- 支持 Tree-shaking 减少包体积

## � 部署

本项目支持一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/koa-lottery)

### 自动部署

项目已配置 GitHub Actions，推送到主分支时自动部署：
- 详细部署配置请参考：[DEPLOYMENT.md](./DEPLOYMENT.md)

### 手动部署

```bash
# 构建项目
pnpm build

# 部署到 Vercel
vercel --prod
```

## �📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请提交 Issue 或联系开发团队。
