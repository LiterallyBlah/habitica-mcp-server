#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { z } from "zod";
import { setLanguage, t } from "./i18n.js";

// Habitica API base configuration
const HABITICA_API_BASE = "https://habitica.com/api/v3";

// Validate environment variables
const HABITICA_USER_ID = process.env.HABITICA_USER_ID;
const HABITICA_API_TOKEN = process.env.HABITICA_API_TOKEN;

// Detect language (default EN)
setLanguage(process.env.MCP_LANG || process.env.LANG || "en");

// Tool configuration - set to false to disable tools
const TOOL_CONFIG = {
  get_user_profile: false,
  get_tasks: true,
  create_task: true,
  score_task: true,
  update_task: true,
  delete_task: true,
  get_stats: false,
  buy_reward: false,
  get_inventory: false,
  cast_spell: false,
  get_tags: true,
  create_tag: true,
  get_pets: false,
  feed_pet: false,
  hatch_pet: false,
  get_mounts: false,
  equip_item: false,
  get_notifications: false,
  read_notification: false,
  get_shop: false,
  buy_item: false,
  add_checklist_item: true,
  update_checklist_item: true,
  delete_checklist_item: true,
  get_task_checklist: true,
  score_checklist_item: true,
};

if (!HABITICA_USER_ID || !HABITICA_API_TOKEN) {
  console.error(
    t(
      "Error: Please set HABITICA_USER_ID and HABITICA_API_TOKEN environment variables",
      "Error: Please set HABITICA_USER_ID and HABITICA_API_TOKEN environment variables"
    )
  );
  process.exit(1);
}

// Create Habitica API client
const habiticaClient = axios.create({
  baseURL: HABITICA_API_BASE,
  headers: {
    "x-api-user": HABITICA_USER_ID,
    "x-api-key": HABITICA_API_TOKEN,
    "x-client": HABITICA_USER_ID + "habitica-mcp-server",
    "Content-Type": "application/json",
  },
});

// Create MCP server
const server = new Server(
  {
    name: "habitica-mcp-server",
    version: "0.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const allTools = [
  {
    name: "get_user_profile",
    description: t(
      "Retrieve complete user profile information including stats, preferences, and account details from Habitica",
      "Retrieve complete user profile information including stats, preferences, and account details from Habitica"
    ),
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_tasks",
    description: t(
      "Fetch user's tasks from Habitica. Optionally filter by task type (habits, dailys, todos, rewards). Returns all tasks if no type specified",
      "Fetch user's tasks from Habitica. Optionally filter by task type (habits, dailys, todos, rewards). Returns all tasks if no type specified"
    ),
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["habits", "dailys", "todos", "rewards"],
          description: t(
            "Filter tasks by type: 'habits' for repeated behaviors, 'dailys' for daily recurring tasks, 'todos' for one-time tasks, 'rewards' for custom rewards",
            "Filter tasks by type: 'habits' for repeated behaviors, 'dailys' for daily recurring tasks, 'todos' for one-time tasks, 'rewards' for custom rewards"
          ),
        },
      },
    },
  },
  {
    name: "create_task",
    description: t(
      "Create a new task in Habitica. Supports all task types: habits (positive/negative behaviors), dailies (recurring tasks), todos (one-time tasks), and rewards (custom purchases)",
      "Create a new task in Habitica. Supports all task types: habits (positive/negative behaviors), dailies (recurring tasks), todos (one-time tasks), and rewards (custom purchases)"
    ),
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["habit", "daily", "todo", "reward"],
          description: t(
            "Task type: 'habit' for behaviors to track, 'daily' for recurring tasks, 'todo' for one-time tasks, 'reward' for custom rewards to purchase",
            "Task type: 'habit' for behaviors to track, 'daily' for recurring tasks, 'todo' for one-time tasks, 'reward' for custom rewards to purchase"
          ),
        },
        text: {
          type: "string",
          description: t(
            "The main title/name of the task that will be displayed",
            "The main title/name of the task that will be displayed"
          ),
        },
        notes: {
          type: "string",
          description: t(
            "Optional detailed description or notes about the task",
            "Optional detailed description or notes about the task"
          ),
        },
        difficulty: {
          type: "number",
          enum: [0.1, 1, 1.5, 2],
          description: t(
            "Task difficulty affecting rewards: 0.1=trivial (easy), 1=easy (default), 1.5=medium, 2=hard (more rewards)",
            "Task difficulty affecting rewards: 0.1=trivial (easy), 1=easy (default), 1.5=medium, 2=hard (more rewards)"
          ),
        },
        priority: {
          type: "number",
          enum: [0.1, 1, 1.5, 2],
          description: t(
            "Task priority affecting damage when missed: 0.1=low, 1=medium (default), 1.5=high, 2=critical (more damage if not completed)",
            "Task priority affecting damage when missed: 0.1=low, 1=medium (default), 1.5=high, 2=critical (more damage if not completed)"
          ),
        },
        checklist: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: t(
                  "Text content of the checklist item",
                  "Text content of the checklist item"
                ),
              },
              completed: {
                type: "boolean",
                description: t(
                  "Whether this checklist item starts as completed (default: false)",
                  "Whether this checklist item starts as completed (default: false)"
                ),
                default: false,
              },
            },
            required: ["text"],
          },
          description: t(
            "Optional array of sub-tasks/checklist items to add to this task",
            "Optional array of sub-tasks/checklist items to add to this task"
          ),
        },
      },
      required: ["type", "text"],
    },
  },
  {
    name: "score_task",
    description: t(
      "Mark a task as completed or score a habit. For todos/dailies, this marks completion and grants rewards. For habits, specify direction for positive/negative scoring",
      "Mark a task as completed or score a habit. For todos/dailies, this marks completion and grants rewards. For habits, specify direction for positive/negative scoring"
    ),
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: t(
            "Unique identifier of the task to score (obtained from get_tasks)",
            "Unique identifier of the task to score (obtained from get_tasks)"
          ),
        },
        direction: {
          type: "string",
          enum: ["up", "down"],
          description: t(
            "Scoring direction for habits: 'up' for positive behavior (rewards), 'down' for negative behavior (penalties). Not needed for todos/dailies",
            "Scoring direction for habits: 'up' for positive behavior (rewards), 'down' for negative behavior (penalties). Not needed for todos/dailies"
          ),
        },
      },
      required: ["taskId"],
    },
  },
  {
    name: "update_task",
    description: t(
      "Modify an existing task's properties such as title, notes, or completion status. Only provide the fields you want to change",
      "Modify an existing task's properties such as title, notes, or completion status. Only provide the fields you want to change"
    ),
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: t(
            "Unique identifier of the task to update (obtained from get_tasks)",
            "Unique identifier of the task to update (obtained from get_tasks)"
          ),
        },
        text: {
          type: "string",
          description: t(
            "New title/name for the task",
            "New title/name for the task"
          ),
        },
        notes: {
          type: "string",
          description: t(
            "New description or notes for the task",
            "New description or notes for the task"
          ),
        },
        completed: {
          type: "boolean",
          description: t(
            "Set completion status for todos (true=completed, false=incomplete)",
            "Set completion status for todos (true=completed, false=incomplete)"
          ),
        },
      },
      required: ["taskId"],
    },
  },
  {
    name: "delete_task",
    description: t(
      "Permanently remove a task from Habitica. This action cannot be undone",
      "Permanently remove a task from Habitica. This action cannot be undone"
    ),
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: t(
            "Unique identifier of the task to delete (obtained from get_tasks)",
            "Unique identifier of the task to delete (obtained from get_tasks)"
          ),
        },
      },
      required: ["taskId"],
    },
  },
  {
    name: "get_stats",
    description: t(
      "Retrieve user's character statistics including health, experience, mana, gold, level, and class information",
      "Retrieve user's character statistics including health, experience, mana, gold, level, and class information"
    ),
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "buy_reward",
    description: t(
      "Purchase a custom reward using gold. This will deduct the reward's cost from your gold balance",
      "Purchase a custom reward using gold. This will deduct the reward's cost from your gold balance"
    ),
    inputSchema: {
      type: "object",
      properties: {
        key: {
          type: "string",
          description: t(
            "The unique identifier or key of the reward to purchase (obtained from get_tasks with type 'rewards')",
            "The unique identifier or key of the reward to purchase (obtained from get_tasks with type 'rewards')"
          ),
        },
      },
      required: ["key"],
    },
  },
  {
    name: "get_inventory",
    description: t(
      "Retrieve user's complete inventory including items, equipment, pets, mounts, food, eggs, hatching potions, and quest items",
      "Retrieve user's complete inventory including items, equipment, pets, mounts, food, eggs, hatching potions, and quest items"
    ),
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "cast_spell",
    description: t(
      "Use a class-specific spell or skill. Requires sufficient mana and appropriate class. Optionally target another user or specific entity",
      "Use a class-specific spell or skill. Requires sufficient mana and appropriate class. Optionally target another user or specific entity"
    ),
    inputSchema: {
      type: "object",
      properties: {
        spellId: {
          type: "string",
          description: t(
            "The unique identifier of the spell to cast (varies by class: mage, warrior, healer, rogue)",
            "The unique identifier of the spell to cast (varies by class: mage, warrior, healer, rogue)"
          ),
        },
        targetId: {
          type: "string",
          description: t(
            "Optional target user ID for spells that affect other players (party members, etc.)",
            "Optional target user ID for spells that affect other players (party members, etc.)"
          ),
        },
      },
      required: ["spellId"],
    },
  },
  {
    name: "get_tags",
    description: t(
      "Retrieve all user-created tags for organizing and categorizing tasks. Tags can be applied to any task type",
      "Retrieve all user-created tags for organizing and categorizing tasks. Tags can be applied to any task type"
    ),
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "create_tag",
    description: t(
      "Create a new tag for organizing tasks. Tags help categorize and filter tasks by context, project, or any custom criteria",
      "Create a new tag for organizing tasks. Tags help categorize and filter tasks by context, project, or any custom criteria"
    ),
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: t(
            "Name of the new tag (e.g., 'Work', 'Health', 'Personal Project')",
            "Name of the new tag (e.g., 'Work', 'Health', 'Personal Project')"
          ),
        },
      },
      required: ["name"],
    },
  },
  {
    name: "get_pets",
    description:
      "Retrieve all pets owned by the user, including their current state and feed status. Pets are obtained by hatching eggs with potions",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "feed_pet",
    description:
      "Feed food to a pet to increase its growth or transform it into a mount. Different foods have different effects on pets",
    inputSchema: {
      type: "object",
      properties: {
        pet: {
          type: "string",
          description:
            "The key identifier of the pet to feed (e.g., 'Wolf-Base', 'Dragon-Red')",
        },
        food: {
          type: "string",
          description:
            "The key identifier of the food item to use (e.g., 'Meat', 'Milk', 'Potatoe')",
        },
      },
      required: ["pet", "food"],
    },
  },
  {
    name: "hatch_pet",
    description:
      "Hatch a new pet by combining an egg with a hatching potion. This consumes both items and creates a new pet",
    inputSchema: {
      type: "object",
      properties: {
        egg: {
          type: "string",
          description:
            "The key identifier of the egg to hatch (e.g., 'Wolf', 'Dragon', 'Cactus')",
        },
        hatchingPotion: {
          type: "string",
          description:
            "The key identifier of the hatching potion to use (e.g., 'Base', 'Red', 'Blue')",
        },
      },
      required: ["egg", "hatchingPotion"],
    },
  },
  {
    name: "get_mounts",
    description:
      "Retrieve all mounts owned by the user. Mounts are obtained by feeding pets until they transform",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "equip_item",
    description:
      "Equip or unequip items such as armor, pets, mounts, or costume pieces to change your character's appearance and stats",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["mount", "pet", "costume", "equipped"],
          description:
            "Category of equipment: 'mount' for riding, 'pet' for companion, 'costume' for cosmetic items, 'equipped' for stat-affecting gear",
        },
        key: {
          type: "string",
          description:
            "The unique identifier of the item to equip or 'null' to unequip the current item in that slot",
        },
      },
      required: ["type", "key"],
    },
  },
  {
    name: "get_notifications",
    description:
      "Retrieve all pending notifications including party invites, quest updates, achievement notifications, and system messages",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "read_notification",
    description:
      "Mark a specific notification as read to remove it from the notifications list",
    inputSchema: {
      type: "object",
      properties: {
        notificationId: {
          type: "string",
          description:
            "Unique identifier of the notification to mark as read (obtained from get_notifications)",
        },
      },
      required: ["notificationId"],
    },
  },
  {
    name: "get_shop",
    description:
      "Browse available items in various Habitica shops including seasonal items, quest scrolls, and special equipment",
    inputSchema: {
      type: "object",
      properties: {
        shopType: {
          type: "string",
          enum: ["market", "questShop", "timeTravelersShop", "seasonalShop"],
          description:
            "Shop category: 'market' for basic items, 'questShop' for quest scrolls, 'timeTravelersShop' for past event items, 'seasonalShop' for current event items",
        },
      },
    },
  },
  {
    name: "buy_item",
    description:
      "Purchase items from shops using gold or gems. Check shop availability first with get_shop",
    inputSchema: {
      type: "object",
      properties: {
        itemKey: {
          type: "string",
          description:
            "Unique identifier of the item to purchase (obtained from get_shop)",
        },
        quantity: {
          type: "number",
          description:
            "Number of items to purchase (default: 1). Some items have purchase limits",
          default: 1,
        },
      },
      required: ["itemKey"],
    },
  },
  {
    name: "add_checklist_item",
    description: t(
      "Add a new checklist item (sub-task) to an existing task. Useful for breaking down complex tasks into smaller steps",
      "Add a new checklist item (sub-task) to an existing task. Useful for breaking down complex tasks into smaller steps"
    ),
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: t(
            "Unique identifier of the parent task to add the checklist item to (obtained from get_tasks)",
            "Unique identifier of the parent task to add the checklist item to (obtained from get_tasks)"
          ),
        },
        text: {
          type: "string",
          description: t(
            "Description of the checklist item/sub-task to add",
            "Description of the checklist item/sub-task to add"
          ),
        },
      },
      required: ["taskId", "text"],
    },
  },
  {
    name: "update_checklist_item",
    description: t(
      "Modify an existing checklist item's text or completion status. Only provide the fields you want to change",
      "Modify an existing checklist item's text or completion status. Only provide the fields you want to change"
    ),
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: t(
            "Unique identifier of the parent task containing the checklist item",
            "Unique identifier of the parent task containing the checklist item"
          ),
        },
        itemId: {
          type: "string",
          description: t(
            "Unique identifier of the checklist item to update (obtained from get_task_checklist)",
            "Unique identifier of the checklist item to update (obtained from get_task_checklist)"
          ),
        },
        text: {
          type: "string",
          description: t(
            "New text/description for the checklist item",
            "New text/description for the checklist item"
          ),
        },
        completed: {
          type: "boolean",
          description: t(
            "Set completion status: true to mark as completed, false to mark as incomplete",
            "Set completion status: true to mark as completed, false to mark as incomplete"
          ),
        },
      },
      required: ["taskId", "itemId"],
    },
  },
  {
    name: "delete_checklist_item",
    description: t(
      "Permanently remove a checklist item from a task. This action cannot be undone",
      "Permanently remove a checklist item from a task. This action cannot be undone"
    ),
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: t(
            "Unique identifier of the parent task containing the checklist item",
            "Unique identifier of the parent task containing the checklist item"
          ),
        },
        itemId: {
          type: "string",
          description: t(
            "Unique identifier of the checklist item to delete (obtained from get_task_checklist)",
            "Unique identifier of the checklist item to delete (obtained from get_task_checklist)"
          ),
        },
      },
      required: ["taskId", "itemId"],
    },
  },
  {
    name: "get_task_checklist",
    description: t(
      "Retrieve all checklist items for a specific task, showing their completion status and unique identifiers",
      "Retrieve all checklist items for a specific task, showing their completion status and unique identifiers"
    ),
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: t(
            "Unique identifier of the task whose checklist items to retrieve",
            "Unique identifier of the task whose checklist items to retrieve"
          ),
        },
      },
      required: ["taskId"],
    },
  },
  {
    name: "score_checklist_item",
    description: t(
      "Toggle completion status of a checklist item. If incomplete, marks as complete; if complete, marks as incomplete",
      "Toggle completion status of a checklist item. If incomplete, marks as complete; if complete, marks as incomplete"
    ),
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: t(
            "Unique identifier of the parent task containing the checklist item",
            "Unique identifier of the parent task containing the checklist item"
          ),
        },
        itemId: {
          type: "string",
          description: t(
            "Unique identifier of the checklist item to toggle (obtained from get_task_checklist)",
            "Unique identifier of the checklist item to toggle (obtained from get_task_checklist)"
          ),
        },
      },
      required: ["taskId", "itemId"],
    },
  },
];

// Helper function to get enabled tools
function getEnabledTools() {
  return allTools.filter((tool) => TOOL_CONFIG[tool.name] === true);
}

// Register tools list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: getEnabledTools(),
  };
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Check if tool is enabled
  if (!TOOL_CONFIG[name]) {
    throw new McpError(ErrorCode.MethodNotFound, `Tool '${name}' is disabled`);
  }

  try {
    switch (name) {
      case "get_user_profile":
        return await getUserProfile();

      case "get_tasks":
        return await getTasks(args.type);

      case "create_task":
        return await createTask(args);

      case "score_task":
        return await scoreTask(args.taskId, args.direction);

      case "update_task":
        return await updateTask(args.taskId, args);

      case "delete_task":
        return await deleteTask(args.taskId);

      case "get_stats":
        return await getStats();

      case "buy_reward":
        return await buyReward(args.key);

      case "get_inventory":
        return await getInventory();

      case "cast_spell":
        return await castSpell(args.spellId, args.targetId);

      case "get_tags":
        return await getTags();

      case "create_tag":
        return await createTag(args.name);

      case "get_pets":
        return await getPets();

      case "feed_pet":
        return await feedPet(args.pet, args.food);

      case "hatch_pet":
        return await hatchPet(args.egg, args.hatchingPotion);

      case "get_mounts":
        return await getMounts();

      case "equip_item":
        return await equipItem(args.type, args.key);

      case "get_notifications":
        return await getNotifications();

      case "read_notification":
        return await readNotification(args.notificationId);

      case "get_shop":
        return await getShop(args.shopType);

      case "buy_item":
        return await buyItem(args.itemKey, args.quantity);

      case "get_task_checklist":
        return await getTaskChecklist(args.taskId);

      case "add_checklist_item":
        return await addChecklistItem(args.taskId, args.text);

      case "update_checklist_item":
        return await updateChecklistItem(args.taskId, args.itemId, args);

      case "delete_checklist_item":
        return await deleteChecklistItem(args.taskId, args.itemId);

      case "score_checklist_item":
        return await scoreChecklistItem(args.taskId, args.itemId);

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    const errorMessage =
      error.response?.data?.message || error.message || "Unknown error";
    throw new McpError(
      ErrorCode.InternalError,
      `Habitica API error: ${errorMessage}`
    );
  }
});

// Tool implementation functions
async function getUserProfile() {
  const response = await habiticaClient.get("/user");
  const user = response.data.data;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(user, null, 2),
      },
    ],
  };
}

async function getTasks(type) {
  const endpoint = type ? `/tasks/user?type=${type}` : "/tasks/user";
  const response = await habiticaClient.get(endpoint);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function createTask(taskData) {
  const response = await habiticaClient.post("/tasks/user", taskData);
  const task = response.data.data;

  return {
    content: [
      {
        type: "text",
        text: `Successfully created task: ${task.text} (ID: ${task.id})`,
      },
    ],
  };
}

async function scoreTask(taskId, direction = "up") {
  const response = await habiticaClient.post(
    `/tasks/${taskId}/score/${direction}`
  );
  const result = response.data.data;

  let message = `Task completed! `;
  if (result.exp) message += `Gained ${result.exp} experience `;
  if (result.gp) message += `Gained ${result.gp} gold `;
  if (result.lvl) message += `Level up to ${result.lvl}! `;

  return {
    content: [
      {
        type: "text",
        text: message,
      },
    ],
  };
}

async function updateTask(taskId, updates) {
  const response = await habiticaClient.put(`/tasks/${taskId}`, updates);
  const task = response.data.data;

  return {
    content: [
      {
        type: "text",
        text: `Successfully updated task: ${task.text}`,
      },
    ],
  };
}

async function deleteTask(taskId) {
  await habiticaClient.delete(`/tasks/${taskId}`);

  return {
    content: [
      {
        type: "text",
        text: `Successfully deleted task (ID: ${taskId})`,
      },
    ],
  };
}

async function getStats() {
  const response = await habiticaClient.get("/user");

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data.data.stats, null, 2),
      },
    ],
  };
}

async function buyReward(key) {
  const response = await habiticaClient.post(`/user/buy/${key}`);
  const result = response.data.data;

  return {
    content: [
      {
        type: "text",
        text: `Successfully bought reward! Remaining gold: ${result.gp}`,
      },
    ],
  };
}

async function getInventory() {
  const response = await habiticaClient.get("/user");

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data.data.items, null, 2),
      },
    ],
  };
}

async function castSpell(spellId, targetId) {
  const endpoint = targetId
    ? `/user/class/cast/${spellId}?targetId=${targetId}`
    : `/user/class/cast/${spellId}`;
  const response = await habiticaClient.post(endpoint);

  return {
    content: [
      {
        type: "text",
        text: `Successfully cast spell: ${spellId}`,
      },
    ],
  };
}

async function getTags() {
  const response = await habiticaClient.get("/tags");

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function createTag(name) {
  const response = await habiticaClient.post("/tags", { name });
  const tag = response.data.data;

  return {
    content: [
      {
        type: "text",
        text: `Successfully created tag: ${tag.name} (ID: ${tag.id})`,
      },
    ],
  };
}

async function getPets() {
  const response = await habiticaClient.get("/user");

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data.data.items.pets, null, 2),
      },
    ],
  };
}

async function feedPet(pet, food) {
  const response = await habiticaClient.post(`/user/feed/${pet}/${food}`);
  const result = response.data.data;

  let message = `Successfully fed pet ${pet}! `;
  if (result.message) {
    message += result.message;
  }

  return {
    content: [
      {
        type: "text",
        text: message,
      },
    ],
  };
}

async function hatchPet(egg, hatchingPotion) {
  const response = await habiticaClient.post(
    `/user/hatch/${egg}/${hatchingPotion}`
  );
  const result = response.data.data;

  return {
    content: [
      {
        type: "text",
        text: `Successfully hatched pet! Got ${egg}-${hatchingPotion}`,
      },
    ],
  };
}

async function getMounts() {
  const response = await habiticaClient.get("/user");

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data.data.items.mounts, null, 2),
      },
    ],
  };
}

async function equipItem(type, key) {
  const response = await habiticaClient.post(`/user/equip/${type}/${key}`);

  return {
    content: [
      {
        type: "text",
        text: `Successfully equipped ${type}: ${key}`,
      },
    ],
  };
}

async function getNotifications() {
  const response = await habiticaClient.get("/notifications");

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function readNotification(notificationId) {
  await habiticaClient.post(`/notifications/${notificationId}/read`);

  return {
    content: [
      {
        type: "text",
        text: `Successfully marked notification as read (ID: ${notificationId})`,
      },
    ],
  };
}

async function getShop(shopType = "market") {
  const response = await habiticaClient.get(`/shops/${shopType}`);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function buyItem(itemKey, quantity = 1) {
  const response = await habiticaClient.post(`/user/buy/${itemKey}`, {
    quantity,
  });
  const result = response.data.data;

  return {
    content: [
      {
        type: "text",
        text: `Successfully bought ${itemKey} x${quantity}! Remaining gold: ${result.gp}`,
      },
    ],
  };
}

async function getTaskChecklist(taskId) {
  const response = await habiticaClient.get(`/tasks/${taskId}`);
  const task = response.data.data;
  const checklist = task.checklist || [];

  return {
    content: [
      {
        type: "text",
        text: t(
          `Task: ${task.text}\nChecklist items (${checklist.length}):`,
          `Task: ${task.text}\nChecklist items (${checklist.length}):`
        ),
      },
      {
        type: "text",
        text:
          checklist.length > 0
            ? checklist
                .map(
                  (item) =>
                    `${item.completed ? "✓" : "○"} ${item.text} (ID: ${
                      item.id
                    })`
                )
                .join("\n")
            : t("No checklist items found", "No checklist items found"),
      },
    ],
  };
}

async function addChecklistItem(taskId, text) {
  const response = await habiticaClient.post(`/tasks/${taskId}/checklist`, {
    text,
  });
  const item = response.data.data;

  return {
    content: [
      {
        type: "text",
        text: t(
          `Successfully added checklist item: ${item.text} (ID: ${item.id})`,
          `Successfully added checklist item: ${item.text} (ID: ${item.id})`
        ),
      },
    ],
  };
}

async function updateChecklistItem(taskId, itemId, updates) {
  const response = await habiticaClient.put(
    `/tasks/${taskId}/checklist/${itemId}`,
    updates
  );
  const item = response.data.data;

  return {
    content: [
      {
        type: "text",
        text: t(
          `Successfully updated checklist item: ${item.text}`,
          `Successfully updated checklist item: ${item.text}`
        ),
      },
    ],
  };
}

async function deleteChecklistItem(taskId, itemId) {
  await habiticaClient.delete(`/tasks/${taskId}/checklist/${itemId}`);

  return {
    content: [
      {
        type: "text",
        text: t(
          `Successfully deleted checklist item (ID: ${itemId})`,
          `Successfully deleted checklist item (ID: ${itemId})`
        ),
      },
    ],
  };
}

async function scoreChecklistItem(taskId, itemId) {
  const response = await habiticaClient.post(
    `/tasks/${taskId}/checklist/${itemId}/score`
  );
  const item = response.data.data;

  return {
    content: [
      {
        type: "text",
        text: t(
          `Successfully scored checklist item: ${item.text} (completed: ${item.completed})`,
          `Successfully scored checklist item: ${item.text} (completed: ${item.completed})`
        ),
      },
    ],
  };
}

// Start server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Habitica MCP server started");
}

runServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
