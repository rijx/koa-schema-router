module.exports = {
  plugins: [
    ["@semantic-release/commit-analyzer", { preset: "eslint" }],
    "@semantic-release/npm",
    "@semantic-release/git"
  ]
};
