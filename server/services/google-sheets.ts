import { google, sheets_v4 } from 'googleapis';
import { storage } from '../storage';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  credentials?: any;
}

class GoogleSheetsService {
  private sheets: sheets_v4.Sheets | null = null;
  private auth: any = null;

  async initializeAuth(credentials?: any) {
    try {
      if (credentials) {
        // Use provided service account credentials
        this.auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
      } else {
        // Use OAuth2 flow for user authentication (requires setup)
        this.auth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );
      }

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Sheets auth:', error);
      return false;
    }
  }

  async exportRequisitionsToSheet(spreadsheetId: string, sheetName: string = 'Requisitions') {
    if (!this.sheets) {
      throw new Error('Google Sheets not initialized');
    }

    try {
      const requisitions = await storage.getRequisitions();
      
      // Prepare headers
      const headers = [
        'Requisition Number',
        'Description', 
        'Category',
        'Quantity',
        'Estimated Amount',
        'Status',
        'Urgency',
        'Requester',
        'Created Date',
        'Approved Date'
      ];

      // Prepare data rows
      const rows = requisitions.map(req => [
        req.requisitionNumber,
        req.description,
        req.category,
        req.quantity.toString(),
        req.estimatedAmount,
        req.status,
        req.urgency,
        `${req.requesterId}`, // Could be enhanced with actual name lookup
        req.createdAt?.toISOString().split('T')[0] || '',
        req.approvedAt?.toISOString().split('T')[0] || ''
      ]);

      // Clear existing data and write new data
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
      });

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers, ...rows]
        }
      });

      return {
        success: true,
        rowsExported: requisitions.length,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`
      };
    } catch (error) {
      console.error('Export requisitions error:', error);
      throw error;
    }
  }

  async exportSuppliersToSheet(spreadsheetId: string, sheetName: string = 'Suppliers') {
    if (!this.sheets) {
      throw new Error('Google Sheets not initialized');
    }

    try {
      const suppliers = await storage.getSuppliers();
      
      const headers = [
        'Name',
        'Email',
        'Phone',
        'Category',
        'Status', 
        'Rating',
        'Total Orders',
        'Performance Score',
        'Created Date'
      ];

      const rows = suppliers.map(supplier => [
        supplier.name,
        supplier.contactEmail,
        supplier.contactPhone || '',
        supplier.category,
        supplier.status,
        supplier.rating || '0',
        supplier.totalOrders?.toString() || '0',
        supplier.performanceScore || '0',
        supplier.createdAt?.toISOString().split('T')[0] || ''
      ]);

      await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
      });

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers, ...rows]
        }
      });

      return {
        success: true,
        rowsExported: suppliers.length,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`
      };
    } catch (error) {
      console.error('Export suppliers error:', error);
      throw error;
    }
  }

  async exportQuotesToSheet(spreadsheetId: string, sheetName: string = 'Quotes') {
    if (!this.sheets) {
      throw new Error('Google Sheets not initialized');
    }

    try {
      const quotes = await storage.getQuotes();
      
      const headers = [
        'Quote Number',
        'Requisition ID',
        'Supplier ID', 
        'Total Amount',
        'Delivery Time (days)',
        'Status',
        'Valid Until',
        'Created Date',
        'Terms',
        'Notes'
      ];

      const rows = quotes.map(quote => [
        quote.quoteNumber,
        quote.requisitionId,
        quote.supplierId,
        quote.totalAmount,
        quote.deliveryTime?.toString() || '',
        quote.status,
        quote.validUntil?.toISOString().split('T')[0] || '',
        quote.createdAt?.toISOString().split('T')[0] || '',
        quote.terms || '',
        quote.notes || ''
      ]);

      await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
      });

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers, ...rows]
        }
      });

      return {
        success: true,
        rowsExported: quotes.length,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`
      };
    } catch (error) {
      console.error('Export quotes error:', error);
      throw error;
    }
  }

  async createSpreadsheet(title: string) {
    if (!this.sheets) {
      throw new Error('Google Sheets not initialized');
    }

    try {
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title
          },
          sheets: [
            { properties: { title: 'Requisitions' } },
            { properties: { title: 'Suppliers' } },
            { properties: { title: 'Quotes' } },
            { properties: { title: 'Analytics' } }
          ]
        }
      });

      return {
        spreadsheetId: response.data.spreadsheetId,
        url: response.data.spreadsheetUrl
      };
    } catch (error) {
      console.error('Create spreadsheet error:', error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();