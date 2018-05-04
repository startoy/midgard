/* .eslintrc.js */
module.exports = {
    root: true, /* restrict to this level */
    extends: [
      "eslint-config-playlyfe",
      "eslint-config-playlyfe/rules/testing",
    ],
  
    plugins: [
      "eslint-plugin-playlyfe",
    ],
    "extends": "google"
  };