var request = require("request");
var async = require("async");
var bluebird = require('bluebird');
var SwaggerParser = require('swagger-parser');
var yaml = require('yamljs');
var _ = require('lodash');
module.exports = function swaggerParse(body) {
    var res = [];
    var yamlDef = yaml.parse(body);
    return SwaggerParser.validate(yamlDef).then(function (api) {
      console.log(api);
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
      var finalPayload = [];
      // Endpoints
      return bluebird.map(Object.keys(api.paths), function (paths) {
        return bluebird.map(Object.keys(api.paths[paths]), function (method) {
          return bluebird.map(Object.keys(api.paths[paths][method].responses), function (statusCode) {
            if (statusCode == "200") {
              console.log('DSfadfdfaaaaaaaaaaaaaaaaaaaaaa')
             return payload(paths,method,statusCode,api)
             .then(function(payload){
              return payload ;
             })
            }
          });
        });
      });
    });
  }
  function payload(path,method,statusCode,api) {
    console.log("ASDdddddddddd");
    var responsePayload = {};
    return bluebird.reduce(Object.keys(api.paths[path][method].responses[statusCode].schema.properties), function (responsePayload, props) {
      responsePayload[props] = "";
      if ('example' in api.paths[path][method].responses[statusCode].schema.properties[props]) {
        responsePayload[props] = responsePayload[props] + api.paths[path][method].responses[statusCode].schema.properties[props].example;
        return responsePayload;
      } else if ('items' in api.paths[path][method].responses[statusCode].schema.properties[props]) {
        return bluebird.map(Object.keys(api.paths[path][method].responses[statusCode].schema.properties[props].items.properties), function (props1) {
          responsePayload[props1] = responsePayload[props1] + api.paths[path][method].responses[statusCode].schema.properties[props].items.properties[props].items.properties[props1];
          return responsePayload;
        });
      }
    }, {}).then(function (responsePayload) {
      console.log("dsdsad", responsePayload);
      var response = createMockResponse(responsePayload);
      return response;
    });
  }

function createMockResponse(responsePayload) {
  var harPayload = {
    "status": 200,
    "statusText": "OK",
    "httpVersion": "HTTP/1.1",
    "headers": [],
    "cookies": [],
    "content": {
      "mimeType": "application/json",
      "text": JSON.stringify(responsePayload)
    },
    "redirectURL": "",
    "bodySize": 0,
    "headersSize": 0
  };
  return harPayload;
}
