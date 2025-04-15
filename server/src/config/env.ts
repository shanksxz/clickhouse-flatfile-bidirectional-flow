import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const envSchema = z.object({
	PORT: z.number().default(8787),
	CLICKHOUSE_USER: z.string().default("default"),
	CLICKHOUSE_PASSWORD: z.string().default(""),
	CLICKHOUSE_HOST: z.string().default("localhost"),
	CLIENT_URL: z.string().default("http://localhost:3000"),
});

const env = envSchema.parse(process.env);

export const PORT = env.PORT;
export const CLICKHOUSE_USER = env.CLICKHOUSE_USER;
export const CLICKHOUSE_PASSWORD = env.CLICKHOUSE_PASSWORD;
export const CLICKHOUSE_HOST = env.CLICKHOUSE_HOST;
export const CLICKHOUSE_URL = `http://${CLICKHOUSE_USER}:${CLICKHOUSE_PASSWORD}@${CLICKHOUSE_HOST}:8123`;
export const CLIENT_URL = env.CLIENT_URL;
