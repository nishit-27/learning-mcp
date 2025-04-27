import { execSync } from "child_process";

interface ReminderItem {
  title: string;
  notes: string;
  dueDate: string | null;
  completed: boolean;
}

interface ListRemindersOutput {
  reminders: ReminderItem[];
}

export default async function listReminders(): Promise<ListRemindersOutput> {
  const script = `
    tell application "Reminders"
      set output to ""
      set reminderList to reminders in list "Reminders"
      repeat with theReminder in reminderList
        set reminderTitle to name of theReminder
        set reminderNotes to body of theReminder
        if due date of theReminder is not missing value then
          set reminderDueDate to due date of theReminder as string
        else
          set reminderDueDate to "null"
        end if
        set reminderCompleted to completed of theReminder as string
        set output to output & reminderTitle & "||" & reminderNotes & "||" & reminderDueDate & "||" & reminderCompleted & "%%"
      end repeat
      return output
    end tell
  `;

  try {
    const result = execSync(`osascript -e '${script}'`).toString().trim();
    const reminders: ReminderItem[] = [];

    if (result.length > 0) {
      const items = result.split("%%").filter(item => item.trim() !== "");
      for (const item of items) {
        const [title, notes, dueDate, completed] = item.split("||");
        reminders.push({
          title: title || "",
          notes: notes || "",
          dueDate: dueDate === "null" ? null : dueDate,
          completed: completed === "true",
        });
      }
    }

    return { reminders };
  } catch (error) {
    console.error(error);
    return { reminders: [] };
  }
}
