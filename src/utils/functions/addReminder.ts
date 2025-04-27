import { execSync } from "child_process";

interface AddReminderInput {
  title: string;
  notes?: string;
  due_date?: string; 
}

interface AddReminderOutput {
  message: string;
}



export default async function addReminder(input: AddReminderInput): Promise<AddReminderOutput> {
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