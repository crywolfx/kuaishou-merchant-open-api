const colors = require('colors/safe');
module.exports = {
  success: (str) => console.log(colors.green(str)),
  error: (str) => console.log(colors.red(str)),
  info: (str) => console.log(colors.white(str)),
  warn: (str) => console.log(colors.yellow(str)),
  rainbow: (str) => console.log(colors.rainbow(str)),
};