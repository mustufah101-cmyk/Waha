function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatDateToDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getHydrationDateKey(timestampMs: number, iftarTime: string = '18:30'): string {
  const d = new Date(timestampMs);
  const [iftarHour, iftarMin] = iftarTime.split(':').map(Number);

  const currentHour = d.getHours();
  const currentMin = d.getMinutes();

  // If time is before iftar (e.g. 14:00 before 18:30), it belongs to the previous day's hydration cycle
  if (currentHour < iftarHour || (currentHour === iftarHour && currentMin < iftarMin)) {
    const yesterday = new Date(d);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDateToDateKey(yesterday);
  }

  // At or after iftar (e.g. 19:00, 23:00) belongs to today's cycle
  return formatDateToDateKey(d);
}

export function getPast7DateKeys(currentDateKey: string): string[] {
  const [y, m, d] = currentDateKey.split('-').map(Number);
  const baseDate = new Date(y, m - 1, d);

  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const past = new Date(baseDate);
    past.setDate(past.getDate() - i);
    keys.push(formatDateToDateKey(past));
  }
  return keys;
}
