// Import modules
import express from 'express';
import cors from 'cors';
import path from 'path';

// Import Express middleware
import helmet from 'helmet';
import serveStatic from 'serve-static';

// Read the environment variables
const {
  ENVIRONMENT,
  SERVER_PORT,
} = process.env;

// Instantiate the app's HTTP server
const server = express();

// Set middleware (order matters)
server.use(helmet({
  contentSecurityPolicy: {  
    useDefaults: true,
    directives: { 
      'connect-src': ["'self'", 'localhost:*', 'api.talentsourcery.io']
    },
  },
})); // Sets response headers securely
const corsOptions = { origin: '*' };
server.use(cors(corsOptions)); // Use this after the variable declaration

// Serve 'dist' folder to clients
const distUrl = new URL('./dist', import.meta.url);
const distPath = distUrl.pathname;
server.use(serveStatic(distPath));

// Set unique route
server.get('/{*splat}', function (_req, res) {
  res.sendFile(path.join(distPath, '/index.html'));
});

server.listen(SERVER_PORT, () => {
  console.log(`${ENVIRONMENT} environment`);
  console.log(`Frontend server is listening on port ${SERVER_PORT}`);
});
