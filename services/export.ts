import { DB } from './db';

const convertToCSV = (objArray: any[], headers: string[]) => {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  
  // Create CSV header row
  let str = headers.join(',') + '\r\n';

  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (let index in headers) {
      if (line !== '') line += ',';
      
      const key = headers[index];
      let value = array[i][key];
      
      // Handle values
      if (value === undefined || value === null) {
        value = '';
      } else if (typeof value === 'string') {
          // Escape double quotes by doubling them
          value = value.replace(/"/g, '""');
          
          // Wrap in quotes if it contains comma, newline or quotes
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              value = `"${value}"`;
          }
      }
      
      line += value;
    }
    str += line + '\r\n';
  }
  return str;
};

const downloadFile = (csvContent: string, fileName: string) => {
  // Use Blob for proper character encoding
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const ExportService = {
  exportTransactions: () => {
    const data = DB.transactions.getAll();
    const apartments = DB.apartments.getAll();
    
    // Enrich data with Apartment Names for readability
    const enrichedData = data.map(t => ({
      ...t,
      apartmentName: apartments.find(a => a.id === t.apartmentId)?.name || 'General/Global'
    }));

    // Define columns to export
    const headers = ['id', 'date', 'type', 'category', 'amount', 'description', 'apartmentName', 'isRecurring', 'isPaid'];
    
    const csv = convertToCSV(enrichedData, headers);
    downloadFile(csv, `vit_transactions_${new Date().toISOString().split('T')[0]}.csv`);
  },

  exportTenants: () => {
    const data = DB.tenants.getAll();
    const apartments = DB.apartments.getAll();

    const enrichedData = data.map(t => ({
      ...t,
      apartmentName: apartments.find(a => a.id === t.apartmentId)?.name || 'Unassigned'
    }));

    const headers = ['id', 'name', 'email', 'phone', 'apartmentName', 'rentAmount', 'paymentFrequency', 'moveInDate'];
    const csv = convertToCSV(enrichedData, headers);
    downloadFile(csv, `vit_tenants_${new Date().toISOString().split('T')[0]}.csv`);
  },

  exportApartments: () => {
    const data = DB.apartments.getAll();
    const headers = ['id', 'name', 'address', 'size', 'rooms', 'floor', 'notes'];
    const csv = convertToCSV(data, headers);
    downloadFile(csv, `vit_apartments_${new Date().toISOString().split('T')[0]}.csv`);
  }
};