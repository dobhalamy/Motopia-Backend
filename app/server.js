const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const timeout = require('connect-timeout');
const Agendash = require('agendash');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRouter = require('./routes/auth');
const amountRouter = require('./routes/approved-amount');
const purchasesRouter = require('./routes/car-purchases');
const userRouter = require('./routes/cms-users');
const dealerRouter = require('./routes/dealer-info');
const financePinsRouter = require('./routes/finance-pins');
const promoRouter = require('./routes/promo');
const vectorImageRouter = require('./routes/vector-images');
const vehiclePinsRouter = require('./routes/vehicle-pins');
const soapRouter = require('./routes/soap');
const cardsRouter = require('./routes/home-card');
const vehiclesRouter = require('./routes/vehicles');
const stripeRouter = require('./routes/stripe');
const bodyTypeRouter = require('./routes/body-types');
const savingsRouter = require('./routes/saving-payments');
const featuresRouter = require('./routes/features');
const prospectRouter = require('./routes/prospect-vehicles');
const heroRouter = require('./routes/hero-image');
const rdsHome = require('./routes/rideshare-home');
const chargeRouter = require('./routes/authorize');
const carouselRouter = require('./routes/carousel');
const rideShareSeoRouter = require('./routes/ride-share-seo');
const carouselSettingRouter = require('./routes/carousel-setting');
const reportRouter = require('./routes/user-mvr');
const heroCarouselSettingRouter = require('./routes/hero-carousel-setting');
const pricesRouter = require('./routes/prices');
const categoryRouter = require('./routes/category');
const lifeStyleRouter = require('./routes/lifeStyle');
const menuItemsRouter = require('./routes/menuItems');
const promoCodeRouter = require('./routes/promotion');
const deliveryRouter = require('./routes/delivery');
const syncLimitRouter = require('./routes/syncLimit');
const WarrantyRouter = require('./routes/warranty');
const Vehicle360Router = require('./routes/vehicle-360');
const rdsComapnyRouter = require('./routes/ride-share-companies');
const blogRouter = require('./routes/blog-post');
const adCampaign = require('./routes/ad-campaign');
const plaidRouter = require('./routes/plaid');

require('./middlewares/auth');
require('dotenv').config();
const {
  checkSchedule,
  scheduleAdCampaignNotification,
} = require('./helpers/schedule');
const { errorMiddleware } = require('./middlewares/error-handler');
const { startAgenda, agenda } = require('./helpers/agenda');
const { AGENDA_TIME_FRAMES } = require('./constants');

const app = express();

const checkIp = (req, res, next) => {
  const ip = req.connection.remoteAddress;
  console.info('Request from ', ip.split(':')[3]);
  next();
};

const httpServer = http.createServer(app);

if (process.env.NODE_ENV === 'development') {
  const options = {
    swaggerDefinition: {
      // Like the one described here: https://swagger.io/specification/#infoObject
      info: {
        title: 'Motopia API',
        version: '0.0.1',
        description: 'Motopia CMS project back-end API',
      },
      basePath: '/v1',
      security: [],
      tags: [
        {
          name: 'Auth',
          description: 'Authorization',
        },
        {
          name: 'Authorize',
          description: 'Payment handling',
        },
        {
          name: 'Admin',
          description: 'Operations with admins',
        },
        {
          name: 'Approved amount',
          description:
            'Save or deleting Approved amount. All routes are <strong>PUBLIC</strong>. For POST look to README.md. Automatic deleting in 30 days.',
        },
        {
          name: 'Blog',
          description: 'Blog posts',
        },
        {
          name: 'Car purchase',
          description: 'Car purchase Requests',
        },
        {
          name: 'Dealer info',
          description: 'Information about dealer',
        },
        {
          name: 'Finance pins',
          description: 'Operations with finance pins',
        },
        {
          name: 'Vehicle pins',
          description: 'Operations with vehicle pins',
        },
        {
          name: 'Promo blocks',
          description: 'Operations with promo blocks',
        },
        {
          name: 'Promo Codes',
          description: 'Operations with promo codes',
        },
        {
          name: 'Vector images',
          description: 'Operations with vector images (hero)',
        },
        {
          name: 'Home cards',
          description: 'Operations with cards at home page',
        },
        {
          name: 'Vehicles',
          description: 'Operations with vehicles',
        },
        {
          name: 'Features',
          description: "Operations with vehicle's features",
        },
        {
          name: 'Saving down & monthly payment',
          description: 'Operations to save payments amount',
        },
        {
          name: "Prospect's vehicles",
          description: "List of prospect's saved vehicles with DP and MP",
        },
        {
          name: 'Hero images',
          description: 'Operations with home page images',
        },
        {
          name: 'MVR',
          description: 'Operations with User reports',
        },
        {
          name: 'Prices',
          description:
            'Operations with gomotopia prices. Lock down a deal payment, Minimal downpayment, Retail deposit',
        },
        {
          name: 'Category',
          description: 'Handles Rideshare categories',
        },
        {
          name: 'lifeStyle',
          description: 'Handles LifeStyle categories',
        },
        {
          name: 'SyncLimit',
          description: 'Handles vehicle sync limit',
        },
        {
          name: 'warranty images',
          description: 'Handles warranty images',
        },
        {
          name: 'Web 360 vehicle',
          description: 'Handles operations with 360 view',
        },
        {
          name: 'Ride Share Companies',
          description: 'Handles operations with Ride Share Companies',
        },
      ],
    },
    // List of files to be processes. You can also set globs './routes/*.js'
    apis: ['./app/definitions/*.js', './app/routes/*.js'],
  };

  const specs = swaggerJsdoc(options);

  app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}
const startServer = port => {
  app
    .use(checkIp)
    .use(timeout('300s'))
    .use(helmet())
    .use(express.static(__dirname + '/assets'))
    .use(passport.initialize())
    .use(passport.session())
    // NOTE: Uncomment if you need connect to authorize
    // .set("view engine", "pug")
    // .set("views", "./app/views")
    .use('*', cors())
    .use(
      morgan(':method -- :url -- :status -- :response-time ms -- :date[clf]')
    )
    .use(
      bodyParser.json({
        limit: '50mb',
      })
    )
    .use(
      bodyParser.urlencoded({
        extended: false,
        limit: '50mb',
      })
    )

    .use('/v1/amount', amountRouter)
    .use('/v1/auth', authRouter)
    .use('/v1/blog-posts', blogRouter)
    .use('/v1/body-types', bodyTypeRouter)
    .use('/v1/car-purchases', purchasesRouter)
    .use('/v1/cards', cardsRouter)
    .use('/v1/carousel', carouselRouter)
    .use('/v1/carousel-setting', carouselSettingRouter)
    .use('/v1/category', categoryRouter)
    .use('/v1/chargeCards', chargeRouter)
    .use('/v1/dealer-info', dealerRouter)
    .use('/v1/delivery', deliveryRouter)
    .use('/v1/dm-payment', savingsRouter)
    .use('/v1/features', featuresRouter)
    .use('/v1/finance-pins', financePinsRouter)
    .use('/v1/hero', heroRouter)
    .use('/v1/rds-list', rdsHome)
    .use('/v1/hero-carousel-setting', heroCarouselSettingRouter)
    .use('/v1/lifeStyle', lifeStyleRouter)
    .use('/v1/menuItems', menuItemsRouter)
    .use('/v1/mvr', reportRouter)
    .use('/v1/prices', pricesRouter)
    .use('/v1/promo', promoRouter)
    .use('/v1/promotion', promoCodeRouter)
    .use('/v1/prospect-vehicles', prospectRouter)
    .use('/v1/ride-share-companies', rdsComapnyRouter)
    .use('/v1/ride-share-seo', rideShareSeoRouter)
    .use('/v1/soap', soapRouter)
    .use('/v1/stripe', stripeRouter)
    .use('/v1/svg', vectorImageRouter)
    .use('/v1/syncLimit', syncLimitRouter)
    .use('/v1/users', userRouter)
    .use('/v1/vehicle-pins', vehiclePinsRouter)
    .use('/v1/vehicles', vehiclesRouter)
    .use('/v1/warranty', WarrantyRouter)
    .use('/v1/web360', Vehicle360Router)
    .use('/v1/inventory', adCampaign)
    .use('/v1/plaid', plaidRouter)
    .use('/dash', Agendash(agenda))

    .use(errorMiddleware)
    .all('/*', function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      next();
    });

  // Reschedule losten jobs
  checkSchedule();

  // Agenda is running
  startAgenda();
  scheduleAdCampaignNotification(AGENDA_TIME_FRAMES.midnightAfter30Min);

  httpServer.listen(port, () => {
    console.info('Server is on ' + port);
    console.info('NODE_ENV:', process.env.NODE_ENV);
  });
  httpServer.timeout = 60000;
};

module.exports = startServer;
