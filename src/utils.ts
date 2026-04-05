export function getEpidemiologicalWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

export function downloadCSV(data: Record<string, any>, filename: string) {
  const keys = Object.keys(data);
  const values = keys.map(k => {
    let val = data[k];
    if (Array.isArray(val)) {
      val = val.join('; ');
    }
    if (typeof val === 'string') {
      val = val.replace(/"/g, '""');
      if (val.search(/("|,|\n)/g) >= 0) {
        val = `"${val}"`;
      }
    }
    return val;
  });

  const csvContent = "\uFEFF" + keys.join(',') + '\n' + values.join(',');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
