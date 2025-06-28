# Vercel 部署配置指南

这个项目已经配置了 GitHub Actions 自动部署到 Vercel。

## 设置步骤

### 1. 在 Vercel 中创建项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 项目设置：
   - Framework Preset: Vite
   - Build Command: `pnpm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

### 2. 获取 Vercel 项目信息

在项目设置页面找到以下信息：
- Project ID (在 Settings > General 中)
- Organization ID (在你的账户设置中)

### 3. 创建 Vercel Token

1. 访问 [Vercel Tokens](https://vercel.com/account/tokens)
2. 创建一个新的 token
3. 保存这个 token

### 4. 在 GitHub 仓库中设置 Secrets

在你的 GitHub 仓库中，进入 Settings > Secrets and variables > Actions，添加以下 secrets：

- `VERCEL_TOKEN`: 你在步骤 3 中创建的 token
- `VERCEL_ORG_ID`: 你的 Vercel Organization ID
- `VERCEL_PROJECT_ID`: 你的 Vercel Project ID

## 自动部署

配置完成后，GitHub Actions 将会：

- **Pull Request**: 创建预览部署
- **Push to main/master**: 创建生产部署

## 本地开发

```bash
# 安装依赖
pnpm install

# 开发服务器
pnpm run dev

# 构建项目
pnpm run build

# 预览构建结果
pnpm run preview
```

## 手动部署到 Vercel

如果需要手动部署：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```
