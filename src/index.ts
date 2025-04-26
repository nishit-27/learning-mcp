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
  return ({content: [{ type: "text", text: String(response) }]
 
})})
// server.tool('create\_reminder', 'Create a new reminder in the Reminders app', { title: z.string(), dueDate: z.string().optional(), notes: z.string().optional() }, async (title, dueDate, notes,extra) => {
//   /** Create a new reminder in the Reminders app */
//   try {
//     const script = `
//       tell application "Reminders"
//         set newReminder to make new reminder with properties {name:"${title}"${params.dueDate ? `, due date:date "${dueDate}"` : ''}${notes ? `, body:"${notes}"` : ''}}
//       end tell
//     `;
//     const { exec } = require('child\_process');
//     exec(`osascript -e '${script}'`, (error:any, stdout:any, stderr:any) => {
//       if (error) {
//         console.error('Error creating reminder:', error);
//         return { content: [{ type: 'text', text: 'Error creating reminder' }], isError: true };
//       }
//       return { content: [{ type: 'text', text: 'Reminder created successfully' }] };
//     });
//   } catch (error) {
//     console.error('Error in create\_reminder tool:', error);
//     return { content: [{ type: 'text', text: 'Error creating reminder' }], isError: true };
//   }
// });
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
  const dueDate = input.due_date ? input.due_date : "";

  let script = `
    tell application "Reminders"
      set newReminder to make new reminder in list "Reminders"
      set name of newReminder to "${title}"
      ${notes ? `set body of newReminder to "${notes}"` : ""}
      ${dueDate ? `set due date of newReminder to date "${dueDate}"` : ""}
    end tell
  `;

  try {
    execSync(`osascript -e '${script}'`);
    return { message: "Reminder added successfully." };
  } catch (error) {
    return { message: "Failed to add reminder." };
  }
}
