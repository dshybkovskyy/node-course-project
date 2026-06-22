import dotenv from "dotenv";
dotenv.config();

import { getDb } from "./db/connection.ts";
import app from "./app.ts";

await getDb();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}`);
});
