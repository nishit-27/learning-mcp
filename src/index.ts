import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";


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
server.tool("get-real-time","we will use this tool to get real time. whenever if there is any need to get information about real time and date we will use this tool. this tool will be help full in getting today's date and time. this will become help full to calculate other time", { }, async () => {
  const response = getUserTime()
  return({content: [{ type: "text", text: String(response) }]}) 
});
server.tool("add_reminder",`AppleScript expects very specific date formats, like:
"Sunday, April 27, 2025 at 10:00:00 AM" or "4/27/2025 10:00 AM"
AppleScript is very sensitive with dates!. so make sure you are using right format so our internal appleScript doen't break. use one of the above formate only for due_date.`,
  
  {title: z.string(),notes: z.string().optional(), due_date: z.string().optional()},

async ({ title,notes,due_date }) => {
  const input = {
    title,
    notes,
    due_date // Optional ISO 8601 format
  }
  const response = await addReminder(input)
  return ({content: [{ type: "text", text: String(response.message) }]
 
})})

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);

console.log("server started")





import { execSync } from "child_process";

interface AddReminderInput {
  title: string;
  notes?: string;
  due_date?: string; // Optional ISO 8601 format
}

interface AddReminderOutput {
  message: string;
}



export async function addReminder(input: AddReminderInput): Promise<AddReminderOutput> {
  const title = input.title.replace(/"/g, '\\"');
  const notes = input.notes ? input.notes.replace(/"/g, '\\"') : "";

  let properties = `name: "${title}"`;
  if (notes) {
    properties += `, body: "${notes}"`;
  }

  let dueDateScript = "";

  if (input.due_date) {
    const date = new Date(input.due_date);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const monthNames = ["January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"];
      const monthName = monthNames[date.getMonth()];
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      dueDateScript = `
        set dueDate to current date
        set year of dueDate to ${year}
        set month of dueDate to ${monthName}
        set day of dueDate to ${day}
        set hours of dueDate to ${hours}
        set minutes of dueDate to ${minutes}
        set seconds of dueDate to ${seconds}
        set due date of newReminder to dueDate
      `;
    }
  }

  const script = `
    tell application "Reminders"
      set newReminder to make new reminder in list "Reminders" with properties {${properties}}
      ${dueDateScript}
    end tell
  `;

  try {
    execSync(`osascript -e '${script}'`);
    return { message: "Reminder added successfully." };
  } catch (error) {
    console.error(error);
    return { message: "Failed to add reminder." };
  }
}

function getUserTime() {
  const userDate = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZoneName: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };

  const formattedTime = userDate.toLocaleString(undefined, options);
  return formattedTime;
}

