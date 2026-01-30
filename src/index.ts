import express from "express";
import postRoutes from "./routes/postRoutes/posts.route.js";

const PORT = 3000;
const app = express();

app.use("/posts", postRoutes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
