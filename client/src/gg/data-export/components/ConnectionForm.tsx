import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClickHouseConnection } from '../types';

type ConnectionFormProps = {
  onConnect: (connection: ClickHouseConnection) => Promise<void>;
  isConnecting: boolean;
  error?: string;
};

export const ConnectionForm = ({ onConnect, isConnecting, error }: ConnectionFormProps) => {
  const [connection, setConnection] = useState<ClickHouseConnection>({
    host: '',
    port: 8123,
    database: '',
    username: '',
    jwtToken: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConnection((prev) => ({
      ...prev,
      [name]: name === 'port' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(connection);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">ClickHouse Connection</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="host">Host</label>
          <Input
            id="host"
            name="host"
            value={connection.host}
            onChange={handleChange}
            required
            placeholder="localhost"
          />
        </div>
        
        <div>
          <label htmlFor="port">Port</label>
          <Input
            id="port"
            name="port"
            type="number"
            value={connection.port}
            onChange={handleChange}
            required
            placeholder="8123"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="database">Database</label>
        <Input
          id="database"
          name="database"
          value={connection.database}
          onChange={handleChange}
          required
          placeholder="default"
        />
      </div>
      
      <div>
        <label htmlFor="username">Username</label>
        <Input
          id="username"
          name="username"
          value={connection.username}
          onChange={handleChange}
          required
          placeholder="default"
        />
      </div>
      
      <div>
        <label htmlFor="jwtToken">JWT Token</label>
        <Input
          id="jwtToken"
          name="jwtToken"
          type="password"
          value={connection.jwtToken}
          onChange={handleChange}
          required
          placeholder="Your JWT token"
        />
      </div>
      
      {error && <p className="text-red-500">{error}</p>}
      
      <Button type="submit" disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Connect'}
      </Button>
    </form>
  );
}; 