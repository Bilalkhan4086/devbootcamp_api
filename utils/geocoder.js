const nodegeocoder = require("node-geocoder");
require("dotenv").config(__dirname);

console.log("geo endoer =", process.env.GEOCODE_API);
const options = {
  provider: process.env.GEOCODE_PROVIDER,
  httpAdapter: "http",
  apiKey: process.env.GEOCODE_API,
  formatter: null,
};

const geocoder = nodegeocoder(options);

module.exports = geocoder;
