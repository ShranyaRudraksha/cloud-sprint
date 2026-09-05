// The app is built around ap-south-1 (Mumbai), so timestamps are always
// shown in IST regardless of the viewing browser/OS's own timezone setting.
export function formatDateTime(value) {
  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "medium",
  });
}
