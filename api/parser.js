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
    return bluebird.map(Object.keys(api.paths), function (key) {
      return bluebird.map(Object.keys(api.paths[key]), function (key2) {
        var method = key2;
        return bluebird.map(Object.keys(api.paths[key][key2].responses), function (key3) {
          var statusCode = key3;
          if (statusCode == "200") {
            var responsePayload = {};
            console.log(key3);
            return bluebird.map(Object.keys(api.paths[key][key2].responses[key3].schema.properties), function (key4) {
              if ('example' in api.paths[key][key2].responses[key3].schema.properties[key4]) {
                console.log('as', key4);
                responsePayload[key4] = api.paths[key][key2].responses[key3].schema.properties[key4].example;
                console.log('asf', responsePayload);
                return responsePayload;
              } else if ('items' in api.paths[key][key2].responses[key3].schema.properties[key4]) {
                console.log("ffffffffffff");
                return bluebird.map(Object.keys(api.paths[key][key2].responses[key3].schema.properties[key4].items.properties), function (key5) {
                  responsePayload[key5] = api.paths[key][key2].responses[key3].schema.properties[key4].items.properties[key5];
                  return responsePayload;
                });
              }
            }).then(function (responsePayload) {
            	console.log(responsePayload);
              console.log("sds", _.uniq(responsePayload));
              var payload = _.uniq(responsePayload);
              var response = createMockResponse(payload);
              console.log("sdsadsds", response);
              return response
            });
          }
        });
      });
    });
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

