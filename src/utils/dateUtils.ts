export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const isToday = (dateString: string): boolean => {
  const today = formatDate(new Date());
  return dateString === today;
};

export const isConsecutiveDay = (lastDate: string, currentDate: string): boolean => {
  const last = new Date(lastDate.split('/').reverse().join('-'));
  const current = new Date(currentDate.split('/').reverse().join('-'));
  const diffTime = current.getTime() - last.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays === 1;
};