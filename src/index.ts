import http from "http";

import App from "./app";
import AuthRoutes from "./routes/auth";
import { PORT } from "./config";

const app = new App([new AuthRoutes()]);

const server = http.createServer(app.expressApp);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${app.environment} mode`);
});
