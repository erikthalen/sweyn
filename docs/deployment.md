# Deployment

This guide provides a step-by-step approach to deploying a Sweyn app on a DigitalOcean droplet. It covers everything from setting up the server to configuring PM2 and deploying the application.

### Prerequisites

1. A DigitalOcean droplet.
2. A GitHub account with the repository for the Sweyn application.

## Step 1: Initial Server Setup (for a new server)

If this is a new server that does not already have the Sweyn app installed, follow these steps to set up the server environment:

**Run the server setup script**:

```bash
curl -sLo tmp.sh https://raw.githubusercontent.com/erikthalen/sweyn/refs/heads/main/scripts/server-setup.sh && bash tmp.sh && rm tmp.sh
```

This script will:

- **Create a new user**: The script creates a user named `sweyn` and adds it to the `sudo` group for administrative access.
- **Install required packages**: It installs necessary software packages for running the Sweyn application.
- **Configure firewall**: It sets up the firewall to allow SSH, HTTP, and HTTPS traffic, ensuring that the server can accept web traffic and remote connections.
- **Generate SSH keys**: It creates an SSH key pair, which is used to connect securely to GitHub for cloning the app’s repository.

After the script finishes running, the server will be ready for deploying Sweyn apps.

## Step 2: App-Specific Setup

For each Sweyn application that you want to deploy, you will need to run the deployment setup script:

```bash
curl -sLo tmp.sh https://raw.githubusercontent.com/erikthalen/sweyn/refs/heads/main/scripts/deploy-setup.sh && bash tmp.sh && rm tmp.sh
```

This script will:

- **Configure Nginx**: It sets up Nginx as a reverse proxy to expose the app to the web. Nginx will handle incoming requests and forward them to the application server.

## Step 3: Setup PM2 for Deployment

PM2 is used to manage the application process on the server, ensuring that it runs continuously and can be restarted if needed.

1. **Edit the `ecosystem.config.cjs` file** in your project’s root directory. Update the configuration with the appropriate details for your server:

   ```js
   module.exports = {
     /* ... */
     key: '/path/to/.ssh/publickey', // Path to your SSH public key
     host: ['123.0.0.1'], // IP address of your server
     repo: 'git@github.com:username/repo.git', // GitHub repository URL
     path: '/home/sweyn/sites/APP_NAME', // Path where the app will be deployed
     /* ... */
   }
   ```

   - **`key`**: Path to your SSH public key, which is used for secure communication with GitHub.
   - **`host`**: The IP address or addresses of your server.
   - **`repo`**: Your GitHub repository URL for the app.
   - **`path`**: The directory path where the app will be deployed on the server.

2. **Run the deployment setup script** on your local machine to configure PM2:

   ```bash
   pnpm run deploy-setup
   ```

   This command will:

   - Install and configure PM2 on the server.
   - Set up the environment to manage your Sweyn app with PM2.

### **Note: Handling PM2 and Bash Interactions**

Bash might act up during deployment because PM2 doesn't run in an interactive mode by default. If you encounter issues with the `bashrc` file, do the following:

1. **Edit the `.bashrc` file on the server**:

   ```bash
   nano /home/sweyn/.bashrc
   ```

2. **Comment out the following lines** to avoid issues with PM2 not being able to interact properly:

   ```sh
   # If not running interactively, don't do anything
   # case $- in
   #     *i*) ;;
   #       *) return;;
   # esac
   ```

3. **Save the changes** and restart your session or reload the `.bashrc` file:

   ```bash
   source ~/.bashrc
   ```

## Step 4: Deploy the Application

Once everything is set up, you’re ready to deploy the app.

**Run the deployment command** to deploy the app on the server:

```bash
pnpm run deploy
```

This will:

- Pull the latest changes from the GitHub repository.
- Install any necessary dependencies.
- Restart the application using PM2 to apply the new changes.
