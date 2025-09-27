import { feathers } from '@feathersjs/feathers'
import express, {
  rest,
  json,
  urlencoded,
  cors,
  serveStatic,
  notFound,
  errorHandler
} from '@feathersjs/express'
import 'dotenv/config';
import configuration from '@feathersjs/configuration'
import socketio from '@feathersjs/socketio'
import { setupScrapOperationsCron } from "./jobs/scrapOperationsCron";
import type { Application } from './declarations'
import { configurationValidator, configAuthentication } from './configuration'
import { logger } from './logger'
import { logError } from './hooks/log-error'
import { postgresql } from './postgresql'
import { authentication } from './authentication'
import { services } from './services/index'
import { channels } from './channels'


const app: Application = express(feathers())

// Load app configuration
app.configure(configuration(configurationValidator))

// -------------------------
// CORS seguro
// -------------------------
const ENV = process.env.NODE_ENV || 'development'

const corsOptions = {
  origin: [
    'https://temp-empregabilidade-frontend.eorpdr.easypanel.host',
		'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};


// Aplica CORS no Express (REST)
app.use(cors(corsOptions))
app.options('*', cors(corsOptions));
app.use(json({ limit: '10mb' }))
app.use(urlencoded({ extended: true, limit: '10mb' }))


// Host the public folder
app.use('/', serveStatic(app.get('public')))

// -------------------------
// REST e WebSocket
// -------------------------
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: [
        'https://colab-telles-empregabilidade-frontend.onrender.com',
        'https://temp-empregabilidade-frontend.eorpdr.easypanel.host'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  })
);

app.configure(postgresql)
app.set('authentication', configAuthentication)
app.configure(authentication)

app.configure(services)

// Logging de todas as requisições
app.use((req, res, next) => {
  console.log('Request:', req.method, req.url)
  next()
})

app.configure(channels)

// Configure a middleware for 404s and the error handler
app.use(notFound())
app.use(errorHandler({ logger }))

// Hooks globais
app.hooks({
  around: { all: [logError] },
  before: {},
  after: {},
  error: {}
})

app.hooks({
  setup: [],
  teardown: []
})

// Inicia cron jobs
setupScrapOperationsCron(app);

export { app }
