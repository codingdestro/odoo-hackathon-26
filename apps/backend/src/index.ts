import express from "express";
import cors from "cors";
import router from "./routes";
import { errorHandler } from "./util/error-handler";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/api", router);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
