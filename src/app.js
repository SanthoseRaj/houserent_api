const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const routes = require('./routes');
const paymentController = require('./controllers/paymentController');
const swaggerSpec = require('./docs/swagger');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors({ origin: '*' }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/public', express.static(path.join(process.cwd(), 'public')));
app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});
app.use(
  '/api-docs',
  (_req, res, next) => {
    // Swagger UI uses an inline bootstrap script, so this route needs a relaxed CSP.
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' https: 'unsafe-inline'; font-src 'self' https: data:;",
    );
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
  }),
);

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Rental management API is running',
  });
});

app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
