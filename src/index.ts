import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./utils/swaggerConfig.js";
import postRoutes from "./routes/postRoutes.js";

const PORT = 3000;
const app = express();
const specs = swaggerJsdoc(swaggerOptions);

app.use("/posts", postRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
