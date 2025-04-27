import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import addReminder from "./utils/functions/addReminder.js";
import getUserTime from "./utils/functions/getUserTime.js";
import listReminders from "./utils/functions/listReminder.js";



// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

// Add an addition tool
server.tool("add",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);
server.tool("subtract",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a - b) }]
  })
);
server.tool("get-real-time", "we will use this tool to get real time. whenever if there is any need to get information about real time and date we will use this tool. this tool will be help full in getting today's date and time. this will become help full to calculate other time", {}, async () => {
  const response = getUserTime()
  return ({ content: [{ type: "text", text: String(response) }] })
});

server.tool("list_all_reminders", "we will use this tool to get all the available reminders from reminder app. this tool will give list of all the reminders with the all available metadata like title, notes, due_date, completed or not.", {}, async () => {
  const response = await listReminders()
  return ({ content: [{ type: "text", text: JSON.stringify(response.reminders) }] })
});

server.tool("add_reminder", `AppleScript expects very specific date formats, like:"4/27/2025 10:00 AM"
AppleScript is very sensitive with dates!. so make sure you are using right format so our internal appleScript doen't break. use one of the above formate only for due_date.`,

  { title: z.string(), notes: z.string().optional(), due_date: z.string().optional() },

  async ({ title, notes, due_date }) => {
    const input = {
      title,
      notes,
      due_date
    }
    const response = await addReminder(input)
    return ({
      content: [{ type: "text", text: String(response.message) }]

    })
  })

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);

