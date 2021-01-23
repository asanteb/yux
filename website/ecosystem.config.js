module.exports = {
  apps : [
    {
      name: 'yux-dev',
      script: 'server/index.js',
      watch: true,
      env: {
        'NODE_ENV': 'dev'
      }
    },
    {
      name: 'yux-prod',
      script: 'server/index.js',
      watch: false,
      env: {
        'NODE_ENV': 'prod'
      }
    },
    {
      name: 'yux-test',
      script: 'server/index.js',
      watch: false,
      env: {
        'NODE_ENV': 'test'
      }
    },
    {
      name: 'yux-latest',
      script: 'server/index.js',
      watch: false,
      env: {
        'NODE_ENV': 'latest'
      }
    },
  ],
};
