'use strict';

///@TODO: This can be it's own module

module.exports = isTestEnv();

function isTestEnv() {
  if (process.env.NODE_ENV === 'test') {
    return true;
  }
  if (process.env.npm_lifecycle_event === 'test') {
    return true;
  }
  return false;
}