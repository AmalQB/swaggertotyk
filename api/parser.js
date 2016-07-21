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
      console.log("sdasd",api);
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
              var apis = api.paths[paths][method].responses[statusCode];
              var keys = "";
              responsePayload = {};
             return payload(apis,keys)
             .then(function(payload){
              console.log("sdasd",payload)
              var response = createMockResponse(payload);
              return response;
             });
            }
          });
        });
      });
    });
  }
  function payload(apis,keys) {
         var val = keys ;
         var finalPayload = {};
         finalPayload[val] = {};
    console.log('asd',keys);
    return bluebird.reduce(Object.keys(apis.schema.properties),function (responsePayload, props) {   
      console.log(responsePayload);
      if ('example' in apis.schema.properties[props]) {
          if (val === "") {
          responsePayload[props] = "";
          responsePayload[props] = responsePayload[props] +  apis.schema.properties[props].example;
          }
          else {
        responsePayload[val] = finalPayload[val] ;
        responsePayload[val][props] = "" ;
        responsePayload[val][props] = responsePayload[val][props] + apis.schema.properties[props].example;
           }
        return responsePayload;
      } else if ('items' in apis.schema.properties[props]) {
        keys = keys + '/' + props
        res = apis.schema.properties[props]
        res.schema = res.items ;
        delete res.items; 
       return payload(res,keys);    
      }
    },{});
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
      "text": responsePayload
    },
    "redirectURL": "",
    "bodySize": 0,
    "headersSize": 0
  };
  return harPayload;
}
