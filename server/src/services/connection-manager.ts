import { createClient, ClickHouseClient } from '@clickhouse/client'
import { ClickHouseConnection } from '../types'

class ConnectionManager {
    private connections: Map<string, ClickHouseClient> = new Map()

    private getConnectionKey(config: ClickHouseConnection): string {
        console.log("Getting connection key for", config)
        return `${config.host}:${config.port}:${config.database}:${config.username}:${config.jwtToken}`
    }

    public getClient(config: ClickHouseConnection): ClickHouseClient {
        console.log("Getting client for", config)
 
        const key = this.getConnectionKey(config)
               
        if (!this.connections.has(key)) {
            console.log("Creating new client for", config)
            const client = createClient({
                host: `http://${config.host}:${config.port}`,
                username: config.username,
                password: config.jwtToken|| '',
                database: config.database,
                request_timeout: 30000
            })
            this.connections.set(key, client)
        }

        console.log("Returning client for", config)
        return this.connections.get(key)!
    }

    public removeConnection(config: ClickHouseConnection): void {
        console.log("Removing connection for", config)
        const key = this.getConnectionKey(config)
        if (this.connections.has(key)) {
            const client = this.connections.get(key)!
            client.close()
            this.connections.delete(key)
        }
    }

    public clearConnections(): void {
        console.log("Clearing connections")
        for (const client of this.connections.values()) {
            client.close()
        }
        this.connections.clear()
    }
}

export const connectionManager = new ConnectionManager()