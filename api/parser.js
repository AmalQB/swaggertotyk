var request = require("request");
var async = require("async");
var bluebird = require('bluebird');
var SwaggerParser = require('swagger-parser');
var yaml = require('yamljs');

module.exports = function swaggerParse(body) {
  var res = [];
  var yamlDef = yaml.parse(body);
  return SwaggerParser.validate(yamlDef)
    .then(function(api) {
      // Check Endpoint's Scheme
      var scheme = "";
      if (api.schemes.length == 1) {
        scheme = api.schemes[0];
      }
      else {
        scheme = "https";
      }
      // Formulate Base API Endpoint
      var host = api.host;
      var basePath = api.basePath;
      var baseEndpoint = scheme + "://" + host + basePath;
      var finalPayload = [];
      // Endpoints
      return new bluebird(function(resolve, reject) {
        async.eachSeries(Object.keys(api.paths), function (key, next) {
        console.log('kefsggggggggggggggggggggggggggggy',key);
        // Methods
        async.eachSeries(Object.keys(api.paths[key]), function (key2, next2) {
          var method = key2;
          console.log('method',method);
          var responsePayload = {};
          // Responses
          async.eachSeries(Object.keys(api.paths[key][key2].responses), function (key3, next3) {
            //console.log(key3);
            var statusCode = key3;
            if (statusCode == "200") {
              async.eachSeries(Object.keys(api.paths[key][key2].responses[key3].schema.properties), function (key4, next4) {
                if ('example' in api.paths[key][key2].responses[key3].schema.properties[key4])
                {
                console.log(key4);
                responsePayload[key4] = api.paths[key][key2].responses[key3].schema.properties[key4].example;
                }
                else if ('items' in api.paths[key][key2].responses[key3].schema.properties[key4]){
              async.eachSeries(Object.keys(api.paths[key][key2].responses[key3].schema.properties.items.properties), function (key5, next5) {
                      console.log(key5);
                    responsePayload[key5] = api.paths[key][key2].responses[key3].schema.properties[key4].items.properties[key5];
                  next5();  
                  });
               }
               next4(); 
              }, function(err) {
                console.log(responsePayload);
                 var response = createMockResponse(responsePayload);
                 console.log('response',response);
                 finalPayload.push(response);
                 next3(next2(next()));
              });
            }
          });
        });
      }, function(err) {
        if(err) {
          reject(err);
        } else {
          resolve(finalPayload);
        }
      });
    });
    });
}
function createMockResponse(responsePayload) {
  var harPayload =
  {
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
  console.log(harPayload);
  return harPayload;
}