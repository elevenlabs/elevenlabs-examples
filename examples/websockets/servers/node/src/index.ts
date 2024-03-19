import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { websocket } from './websocket';

const port = Number(process.env.PORT) || 3001;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

(async () => {
  app.use(cors());
  app.use(helmet());
  app.use(express.json());

  io.on('connection', (socket) => {
    socket.on('init', (text) => {
      console.log('socket init');
      websocket(text, (audio) => {
        socket.send(audio);
      });
    });
  });

  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  server.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
})();
