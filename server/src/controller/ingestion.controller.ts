import { Request, Response } from "express";
import { clickhouseService } from "../services/click-house";
import { ClickHouseConnection, DataTransferConfig } from "../types";
import {
    clickhouseConnectionSchema,
    type DataTransferConfig as ZodDataTransferConfig,
} from "../validators";
import { z } from "zod";

export class IngestionController {
    async validateConnection(
        req: Request<{}, {}, ClickHouseConnection>,
        res: Response
    ) {
        try {
            const config = req.body;
            const result = await clickhouseService.validateConnection(config);
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async getTables(req: Request<{}, {}, ClickHouseConnection>, res: Response) {
        try {
            const config = req.body;
            const tables = await clickhouseService.getTables(config);
            res.json(tables);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async getColumns(
        req: Request<{}, {}, ClickHouseConnection & { table: string }>,
        res: Response
    ) {
        try {
            const { table, ...config } = req.body;

            const columns = await clickhouseService.getColumns(config, table);
            res.json(columns);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async previewData(
        req: Request<
            {},
            {},
            ClickHouseConnection & { table: string; columns: string[] }
        >,
        res: Response
    ) {
        try {
            const { table, columns, ...config } = req.body;

            const data = await clickhouseService.previewData(
                config,
                table,
                columns
            );
            res.json(data);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async getTableSchema(
        req: Request<{}, {}, ClickHouseConnection & { table: string }>,
        res: Response
    ) {
        try {
            const { table, ...config } = req.body;
            const schema = await clickhouseService.getTableSchema(
                config,
                table
            );
            res.json(schema);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    //TODOL fix
    async startTransfer(
        req: Request<{}, {}, DataTransferConfig>,
        res: Response
    ) {
        try {
            const config = req.body;
            const status = await clickhouseService.startTransfer(config);
            res.json(status);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async insertData(req: Request<{}, {}, DataTransferConfig>, res: Response) {
        try {
            const config = req.body;
            const status = await clickhouseService.importFromFile(config);
            res.json(status);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async exportToFlatFile(
        req: Request<{}, {}, DataTransferConfig>,
        res: Response
    ) {
        try {
            const config = req.body;
            const stream = await clickhouseService.exportToFlatFile(config);

            if (
                config.source.type !== "clickhouse" ||
                config.target.type !== "flatfile"
            ) {
                throw new Error("Invalid transfer configuration");
            }

            if (!config.source.columns || config.source.columns.length === 0) {
                throw new Error("No columns to export");
            }
            res.setHeader("Content-Type", "text/csv");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${config.source.table}_export.csv"`
            );

            stream.pipe(res);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}

export const ingestionController = new IngestionController();
