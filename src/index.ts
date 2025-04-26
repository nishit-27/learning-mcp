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
server.tool("add_reminder",
  
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
      const day = date.getDate();
      const month = date.getMonth() + 1; // JS: 0-11, AppleScript: 1-12
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();

      dueDateScript = `
        set dueDate to current date
        set year of dueDate to ${year}
        set month of dueDate to ${month}
        set day of dueDate to ${day}
        set time of dueDate to ${(hours * 3600) + (minutes * 60)}
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

// export async function addReminder(input: AddReminderInput): Promise<AddReminderOutput> {
//   const title = input.title.replace(/"/g, '\\"');
//   const notes = input.notes ? input.notes.replace(/"/g, '\\"') : "";
  
//   let properties = `name: "${title}"`;
  
//   if (notes) {
//     properties += `, body: "${notes}"`;
//   }

//   if (input.due_date) {
//     const date = new Date(input.due_date);
//     if (!isNaN(date.getTime())) {
//       const day = date.getDate();
//       const month = date.getMonth() + 1; // AppleScript months are 1–12
//       const year = date.getFullYear();
//       const hours = date.getHours();
//       const minutes = date.getMinutes();

//       properties += `,
//         due date: (do shell script "osascript -e 'set d to current date
//         set year of d to ${year}
//         set month of d to ${month}
//         set day of d to ${day}
//         set time of d to ${(hours * 3600) + (minutes * 60)}
//         return d as string'") as date
//       `;
//     }
//   }
//   console.log(properties)

//   const script = `
//     tell application "Reminders"
//       set newReminder to make new reminder in list "Reminders" with properties {${properties}}
//     end tell
//   `;

//   try {
//     execSync(`osascript -e '${script}'`);
//     return { message: "Reminder added successfully." };
//   } catch (error) {
//     console.error(error);
//     return { message: "Failed to add reminder." };
//   }
// }
// export async function addReminder(input: AddReminderInput): Promise<AddReminderOutput> {
//   const title = input.title.replace(/"/g, '\\"');
//   const notes = input.notes ? input.notes.replace(/"/g, '\\"') : "";
//   const dueDate = input.due_date ? input.due_date : "";

//   let script = `
//     tell application "Reminders"
//       set newReminder to make new reminder in list "Reminders"
//       set name of newReminder to "${title}"
//       ${notes ? `set body of newReminder to "${notes}"` : ""}
//       ${dueDate ? `set due date of newReminder to date "${dueDate}"` : ""}
//     end tell
//   `;

//   try {
//     execSync(`osascript -e '${script}'`);
//     return { message: "Reminder added successfully." };
//   } catch (error) {
//     return { message: "Failed to add reminder." };
//   }
// }
