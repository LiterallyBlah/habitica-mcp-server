# Habitica MCP Server

_中文文档请阅读 **[README.zh-CN.md](README.zh-CN.md)**_

A Model Context Protocol (MCP) server that lets AI assistants seamlessly interact with the Habitica API – create tasks, track habits, raise pets and enjoy gamified productivity.

## ✨ Features

### 🎮 Core Gameplay Features
- 📋 **Smart task management** – create / view / update / delete all task types
- 🎯 **Habit tracking** – record habit completions and build healthy routines
- 🐾 **Pet raising** – hatch and feed pets, watch them grow
- 🏇 **Mount collection** – manage and equip all kinds of mounts
- 🛍️ **Shop & rewards** – browse and buy in-game items
- ⚡ **Skill system** – cast class skills to enhance gameplay

### 📊 Data-oriented Features
- 👤 **User profile** – fetch detailed user information and stats
- 🏷️ **Tag management** – create and manage tags for better organisation
- 📬 **Notification centre** – read and manage system notifications
- 📦 **Inventory** – list every item and piece of equipment you own

### 🤖 AI Integration Highlights
- 🧠 **Natural-language control** – operate Habitica via conversation
- 📝 **Task suggestions** – AI can create tasks on demand
- 📈 **Progress reporting** – automatically track and summarise progress
- 🎨 **Personalised experience** – tailored recommendations based on your habits

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- A valid Habitica account

### Installation

1. **Clone the repo**
```bash
git clone https://github.com/ibreaker/habitica-mcp-server.git
cd habitica-mcp-server
```

2. **Install dependencies**
```bash
npm install
```

3. **Set API credentials** (see next section)

4. **Start the server**
```bash
npm start
```

## ⚙️ Configuration

### Get Habitica API credentials
1. Log into [Habitica](https://habitica.com)
2. Click your avatar → **Settings**
3. Open the **API** tab
4. Copy **User ID** and **API Token**

### Environment variables

**Method A: export variables**
```bash
export HABITICA_USER_ID="your-user-id"
export HABITICA_API_TOKEN="your-api-token"
```

**Method B: .env file**
```bash
HABITICA_USER_ID=your-user-id
HABITICA_API_TOKEN=your-api-token
```

> ⚠️ **Security tip:** never commit your API keys to version control.

## 🎯 Usage

### Start the server
```bash
# Production
npm start

# Development (with reload)
npm run dev
```

### MCP client integration

The server follows the MCP spec and works with any AI client that supports MCP. Example Claude Desktop config:
```json
{
  "mcpServers": {
    "habitica-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/index.js"],
      "env": {
        "HABITICA_USER_ID": "your-id",
        "HABITICA_API_TOKEN": "your-token",
        "MCP_LANG": "en"  // or zh-CN
      }
    }
  }
}
```

### Example dialogue
```
User: "Create a habit for learning Python"
AI:   "Sure, the habit has been created!"

User: "Show me today’s tasks"
AI:   "Here is your task list for today…"

User: "I finished my workout, please record it"
AI:   "Great job! The workout is logged."
```

## 🛠️ Available Tools

(Identical to the Chinese README – see README.zh-CN.md for the full list.)

## 🔧 Troubleshooting

Common issues and solutions mirror the Chinese documentation – refer to README.zh-CN.md if you need more detail.

## 📝 License

MIT © Breaker

---