import { z } from 'zod'

export const clickhouseConnectionSchema = z.object({
    host: z.string().min(1, "Host is required"),
    port: z.number().min(1, "Port is required"),
    database: z.string().min(1, "Database is required"),
    username: z.string().min(1, "Username is required"),
    jwtToken: z.string().min(1, "JWT Token is required")
})

export const flatFileSourceSchema = z.object({
    type: z.literal('flatfile'),
    data: z.array(z.record(z.string())).min(1, "Data array cannot be empty"),
    delimiter: z.string().min(1, "Delimiter is required"),
    validate: z.boolean().optional().default(true)
})

export const clickhouseSourceSchema = z.object({
    type: z.literal('clickhouse'),
    config: clickhouseConnectionSchema,
    table: z.string().min(1, "Table name is required"),
    columns: z.array(z.string()).min(1, "At least one column must be selected")
})

export const targetSchema = z.object({
    type: z.enum(['clickhouse', 'flatfile']),
    config: clickhouseConnectionSchema,
    table: z.string().min(1, "Table name is required")
})

export const dataTransferConfigSchema = z.object({
    source: z.discriminatedUnion('type', [
        flatFileSourceSchema,
        clickhouseSourceSchema
    ]),
    target: targetSchema
})

export type DataTransferConfig = z.infer<typeof dataTransferConfigSchema>