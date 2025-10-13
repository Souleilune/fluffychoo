// Generate unique order reference ID
// Format: FLC-YYYYMMDD-XXXXX
// Example: FLC-20251013-A3K9P

export function generateOrderReference(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Generate 5-character alphanumeric code (excluding confusing characters like 0, O, I, 1)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `FLC-${year}${month}${day}-${code}`;
}

// Validate order reference format
export function isValidOrderReference(reference: string): boolean {
  const pattern = /^FLC-\d{8}-[A-Z0-9]{5}$/;
  return pattern.test(reference);
}

// Extract date from order reference
export function getDateFromReference(reference: string): Date | null {
  if (!isValidOrderReference(reference)) {
    return null;
  }
  
  const dateStr = reference.split('-')[1]; // YYYYMMDD
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  
  return new Date(year, month, day);
}