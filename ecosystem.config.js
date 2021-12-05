module.exports = {
  apps: [
    {
      name: "yux-dev",
      script: "server.js",
      watch: true,
      env: {
        NODE_ENV: "dev",
      },
    },
    {
      name: "yux-prod",
      script: "server.js",
      watch: false,
      env: {
        NODE_ENV: "prod",
      },
    },
    {
      name: "yux-test",
      script: "server.js",
      watch: false,
      env: {
        NODE_ENV: "test",
      },
    },
    {
      name: "yux-latest",
      script: "server.js",
      watch: false,
      env: {
        NODE_ENV: "latest",
      },
    },
  ],
};
