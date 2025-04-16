export type DataSourceType = 'clickhouse' | 'flatfile'

export type ClickHouseConnection = {
    host: string
    port: number
    database: string
    username: string
    jwtToken: string
}

export type FlatFileConnection = {
    type: 'flatfile'
    filename: string
    delimiter: string
	data: string[]
}


export type Column = {
    name: string
    type: string
    default_type: string
    default_expression: string
}

export type ValidationResponse = {
    success: boolean
    error?: string
}

export type TransferConfig = {
	source: FlatFileConnection
	target: {
		type: 'clickhouse'
		config: ClickHouseConnection
		table: string
	}
}

export type DataTransferConfig = {
    source: {
        type: 'clickhouse'
        config: ClickHouseConnection
        table: string
        columns: string[]
    } | {
        type: 'flatfile'
        data: Record<string, string>[]
        delimiter: string
        validate: boolean
    }
    target: {
        type: 'clickhouse' | 'flatfile'
        config: ClickHouseConnection
        table: string
    }
}

export type DataTransferStatus = {
    id: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    progress: number
    recordsProcessed: number
    error?: string
}

