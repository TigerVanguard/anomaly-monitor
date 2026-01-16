# 异常事件监控系统 (Anomaly Monitor) - RRD 文档

**版本**: 1.0 (Current Implementation)  
**日期**: 2026-01-15  
**状态**: MVP (最小可行性产品)

---

## 1. 引言 (Introduction)

### 1.1 项目背景
本项目旨在构建一个针对预测市场 (Polymarket) 的实时异常交易监控系统。通过捕捉大额资金流动（"巨鲸"行为），为投资者提供早期的市场趋势信号。

### 1.2 文档目的
本文档详细描述了**截至目前已实现**的系统功能、架构设计及数据规范，作为后续开发迭代的基准。

---

## 2. 系统架构 (System Architecture)

### 2.1 技术栈 (Technology Stack)
*   **数据采集层 (Backend Script)**
    *   语言: Python 3
    *   核心库: `requests` (HTTP Client), `json`, `hashlib`
    *   运行模式: 独立脚本 (Standalone Script)
*   **前端展示层 (Frontend)**
    *   框架: React 19 + Vite
    *   语言: TypeScript
    *   样式: TailwindCSS v4 + `tw-animate-css`
    *   组件库: Radix UI (Headless UI), Lucide React (Icons)
    *   图表库: Recharts
*   **数据持久化与通信 (Data & Communication)**
    *   存储: 本地文件系统 (JSON Flat Files)
    *   主要数据文件: `client/public/data/alerts.json` (前端读取源)

### 2.2 数据流 (Data Flow)
1.  **Market Discovery**: Python 脚本通过 GraphQL API 获取当前交易量最大的 50 个市场。
2.  **Order Scanning**: 遍历这些市场的 CLOB (Central Limit Order Book) 订单簿 API。
3.  **Anomaly Detection**: 检测单笔金额 > $5,000 USD 的买单 (Bid) 或卖单 (Ask)。
4.  **Data Processing**:
    *   生成唯一订单指纹 (MD5 Hash) 进行去重。
    *   将新警报写入前端可访问的 JSON 文件。
5.  **Notification**: 触发 Discord Webhook 发送移动端/PC端通知。
6.  **Visualization**: 前端 React 应用读取 JSON 数据并渲染为可视化列表。

---

## 3. 功能需求详细 (Functional Requirements)

### 3.1 市场扫描模块
*   **FR-01 热门市场获取**:
    *   系统调用 Polymarket Gamma API (`/query`)。
    *   按 24小时交易量 (Volume 24hr) 降序排列。
    *   限制扫描前 **50** 个最活跃的市场。
*   **FR-02 订单簿深度检查**:
    *   针对每个市场的每个 Token (Outcome) 获取实时订单簿 (`/book`)。
    *   支持解析买单 (`bids`) 和卖单 (`asks`) 队列。

### 3.2 异常检测引擎
*   **FR-03 大额订单过滤**:
    *   **阈值规则**: 仅捕捉价值 (Value = Price * Size) 超过 **$5,000 USD** 的挂单。
    *   **计算逻辑**: 实时计算 `price * size` 确定订单总价值。
*   **FR-04 重复警报抑制 (Deduplication)**:
    *   系统为每个警报生成唯一 ID: `MD5(market_id + side + price + size)`。
    *   维护一个 `seen_orders.json` 记录，自动过滤 24 小时内已经播报过的相同订单。

### 3.3 警报与通知
*   **FR-05 本地数据推送**:
    *   将最新的警报数据写入 `client/public/data/alerts.json`。
    *   保留最新的 **50 条** 历史记录，旧数据自动轮替。
*   **FR-06 Discord 集成**:
    *   支持通过环境变量 `DISCORD_WEBHOOK_URL` 配置 Webhook。
    *   发送包含富文本 (Embeds) 的通知，包含：
        *   市场问题 (Question)
        *   预测结果 (Outcome)
        *   方向 (Buy/Sell) 与 金额 (Value)
        *   颜色编码 (红/绿) 区分买卖方向。
        *   外部链接: 直接跳转至 Polymarket 市场页、Twitter 搜索页、Google 搜索页。

---

## 4. 数据接口规范 (Data Specifications)

### 4.1 警报数据结构 (`alerts.json`)
前端消费的 JSON 数据遵循以下 Schema：

```json
{
  "id": "string",            // 唯一哈希 ID (MD5)
  "time": "string",          // 显示时间 (e.g., "14:30 UTC")
  "timestamp": "ISO8601",    // 完整时间戳
  "type": "string",          // 固定为 "WHALE ALERT"
  "message": "string",       // 人类可读的描述文本
  "severity": "string",      // "high" (>50k) 或 "medium"
  "market_question": "string", // 市场完整问题描述
  "market_slug": "string",   // 市场 URL Slug
  "value": "number",         // 订单总价值 (USD)
  "price": "number",         // 成交/挂单价格 (cents)
  "size": "number"           // 订单数量
}
```

---

## 5. 前端设计规范 (UI/UX Specification)

### 5.1 视觉风格 (Visual Identity)
*   **主题**: Cyberpunk Data Stream (赛博朋克数据流)。
*   **核心配色**:
    *   **Background**: 深灰/黑 (`#0a0a0a`)。
    *   **Primary/Accent**: 霓虹绿 (`#00ff41`) 代表正常/盈利。
    *   **Alert**: 警示红 (`#ff003c`) 代表异常/卖出。
    *   **Highlight**: 电光蓝 (`#00f3ff`) 用于高亮关键数据。
*   **排版**:
    *   数据/标题: `JetBrains Mono` (等宽字体，强调技术感)。
    *   正文: `Inter` 或系统默认无衬线字体。

---

## 6. 限制与已知问题 (Limitations)
1.  **实时性限制**: 目前系统依赖脚本单次运行更新 JSON，非 WebSocket 实时推送，且缺乏守护进程 (Daemon) 机制。
2.  **数据源单一**: 目前仅支持 Polymarket 数据，Twitter/X 舆情监控功能尚未集成（由于 API 成本限制）。
3.  **分析深度**: 此版本主要基于金额阈值触发，尚未包含钱包地址追踪或历史行为分析功能。

