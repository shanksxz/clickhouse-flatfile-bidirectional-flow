import axios from 'axios';

const API_URL = 'http://localhost:8787/api';

export type ClickHouseConnection = {
  host: string;
  port: string | number;
  database: string;
  username: string;
  jwtToken: string;
};

export type Column = {
  name: string;
  type: string;
  selected?: boolean;
};

export type ValidationResponse = {
  success: boolean;
  error?: string;
};

export type FlatFileConfig = {
  type: "flatfile";
  data: Record<string, any>[];
  delimiter: string;
  validate: boolean;
};

export type ExportConfig = {
  source: {
    type: "clickhouse";
    config: ClickHouseConnection;
    table: string;
    columns: string[];
  };
  target: {
    type: "flatfile";
    table: string;
  };
};

export type ImportConfig = {
  source: {
    type: "flatfile";
    data: Record<string, any>[];
    delimiter: string;
    validate: boolean;
  };
  target: {
    type: "clickhouse";
    config: ClickHouseConnection;
    table: string;
  };
};

export type ImportResult = {
  status: string;
  recordsProcessed?: number;
  error?: string;
};

export const clickhouseService = {
  validateConnection: async (config: ClickHouseConnection): Promise<ValidationResponse> => {
    const response = await axios.post(`${API_URL}/validate-connection`, config);
    return response.data;
  },
  
  getTables: async (config: ClickHouseConnection): Promise<string[]> => {
    const response = await axios.post(`${API_URL}/tables`, config);
    return response.data.map((table: string | { name: string }) => 
      typeof table === 'string' ? table : table.name
    );
  },
  
  getColumns: async (config: ClickHouseConnection, table: string): Promise<Column[]> => {
    const response = await axios.post(`${API_URL}/columns`, { ...config, table });
    return response.data;
  },
  
  getTableSchema: async (config: ClickHouseConnection, table: string): Promise<Column[]> => {
    const response = await axios.post(`${API_URL}/table-schema`, { ...config, table });
    return response.data;
  },
  
  previewData: async (config: ClickHouseConnection, table: string, columns: string[]): Promise<Record<string, any>[]> => {
    const response = await axios.post(`${API_URL}/preview`, { ...config, table, columns });
    return response.data;
  },
  
  exportData: async (config: ExportConfig): Promise<void> => {
    const response = await axios.post(`${API_URL}/export`, config, {
      responseType: 'blob',
    });
    
    // Create a download link for the file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${config.source.table}_export.csv`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  },
  
  importData: async (config: ImportConfig): Promise<ImportResult> => {
    try {
      const response = await axios.post(`${API_URL}/import`, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Import failed');
      }
      throw error;
    }
  }
};