export type ClickHouseConnection = {
  host: string;
  port: number;
  database: string;
  username: string;
  jwtToken: string;
};

export type Column = {
  name: string;
  type: string;
  selected: boolean;
};

export type Table = {
  name: string;
  columns: Column[];
};

export type ConnectionStatus = {
  success: boolean;
  error?: string;
};

export type ExportConfig = {
  source: {
    type: 'clickhouse';
    config: ClickHouseConnection;
    table: string;
    columns: string[];
  };
  target: {
    type: 'flatfile';
    table: string;
  };
}; 