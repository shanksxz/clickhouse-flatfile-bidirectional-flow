import { connectionManager } from "./connection-manager";
import {
    ClickHouseConnection,
    Column,
    ValidationResponse,
    DataTransferConfig,
    DataTransferStatus,
} from "../types";
import { createWriteStream } from "fs";
import { stringify } from "csv-stringify";
import path from "path";
import { promises as fs } from "fs";
import { ClickHouseClient } from "@clickhouse/client";
import { Transform, TransformCallback } from "stream";
export class ClickHouseService {
    async validateConnection(
        config: ClickHouseConnection
    ): Promise<ValidationResponse> {
        try {
            const client = connectionManager.getClient(config);
            const result = await client.ping();
            return { success: result.success };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async getTables(config: ClickHouseConnection): Promise<string[]> {
        try {
            const client = connectionManager.getClient(config);
            const result = await client.query({
                query: `SHOW TABLES FROM ${config.database}`,
                format: "JSONEachRow",
            });
            const data = await result.json();
            return data as string[];
        } catch (error) {
            throw new Error(
                error instanceof Error ? error.message : "Failed to get tables"
            );
        }
    }

    async getColumns(
        config: ClickHouseConnection,
        table: string
    ): Promise<Column[]> {
        try {
            const client = connectionManager.getClient(config);
            const result = await client.query({
                query: `DESCRIBE TABLE ${config.database}.${table}`,
                format: "JSONEachRow",
            });
            return result.json();
        } catch (error) {
            throw new Error(
                error instanceof Error ? error.message : "Failed to get columns"
            );
        }
    }
    async getTableSchema(
        config: ClickHouseConnection,
        table: string
    ): Promise<Column[]> {
        try {
            const client = connectionManager.getClient(config);
            const result = await client.query({
                query: `DESCRIBE TABLE ${config.database}.${table}`,
                format: "JSONEachRow",
            });
            return result.json();
        } catch (error) {
            throw new Error(
                error instanceof Error
                    ? error.message
                    : "Failed to get table schema"
            );
        }
    }
    async previewData(
        config: ClickHouseConnection,
        table: string,
        columns: string[]
    ): Promise<Record<string, any>[]> {
        try {
            const client = connectionManager.getClient(config);
            const result = await client.query({
                query: `SELECT ${columns.join(",")} FROM ${
                    config.database
                }.${table} LIMIT 100`,
                format: "JSONEachRow",
            });
            return result.json();
        } catch (error) {
            throw new Error(
                error instanceof Error
                    ? error.message
                    : "Failed to preview data"
            );
        }
    }

    async startTransfer(
        config: DataTransferConfig
    ): Promise<DataTransferStatus> {
        const transferId = crypto.randomUUID();
        return {
            id: transferId,
            status: "pending",
            progress: 0,
            recordsProcessed: 0,
        };
    }

    async importFromFile(
        config: DataTransferConfig
    ): Promise<DataTransferStatus> {
        const transferId = crypto.randomUUID();
        try {
            if (
                config.source.type !== "flatfile" ||
                config.target.type !== "clickhouse"
            ) {
                throw new Error("Invalid transfer configuration");
            }

            const client = connectionManager.getClient(config.target.config);

            const data = config.source.data;
            if (!data || data.length === 0) {
                throw new Error("No data to insert");
            }

            const batchSize = 1000;
            const batches = [];
            for (let i = 0; i < data.length; i += batchSize) {
                batches.push(data.slice(i, i + batchSize));
                await client.insert({
                    table: config.target.table,
                    values: batches[i],
                    format: "JSONEachRow",
                });
            }
            return {
                id: transferId,
                status: "completed",
                progress: 100,
                recordsProcessed: data.length,
            };
        } catch (error) {
            return {
                id: transferId,
                status: "failed",
                progress: 0,
                recordsProcessed: 0,
                error: error instanceof Error ? error.message : "Import failed",
            };
        }
    }

    // async exportToFlatFile(
    //     config: DataTransferConfig
    // ): Promise<NodeJS.ReadableStream> {
    //     try {
    //         if (
    //             config.source.type !== "clickhouse" ||
    //             config.target.type !== "flatfile"
    //         ) {
    //             throw new Error("Invalid transfer configuration");
    //         }
    //         const client = connectionManager.getClient(config.source.config);
    //         const result = await client.query({
    //             query: `SELECT ${config.source.columns.join(",")} FROM ${
    //                 config.source.table
    //             }`,
    //             format: "CSVWithNames",
    //             clickhouse_settings: {
    //                 output_format_csv_crlf_end_of_line: 0,
    //                 format_csv_delimiter: ",",
    //             },
    //         });

    //         const csvTransform = new Transform({
    //             objectMode: true,
    //             transform(
    //                 chunk: any,
    //                 encoding: BufferEncoding,
    //                 callback: TransformCallback
    //             ) {
    //                 try {
    //                     const csvLine = chunk.join(",") + "\n";
    //                     callback(null, csvLine);
    //                 } catch (error) {
    //                     callback(error as Error);
    //                 }
    //             },
    //         });

    //         return result.stream().pipe(csvTransform);
    //     } catch (error) {
    //         throw new Error(
    //             error instanceof Error
    //                 ? error.message
    //                 : "Failed to export to flat file"
    //         );
    //     }
    // }

    async streamQuery(
        client: ClickHouseClient,
        query: string,
        onRow: (row: Record<string, unknown>) => void,
        onEnd: () => void,
        onError: (err: Error) => void
    ): Promise<void> {
        try {
            const resultSet = await client.query({
                query,
                format: "JSONEachRow",
            });
            for await (const row of resultSet.stream()) {
                //@ts-ignore
                onRow(row);
            }
            onEnd();
        } catch (error) {
            onError(error as Error);
        }
    }

    async exportToFlatFile(
        config: DataTransferConfig
    ): Promise<NodeJS.ReadableStream> {
        try {
            if (
                config.source.type !== "clickhouse" ||
                config.target.type !== "flatfile"
            ) {
                throw new Error("Invalid transfer configuration");
            }

            if (!config.source.columns || config.source.columns.length === 0) {
                throw new Error("No columns to export");
            }

            const outputDir = path.join(process.cwd(), "output");
            const outputFile = path.join(
                outputDir,
                `${config.target.table}.csv`
            );
            await fs.mkdir(outputDir, { recursive: true });
            // const csvStream = createWriteStream(outputFile);
            // const stringifier = stringify({ header: true });

            const client = connectionManager.getClient(config.source.config);
            const query = `SELECT ${config.source.columns.join(",")} FROM ${
                config.source.table
            }`;
            const csvStream = stringify({ header: true, columns: config.source.columns });
            const fileStream = createWriteStream(outputFile);

            let recordsProcessed = 0;

            await new Promise<void>((resolve, reject) => {
                this.streamQuery(
                    client,
                    query,
                    (row: Record<string, unknown>) => {
                        csvStream.write(row);
                        recordsProcessed++;
                    },
                    () => {
                        csvStream.end();
                    },
                    (err: Error) => {
                        csvStream.end();
                        reject(err);
                    }
                );
                csvStream.pipe(fileStream);
                fileStream.on("finish", () => {
                    resolve();
                });
                fileStream.on("error", (err) => {
                    reject(err);
                });
            });
            return csvStream;
        } catch (error) {
            throw new Error(
                error instanceof Error
                    ? error.message
                    : "Failed to export to flat file"
            );
        }
    }
}

export const clickhouseService = new ClickHouseService();
