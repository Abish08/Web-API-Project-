// Main entry point - starts the Express server
import expressApp from "./src/app";
import { requireEnv, SERVER_PORT } from "./src/configs/constant";
import { initializeDatabase } from "./src/database/mongodb";

requireEnv();

// Connect to MongoDB database
initializeDatabase();

// Start listening on specified port
expressApp.listen(SERVER_PORT, () => {
  console.log(` Server running at: http://localhost:${SERVER_PORT}`);
});
