export interface ParentImportRecord {
  username: string;
  password?: string;
  parent_name: string;
  child_name: string;
  contact_phone?: string;
  bee_tokens?: number;
  spelling_bee?: boolean;
  ai_features?: boolean;
}

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header] ?? '';
          const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${stringVal.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(filename: string, data: any) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateSampleCSV(): string {
  return `username,password,parent_name,child_name,contact_phone,bee_tokens,spelling_bee,ai_features
john_doe,bee2026pass,John Doe,Alex Doe,+60123456789,100,true,true
sarah_tan,tanPass888,Sarah Tan,Lucas Tan,+60198765432,50,true,false
michael_lee,leeFamily123,Michael Lee,Chloe Lee,+60176543210,200,true,true`;
}

export function parseCSV(csvText: string): ParentImportRecord[] {
  const lines = csvText
    .split(/\r\n|\n|\r/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Parse header line handling potential quotes
  const headers = parseCSVLine(lines[0]).map((h) =>
    h.toLowerCase().trim().replace(/[\s-]+/g, '_')
  );

  const results: ParentImportRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawValues = parseCSVLine(lines[i]);
    if (rawValues.length === 0 || (rawValues.length === 1 && !rawValues[0])) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      rowObj[header] = rawValues[idx]?.trim() ?? '';
    });

    const username = (rowObj.username || rowObj.user_name || rowObj.user || '').toLowerCase().trim();
    const parentName = rowObj.parent_name || rowObj.parent || rowObj.guardian || rowObj.parentname || 'Parent';
    const childName = rowObj.child_name || rowObj.child || rowObj.student || rowObj.childname || 'Student';
    const password = rowObj.password || rowObj.pass || rowObj.temporary_password || undefined;
    const contactPhone = rowObj.contact_phone || rowObj.phone || rowObj.contact || rowObj.tel || rowObj.mobile || undefined;
    
    const tokensRaw = rowObj.bee_tokens || rowObj.tokens || rowObj.bee_token || rowObj.token || '100';
    const beeTokens = Number.parseInt(tokensRaw, 10) || 100;
    
    const spellingBee = rowObj.spelling_bee === 'true' || rowObj.spelling_bee === '1' || rowObj.spelling === 'true' || rowObj.spelling_bee === 'yes';
    const aiFeatures = rowObj.ai_features === 'true' || rowObj.ai_features === '1' || rowObj.ai === 'true' || rowObj.ai_features === 'yes';

    if (username || childName) {
      results.push({
        username: username || childName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900),
        password: password || `bee${Math.floor(1000 + Math.random() * 9000)}pass`,
        parent_name: parentName,
        child_name: childName,
        contact_phone: contactPhone,
        bee_tokens: beeTokens,
        spelling_bee: spellingBee || true,
        ai_features: aiFeatures,
      });
    }
  }

  return results;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
