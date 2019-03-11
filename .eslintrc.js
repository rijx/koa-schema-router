module.exports = {
  extends: ["eslint:recommended", "prettier"],
  plugins: ["prettier", "jest"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2018
  },
  env: {
    es6: true,
    node: true,
    "jest/globals": true
  },
  rules: {
    "prettier/prettier": "error"
  }
};
