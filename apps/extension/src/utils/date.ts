import type {
  dateFormatOptions,
  timeFormatOptions,
} from "@/features/settings/schemas/settings";

type DateFormat = (typeof dateFormatOptions)[number];
type TimeFormat = (typeof timeFormatOptions)[number];

export const formatDate = (
  date: string | number | Date,
  dateFormat: DateFormat,
): string => {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  switch (dateFormat) {
    case "MM/DD/YYYY":
      return `${mm}/${dd}/${yyyy}`;
    case "YYYY-MM-DD":
      return `${yyyy}-${mm}-${dd}`;
    default:
      return `${dd}/${mm}/${yyyy}`;
  }
};

export const formatTime = (
  date: string | number | Date,
  timeFormat: TimeFormat,
): string => {
  const d = new Date(date);
  const minutes = String(d.getMinutes()).padStart(2, "0");

  if (timeFormat === "12h") {
    const period = d.getHours() >= 12 ? "PM" : "AM";
    const hours = d.getHours() % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  }

  return `${String(d.getHours()).padStart(2, "0")}:${minutes}`;
};

export const formatDateTime = (
  date: string | number | Date,
  options: { dateFormat: DateFormat; timeFormat: TimeFormat },
): string =>
  `${formatDate(date, options.dateFormat)} ${formatTime(date, options.timeFormat)}`;

export const formatRelativeTime = (timestamp: number | null) => {
  if (!timestamp) return "-";
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};
