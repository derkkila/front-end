(function (){
  'use strict';

  var request = require("request");
  var logger = require("winston");
  var fs = require("fs");
  var helpers = {};

  /* Public: errorHandler is a middleware that handles your errors
   *
   * Example:
   *
   * var app = express();
   * app.use(helpers.errorHandler);
   * */

  helpers.errorHandler = function(err, req, res, next) {
    logger.error(logger.exception.getAllInfo(err))
    
    var ret = {
      message: err.message,
      error:   err
    };
    res.
      status(err.status || 500).
      send("Uh oh! Something went terribly wrong here. My Bad!");
  };

  helpers.sessionMiddleware = function(req, res, next) {
    if(!req.cookies.logged_in) {
      res.session.customerId = null;
    }
  };

  /* Responds with the given body and status 200 OK  */
  helpers.respondSuccessBody = function(res, body) {
    helpers.respondStatusBody(res, 200, body);
  }

  /* Public: responds with the given body and status
   *
   * res        - response object to use as output
   * statusCode - the HTTP status code to set to the response
   * body       - (string) the body to yield to the response
   */
  helpers.respondStatusBody = function(res, statusCode, body) {
    res.writeHeader(statusCode);
    res.write(body);
    res.end();
  }

  /* Responds with the given statusCode */
  helpers.respondStatus = function(res, statusCode) {
    res.writeHeader(statusCode);
    res.end();
  }

  /* Rewrites and redirects any url that doesn't end with a slash. */
  helpers.rewriteSlash = function(req, res, next) {
   if(req.url.substr(-1) == '/' && req.url.length > 1)
       res.redirect(301, req.url.slice(0, -1));
   else
       next();
  }

  /* Public: performs an HTTP GET request to the given URL
   *
   * url  - the URL where the external service can be reached out
   * res  - the response object where the external service's output will be yield
   * next - callback to be invoked in case of error. If there actually is an error
   *        this function will be called, passing the error object as an argument
   *
   * Examples:
   *
   * app.get("/users", function(req, res) {
   *   helpers.simpleHttpRequest("http://api.example.org/users", res, function(err) {
   *     res.send({ error: err });
   *     res.end();
   *   });
   * });
   */
  helpers.simpleHttpRequest = function(url, res, next) {
    request.get(url, function(error, response, body) {
      if (error) return next(error);
      helpers.respondSuccessBody(res, body);
    }.bind({res: res}));
  }

  /* TODO: Add documentation */
  helpers.getCustomerId = function(req, env) {
    // Check if logged in. Get customer Id
    var logged_in = req.cookies.logged_in;

    // TODO REMOVE THIS, SECURITY RISK
    if (env == "development" && req.query.custId != null) {
      return req.query.custId;
    }

    if (!logged_in) {
      if (!req.session.id) {
        throw new Error("User not logged in.");
      }
      // Use Session ID instead
      return req.session.id;
    }

    return req.session.customerId;
  }

  /* Allows for us to specify random configurations for the app my dropping files in the ./config/ directory */
  helpers.hasConfig = function(config) {
    return fs.existsSync("./runtime_config/"+config)
  }

  /* This function will trigger a 500 response to the user for a random X% of the requests where X is the number specified in the request_failure_percentage config file */
  helpers.intermittentRequestFailure = function(req, res, next) {
    var failurePercentage = NaN
    try {
      var file_str = fs.readFileSync("./runtime_config/request_failure_percentage", "utf8")
      failurePercentage = parseInt(file_str, 10)

    } catch(err) {
      //Assuming the error we catch is associated to the inability to read or parse the file
    }

   if (isNaN(failurePercentage)) return next();

   if (failurePercentage < 0 || failurePercentage > 100) {
    logger.warn("Ignoring failurePercentage specified at ./runtime_config/request_failure_percentage because it is not between 0 and 100. Value is " + failurePercentage)
    return next();
   }

   var randomNum = Math.floor(Math.random()*101)   
   if (randomNum > failurePercentage) return next();

   return next(new Error("Failed to process request at this time. The flux dependecy is unavailable"));
  }

  module.exports = helpers;
}());
