module.exports = {
  apps: [
    {
      name: "yux-dev",
      script: "index.js",
      watch: true,
      env: {
        NODE_ENV: "dev",
      },
    },
    {
      name: "yux-prod",
      script: "index.js",
      watch: false,
      env: {
        NODE_ENV: "prod",
      },
    },
    {
      name: "yux-test",
      script: "index.js",
      watch: false,
      env: {
        NODE_ENV: "test",
      },
    },
    {
      name: "yux-latest",
      script: "index.js",
      watch: false,
      env: {
        NODE_ENV: "latest",
      },
    },
  ],
};
