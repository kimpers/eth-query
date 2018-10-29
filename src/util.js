const { camelCase, snakeCase } = require('lodash');

const switchCaseObj = (caseFn, obj) =>
  Object.entries(obj).reduce((memo, [key, value]) => {
    memo[caseFn(key)] = value;
    return memo;
  }, {});

const camelCaseObj = obj => switchCaseObj(camelCase, obj);
const snakeCaseObj = obj => switchCaseObj(snakeCase, obj);

module.exports = {
  camelCaseObj,
  snakeCaseObj
};
