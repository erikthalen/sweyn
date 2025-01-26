module.exports = {
  apps: [
    {
      name: 'APP_NAME',
      script: 'pnpm',
      automation: false,
      args: 'run start',
      instances: '1',
    },
  ],
  deploy: {
    production: {
      key: '/path/to/.ssh/publickey',
      user: 'sweyn',
      host: ['123.0.0.1'],
      ssh_options: 'StrictHostKeyChecking=no',
      ref: 'origin/main',
      repo: 'git@github.com:username/repo.git',
      path: '/home/sweyn/sites/APP_NAME',
      'post-setup': 'pnpm install',
      'post-deploy': 'pm2 start ecosystem.config.cjs',
    },
  },
}
