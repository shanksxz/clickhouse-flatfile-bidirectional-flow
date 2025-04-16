import { createClient } from "@clickhouse/client";
import { CLICKHOUSE_HOST, CLICKHOUSE_PASSWORD, CLICKHOUSE_USER } from "./env";

export const client = createClient({
	host: CLICKHOUSE_HOST,
	username: CLICKHOUSE_USER,
	password: CLICKHOUSE_PASSWORD,
});

