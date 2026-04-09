export const generateId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

export const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDateShort = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getMonthName = (monthIndex: number) =>
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthIndex];

export const groupByMonth = <T extends { date: string }>(items: T[]) => {
  return items.reduce((acc, item) => {
    const d = new Date(item.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

export const getLast6Months = () => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: d.getMonth(), year: d.getFullYear(), label: getMonthName(d.getMonth()) });
  }
  return months;
};

export const maskCardNumber = (num: string) => {
  const parts = num.split(' ');
  return parts.map((p, i) => (i < parts.length - 1 ? '••••' : p)).join(' ');
};