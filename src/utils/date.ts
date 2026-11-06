export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateStr: string, locale: string = 'en-US'): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculates calendar days from today through selected deadline, inclusive.
 */
export function getDaysRemaining(targetDateStr: string): number {
  const todayStr = getTodayDateString();
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const [dy, dm, dd] = targetDateStr.split('-').map(Number);

  const today = new Date(ty, tm - 1, td);
  const deadline = new Date(dy, dm - 1, dd);

  const diffMs = deadline.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // If today is equal to deadline, that's 1 remaining day (today itself)
  return Math.max(0, diffDays + 1);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  }
  return `${mins}m ${secs}s`;
}

export function formatIndianNumber(num: number): string {
  return num.toLocaleString('en-IN');
}
