var newrelic     = require("newrelic")
  , instana      = require('instana-nodejs-sensor')
  , request      = require("request")
  , express      = require("express")
  , morgan       = require("morgan")
  , path         = require("path")
  , bodyParser   = require("body-parser")
  , async        = require("async")
  , cookieParser = require("cookie-parser")
  , session      = require("express-session")
  , config       = require("./config")
  , helpers      = require("./helpers")
  , cart         = require("./api/cart")
  , catalogue    = require("./api/catalogue")
  , orders       = require("./api/orders")
  , user         = require("./api/user")
  , metrics      = require("./api/metrics")
  , common       = require('winston/lib/winston/common')
  , app          = express()


//App configs
//Ensure x-forwarded-for is looked at for the IP address
app.set('trust proxy', true)

//Initiate Instana sensor
instana({
  tracing: {
    enabled: false
  }
});

//Initiate winston logging please
const logger = require('winston');

function myFormat(options) {
  options.formatter = null
  options.label = helpers.getSessionId(logger.req)
  return common.log(options);
}

var consoleLoggingConfig = {
      timestamp: true,
      level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info",
      handleExceptions: true,
      humanReadableUnhandledException: true,
      formatter: myFormat
}

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, consoleLoggingConfig)
logger.info('Winston logging initiated', consoleLoggingConfig)
app.use(helpers.attachReqToLogger)
module.exports=logger
//End of winston logging initiation

app.use(helpers.rewriteSlash);

//Configure morgan logging
morgan.token('sessionId', function getSessionId (req) { return helpers.getSessionId(req); })
app.use(morgan(morgan.combined + ' sessionId=:sessionId responseTimeMs=:response-time'));


app.use(metrics);

if(process.env.SESSION_REDIS) {
    logger.info('Using the redis based session manager');
    app.use(session(config.session_redis));
}
else {
    logger.info('Using local session manager');
    app.use(session(config.session));
}

app.use(express.static("public"));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(helpers.sessionMiddleware);

var domain = "";
process.argv.forEach(function (val, index, array) {
  var arg = val.split("=");
  if (arg.length > 1) {
    if (arg[0] == "--domain") {
      domain = arg[1];
      logger.info("Setting domain to:", domain);
    }
  }
});

//Include middleware router to fail pages based on config
app.use(helpers.intermittentRequestFailure)

/* Mount API endpoints */
app.use(cart);
app.use(catalogue);
app.use(orders);
app.use(user);

app.use(helpers.errorHandler);

var server = app.listen(process.env.PORT || 8079, function () {
  var port = server.address().port;
  logger.info("App now running in %s mode on port %d", app.get("env"), port);
});
