var request      = require("request")
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
  , app          = express()


//Initiate winston logging please
const logger = require("winston")
var consoleLoggingConfig = {
      timestamp: true,
      level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info",
      handleExceptions: true,
      humanReadableUnhandledException: true
}
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, consoleLoggingConfig)
logger.info('Winston logging initiated', consoleLoggingConfig)
module.exports=logger

app.use(helpers.rewriteSlash);
app.use(morgan("combined", {}));
app.use(metrics);

app.use(express.static("public"));
if(process.env.SESSION_REDIS) {
    logger.info('Using the redis based session manager');
    app.use(session(config.session_redis));
}
else {
    logger.info('Using local session manager');
    app.use(session(config.session));
}

//Include middleware router to fail pages based on config
app.use(helpers.intermittentRequestFailure)

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
