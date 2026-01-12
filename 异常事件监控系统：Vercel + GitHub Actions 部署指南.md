# 异常事件监控系统：Vercel + GitHub Actions 部署指南

本指南将帮助您将系统部署上线。前端托管在 Vercel（免费），后端监控脚本运行在 GitHub Actions（免费）。

## 第一部分：准备工作

1.  **注册账号**：
    *   [GitHub](https://github.com/)
    *   [Vercel](https://vercel.com/) (使用 GitHub 账号登录)
    *   [Discord](https://discord.com/) (用于接收警报)
2.  **获取 Discord Webhook**：
    *   在 Discord 中创建一个新服务器或频道。
    *   点击频道设置图标 -> **Integrations** -> **Webhooks**。
    *   点击 **New Webhook**，复制 **Webhook URL**。保存好，稍后要用。

---

## 第二部分：代码推送

1.  **下载代码**：将我在 Manus 中为您生成的所有代码下载到本地。
2.  **推送到 GitHub**：
    *   在 GitHub 上创建一个新仓库（例如 `anomaly-monitor`）。
    *   在本地项目根目录执行：
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin https://github.com/YOUR_USERNAME/anomaly-monitor.git
        git push -u origin main
        ```

---

## 第三部分：部署后端 (GitHub Actions)

后端已经配置好了，只要您推送了代码，它就会自动注册定时任务。但您需要配置密钥才能发送警报。

1.  **配置密钥**：
    *   打开您的 GitHub 仓库页面。
    *   点击 **Settings** -> **Secrets and variables** -> **Actions**。
    *   点击 **New repository secret**。
    *   **Name**: `DISCORD_WEBHOOK_URL`
    *   **Value**: 粘贴您在第一步获取的 Discord Webhook URL。
    *   点击 **Add secret**。

2.  **验证运行**：
    *   点击仓库顶部的 **Actions** 标签页。
    *   您应该能看到一个名为 "Anomaly Monitor Cron" 的工作流。
    *   您可以点击左侧的 "Anomaly Monitor Cron"，然后点击右侧的 **Run workflow** 手动触发一次测试。
    *   如果一切正常，您的 Discord 频道应该会收到一条测试消息（如果有异常交易的话）。

---

## 第四部分：部署前端 (Vercel)

1.  **导入项目**：
    *   打开 [Vercel Dashboard](https://vercel.com/dashboard)。
    *   点击 **Add New...** -> **Project**。
    *   在 "Import Git Repository" 列表中找到您的 `anomaly-monitor` 仓库，点击 **Import**。

2.  **配置构建**：
    *   **Framework Preset**: Vercel 通常会自动识别为 `Vite`。如果没有，请手动选择。
    *   **Root Directory**: 点击 Edit，选择 `client` 目录（因为我们的前端代码在 client 文件夹下）。**这一步非常重要！**
    *   **Build Command**: `npm run build` (默认即可)。
    *   **Output Directory**: `dist` (默认即可)。

3.  **点击 Deploy**：
    *   等待约 1 分钟，Vercel 会自动构建并发布您的网站。
    *   部署完成后，您会获得一个类似 `https://anomaly-monitor-xyz.vercel.app` 的永久免费域名。

---

## 常见问题排查

*   **GitHub Actions 没运行？**
    *   定时任务（Cron）在 GitHub 上可能不会严格准时触发，有时会延迟几分钟，这是正常的。
    *   首次推送代码后，建议手动触发一次以激活工作流。
*   **Vercel 部署失败？**
    *   检查 Root Directory 是否设置正确（必须指向 `client` 目录）。
    *   检查 Build Logs 里的错误信息。
