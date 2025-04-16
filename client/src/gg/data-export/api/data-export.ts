import { apiClient } from '@/lib/api';
import { ClickHouseConnection, ConnectionStatus, Column, ExportConfig } from '../types';

export const dataExportApi = {
  validateConnection: async (connection: ClickHouseConnection): Promise<ConnectionStatus> => {
    const response = await apiClient.post('/validate-connection', connection);
    return response.data;
  },
  
  getTables: async (connection: ClickHouseConnection): Promise<string[]> => {
    const response = await apiClient.post('/tables', connection);
    return response.data;
  },
  
  getColumns: async (connection: ClickHouseConnection, table: string): Promise<Column[]> => {
    const response = await apiClient.post('/columns', { ...connection, table });
    return response.data.map((col: any) => ({
      ...col,
      selected: false,
    }));
  },
  
  exportData: async (config: ExportConfig): Promise<void> => {
    const response = await apiClient.post('/export', config, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${config.source.table}_export.csv`);
    document.body.appendChild(link);
    link.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }
}; 

import axios from 'axios';

const API_URL = 'http://localhost:8787/api';

type ConnectionConfig = {
  host: string;
  port: number;
  database: string;
  username: string;
  jwtToken: string;
};

type ValidationResponse = {
  success: boolean;
  error?: string;
};

type Column = {
  name: string;
  type: string;
};

type ExportConfig = {
  source: {
    type: "clickhouse";
    config: ConnectionConfig;
    table: string;
    columns: string[];
  };
  target: {
    type: "flatfile";
    table: string;
  };
};

export const clickhouseService = {
  validateConnection: async (config: ConnectionConfig): Promise<ValidationResponse> => {
    const response = await axios.post(`${API_URL}/validate-connection`, config);
    return response.data;
  },
  
  getTables: async (config: ConnectionConfig): Promise<string[]> => {
    const response = await axios.post(`${API_URL}/tables`, config);
    return response.data;
  },
  
  getColumns: async (config: ConnectionConfig, table: string): Promise<Column[]> => {
    const response = await axios.post(`${API_URL}/columns`, { ...config, table });
    return response.data;
  },
  
  previewData: async (config: ConnectionConfig, table: string, columns: string[]): Promise<Record<string, any>[]> => {
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
  }
};