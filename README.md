# Habitica MCP Server

这是一个 Model Context Protocol (MCP) 服务器，让 AI 助手能够与 Habitica API 无缝交互，帮助您管理任务、追踪习惯、养成宠物，享受游戏化的生产力提升。

## ✨ 功能特性

### 🎮 核心游戏化功能
- 📋 **智能任务管理**: 创建、查看、更新和删除各类任务
- 🎯 **习惯追踪**: 记录习惯完成情况，培养良好生活方式
- 🐾 **宠物养成**: 孵化、喂养宠物，享受成长乐趣
- 🏇 **坐骑收集**: 管理和装备各种坐骑
- 🛍️ **商店购买**: 浏览和购买游戏内物品
- ⚡ **技能系统**: 施放角色技能，增强游戏体验

### 📊 数据管理功能
- 👤 **用户档案**: 获取详细的用户信息和统计数据
- 🏷️ **标签管理**: 创建和管理任务标签，更好地组织任务
- 📬 **通知中心**: 查看和管理系统通知
- 📦 **物品清单**: 查看拥有的所有物品和装备

### 🤖 AI 集成特色
- 🧠 **智能对话**: 通过自然语言与 AI 助手交互
- 📝 **任务建议**: AI 可以根据您的需求智能创建任务
- 📈 **进度跟踪**: 自动跟踪和报告您的进展情况
- 🎨 **个性化体验**: 根据您的习惯提供定制化建议

## 🚀 快速开始

### 前置要求
- Node.js 18+ 
- npm 或 yarn
- 有效的 Habitica 账户

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd habictica
```

2. **安装依赖**
```bash
npm install
```

3. **配置 API 凭据** (见下方配置章节)

4. **启动服务器**
```bash
npm start
```

## ⚙️ 配置

### 获取 Habitica API 凭据

1. 登录 [Habitica](https://habitica.com)
2. 点击右上角头像 → **Settings**
3. 选择 **API** 选项卡
4. 复制 **User ID** 和 **API Token**

### 设置环境变量

**方法一：使用环境变量**
```bash
export HABITICA_USER_ID="your-user-id-here"
export HABITICA_API_TOKEN="your-api-token-here"
```

**方法二：创建 .env 文件**
```bash
# 在项目根目录创建 .env 文件
HABITICA_USER_ID=your-user-id-here
HABITICA_API_TOKEN=your-api-token-here
```


> ⚠️ **安全提醒**: 请勿将 API 凭据提交到版本控制系统中

## 🎯 使用方法

### 启动服务器
```bash
# 生产环境
npm start

# 开发环境 (支持热重载)
npm run dev
```

### 与 MCP 客户端集成

这个服务器遵循 Model Context Protocol (MCP) 标准，可以与各种支持 MCP 的 AI 客户端集成使用。

#### Claude Desktop 配置

**配置文件位置**：
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

**配置内容**：
```json
{
  "mcpServers": {
    "habitica-mcp-server": {
      "command": "node",
      "args": ["/path/to/habitica-mcp-server/index.js"],
      "env": {
        "HABITICA_USER_ID": "your-habitica-user-id",
        "HABITICA_API_TOKEN": "your-habitica-api-token"
      }
    }
  }
}
```

**使用 NPM 包配置 (推荐)**：
```json
{
  "mcpServers": {
    "habitica-mcp-server": {
      "command": "npx",
      "args": ["-y", "habitica-mcp-server"],
      "env": {
        "HABITICA_USER_ID": "your-habitica-user-id",
        "HABITICA_API_TOKEN": "your-habitica-api-token"
      }
    }
  }
}
```

#### 其他 MCP 客户端配置

##### 使用 MCP 客户端 SDK
```javascript
// Node.js 示例
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['/path/to/habitica-mcp-server/index.js'],
  env: {
    HABITICA_USER_ID: 'your-habitica-user-id',
    HABITICA_API_TOKEN: 'your-habitica-api-token'
  }
});

const client = new Client({
  name: 'habitica-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

await client.connect(transport);
```

##### Python 客户端配置
```python
# Python 示例 (使用 mcp 包)
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    server_params = StdioServerParameters(
        command="node",
        args=["/path/to/habitica-mcp-server/index.js"],
        env={
            "HABITICA_USER_ID": "your-habitica-user-id",
            "HABITICA_API_TOKEN": "your-habitica-api-token"
        }
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # 获取可用工具
            result = await session.list_tools()
            print(f"Available tools: {result.tools}")

asyncio.run(main())
```

##### 自定义客户端集成
如果您使用自定义的 MCP 客户端，可以通过以下方式启动服务器：

```bash
# 直接启动服务器进程
HABITICA_USER_ID="your-user-id" HABITICA_API_TOKEN="your-token" node index.js

# 或使用配置文件
node index.js --config config.json
```

#### VS Code 扩展配置
如果您使用支持 MCP 的 VS Code 扩展：

```json
// settings.json
{
  "mcp.servers": {
    "habitica-mcp-server": {
      "command": "node",
      "args": ["/path/to/habitica-mcp-server/index.js"],
      "env": {
        "HABITICA_USER_ID": "your-habitica-user-id",
        "HABITICA_API_TOKEN": "your-habitica-api-token"
      }
    }
  }
}
```

#### Docker 容器配置
```yaml
# docker-compose.yml
version: '3.8'
services:
  habitica-mcp-server:
    build: .
    environment:
      - HABITICA_USER_ID=your-habitica-user-id
      - HABITICA_API_TOKEN=your-habitica-api-token
    ports:
      - "3000:3000"
    volumes:
      - ./config:/app/config
```

#### 配置验证
配置完成后，您可以通过以下方式验证连接：

1. **检查服务器状态**：
```bash
curl http://localhost:3000/health
```

2. **测试 MCP 连接**：
大多数 MCP 客户端会在连接时自动验证服务器能力。查看客户端日志确认连接成功。

3. **验证工具列表**：
连接成功后，应该能看到 22 个可用的 Habitica 相关工具。

配置完成后，重启您的 MCP 客户端即可开始使用！

### 示例对话
```
用户: "帮我创建一个学习 Python 的习惯"
AI: "好的，我来为您创建一个学习 Python 的习惯任务..."

用户: "查看我今天的任务"
AI: "让我为您查看今天的任务列表..."

用户: "我完成了锻炼，帮我记录一下"
AI: "恭喜！我来为您记录锻炼完成情况..."
```

## 可用工具

### 用户相关
- `get_user_profile`: 获取用户档案信息
- `get_stats`: 获取用户统计信息
- `get_inventory`: 获取物品清单

### 任务管理
- `get_tasks`: 获取任务列表（可指定类型：habits, dailys, todos, rewards）
- `create_task`: 创建新任务
- `update_task`: 更新任务
- `delete_task`: 删除任务
- `score_task`: 完成任务或记录习惯

### 标签管理
- `get_tags`: 获取标签列表
- `create_tag`: 创建新标签

### 宠物和坐骑
- `get_pets`: 获取宠物列表
- `feed_pet`: 喂养宠物
- `hatch_pet`: 孵化宠物
- `get_mounts`: 获取坐骑列表
- `equip_item`: 装备宠物、坐骑或装备

### 商店和购买
- `get_shop`: 获取商店物品列表
- `buy_item`: 购买商店物品
- `buy_reward`: 购买奖励

### 通知管理
- `get_notifications`: 获取通知列表
- `read_notification`: 标记通知为已读

### 技能系统
- `cast_spell`: 施放技能

## 📖 API 使用示例

### 创建任务
```json
{
  "type": "todo",
  "text": "完成项目文档",
  "notes": "包括API文档和用户指南",
  "difficulty": 1.5,
  "priority": 2
}
```

### 完成任务
```json
{
  "taskId": "task-id-here",
  "direction": "up"
}
```

### 获取特定类型的任务
```json
{
  "type": "todos"
}
```

### 宠物管理
```json
{
  "pet": "Wolf-Base",
  "food": "Meat"
}
```

### 购买物品
```json
{
  "itemKey": "armor_warrior_1",
  "quantity": 1
}
```

## 任务类型

- `habit`: 习惯（可以正向或负向记录）
- `daily`: 日常任务（每天重置）
- `todo`: 待办事项（一次性任务）
- `reward`: 奖励（可以用金币购买）

## 难度等级

- `0.1`: 简单
- `1`: 中等
- `1.5`: 困难
- `2`: 极难

## 优先级

- `0.1`: 低
- `1`: 中
- `1.5`: 高
- `2`: 极高

## 🔧 故障排除

### 常见问题

**问题**: 服务器启动失败
```
解决方案: 
1. 检查 Node.js 版本是否为 18+
2. 确认已正确设置环境变量
3. 验证 API 凭据是否有效
```

**问题**: API 调用失败
```
解决方案:
1. 检查网络连接
2. 验证 Habitica API 凭据
3. 确认 API 限制是否达到上限
```

**问题**: 找不到任务或宠物
```
解决方案:
1. 确认任务 ID 正确
2. 检查任务是否存在于 Habitica 中
3. 验证用户权限
```

### 调试模式
```bash
# 启用详细日志
DEBUG=* npm start
```

### 获取帮助
- 📚 查看 [Habitica API 文档](https://habitica.com/apidoc/)
- 🐛 提交 [Issues](https://github.com/your-repo/issues)
- 💬 加入讨论 [Discussions](https://github.com/your-repo/discussions)

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 如何贡献
1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发指南
- 遵循现有代码风格
- 添加适当的测试
- 更新相关文档
- 确保所有测试通过

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🌟 致谢

- 感谢 [Habitica](https://habitica.com) 提供优秀的 API
- 感谢 [Anthropic](https://anthropic.com) 的 MCP 协议
- 感谢所有贡献者和用户的支持

---

<div align="center">
  <b>让 AI 成为您的 Habitica 任务管理助手！</b>
</div> 