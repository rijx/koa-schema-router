const assert = require("assert");
const axios = require("axios");

async function testGet(baseUrl) {
  const { data } = await axios.get(`${baseUrl}/test`);

  assert.equal(data, "it works");
}

async function testParamCoerceTypes(baseUrl) {
  const { data } = await axios.get(`${baseUrl}/test/123`);

  assert.equal(data, "The number is 123");
}

async function runTests(baseUrl) {
  await testGet(baseUrl);
  await testParamCoerceTypes(baseUrl);
}

module.exports = runTests;
