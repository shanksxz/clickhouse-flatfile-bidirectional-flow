import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import { PORT, CLIENT_URL } from "./config/env";
import ingestionRoutes from "./routes/ingestion.route";
const app = express();

app.use(
	cors({
		origin: CLIENT_URL,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.use("/api", ingestionRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack);
	res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
