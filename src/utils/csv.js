function escapeValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  let stringValue;

  if (Array.isArray(value) || typeof value === 'object') {
    try {
      stringValue = JSON.stringify(value);
    } catch (error) {
      stringValue = String(value);
    }
  } else {
    stringValue = String(value);
  }

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function toCSV(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return '';
  }

  const columns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set())
  );

  const header = columns.join(',');
  const dataRows = rows.map((row) =>
    columns.map((column) => escapeValue(row[column])).join(',')
  );

  return [header, ...dataRows].join('\n');
}

module.exports = {
  toCSV
};
