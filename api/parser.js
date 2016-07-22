var request = require("request");
var async = require("async");
var bluebird = require('bluebird');
var SwaggerParser = require('swagger-parser');
var yaml = require('yamljs');
var _ = require('lodash');
module.exports = function swaggerParse(body) {
  var res = [];
  var yamlDef = yaml.parse(body);
  // console.log(yamlDef);
  return SwaggerParser.validate(yamlDef).then(function (api) {
    console.log("sdasd", api);
    // Check Endpoint's Scheme
    var scheme = "";
    if (api.schemes.length == 1) {
      scheme = api.schemes[0];
    } else {
      scheme = "https";
    }
    // Formulate Base API Endpoint
    var host = api.host;
    var basePath = api.basePath;
    var baseEndpoint = scheme + "://" + host + basePath;
    // Endpoints
    return bluebird.map(Object.keys(api.paths), function (paths) {
       // Gets url paths of APIs
      return bluebird.map(Object.keys(api.paths[paths]), function (method) { 
        // Gets request method for each url
        return bluebird.map(Object.keys(api.paths[paths][method].responses), function (statusCode) { 
          if (statusCode == "200") {  
            // checks the status codes 
            var apis = api.paths[paths][method].responses[statusCode];
            var key = "";
            responsePayload = {};
            return payload(apis, key).then(function (payload) {
              var response = createMockResponse(payload);
              return response;
            });
          }
        });
      });
    });
  });
}
function payload(apis, key) {   
  // returns whole API as payload
  var finalPayload = {};
  finalPayload[key] = {}; 
  return bluebird.reduce(Object.keys(apis.schema.properties), function (responsePayload, props) {
    // Iterates through each properties and stores APIS in responsePayload
    console.log(responsePayload);
    if ('example' in apis.schema.properties[props]) {
      if (key === "") {
        responsePayload[props] = "";
        responsePayload[props] = responsePayload[props] + apis.schema.properties[props].example;
      } else {
        responsePayload[key] = finalPayload[key];
        responsePayload[key][props] = "";
        responsePayload[key][props] = responsePayload[key][props] + apis.schema.properties[props].example;
      }
      console.log("reds", responsePayload);
      return responsePayload;
    } else if ('items' in apis.schema.properties[props]) {
      key = key + '/' + props
      res = apis.schema.properties[props]
      res.schema = res.items;
      delete res.items;
      return payload(res, key);
    }
  }, responsePayload);
}

function createMockResponse(responsePayload) {
  //Retiurns final payload after formatting
  var harPayload = {
    "status": 200,
    "statusText": "OK",
    "httpVersion": "HTTP/1.1",
    "headers": [],
    "cookies": [],
    "content": {
      "mimeType": "application/json",
      "text": responsePayload
    },
    "redirectURL": "",
    "bodySize": 0,
    "headersSize": 0
  };
  return harPayload;
}
