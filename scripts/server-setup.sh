#!/bin/bash

# First:
#  - Create domain and point to the server

# Create user Sweyn
sudo adduser --disabled-password --gecos "" sweyn
sudo usermod -aG sudo sweyn
sudo usermod -aG sweyn www-data
sudo echo 'sweyn ALL=(ALL) NOPASSWD: /usr/bin/certbot,/usr/bin/env,/usr/bin/ln,/usr/bin/mv,/usr/bin/mkdir,/usr/bin/rm,/usr/bin/rmdir,/usr/bin/tee,/usr/sbin/nginx,/bin/systemctl' | sudo tee /etc/sudoers.d/sweyn >/dev/null
sudo chmod 0440 /etc/sudoers.d/sweyn

# Set up home directory
sudo -u sweyn mkdir /home/sweyn/sites

# Create SSH key
sudo -u sweyn mkdir /home/sweyn/.ssh
sudo -u sweyn chmod 0700 /home/sweyn/.ssh
sudo -u sweyn ssh-keygen -t ed25519 -N "" -f /home/sweyn/.ssh/id_ed25519
sudo -u sweyn touch /home/sweyn/.ssh/authorized_keys
sudo -u sweyn touch /home/sweyn/.ssh/config
echo "Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519" >>/home/sweyn/.ssh/config
sudo -u sweyn chmod 0600 /home/sweyn/.ssh/*

# Make github repo cloneable
ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts

# Install packages
sudo apt update
sudo apt install certbot nginx python3-certbot-nginx ufw unzip zip -y

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'Nginx HTTPS'
sudo ufw --force enable

# Install NVM, Node.js, and PNPM
su -c "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash" -s /bin/bash sweyn
sudo -u sweyn bash -c 'source /home/sweyn/.nvm/nvm.sh && nvm install 23.6.1'
sudo -u sweyn bash -c 'source /home/sweyn/.nvm/nvm.sh && nvm alias 23.6.1'
sudo -u sweyn bash -c 'source /home/sweyn/.nvm/nvm.sh && npm install pnpm -g'

# Install pm2
sudo -u sweyn bash -c 'source /home/sweyn/.nvm/nvm.sh && npm install pm2 -g'
sudo -u sweyn env PATH=$PATH:/home/sweyn/.nvm/versions/node/v23.6.1/bin /home/sweyn/.nvm/versions/node/v23.6.1/lib/node_modules/pm2/bin/pm2 startup systemd -u sweyn --hp /home/sweyn

# Comment out these lines:
# ~/.bashrc
# If not running interactively, don't do anything
#case $- in
#    *i*) ;;
#      *) return;;
#esac

add_ssh_key() {
  while true; do
    read -r -p "Public SSH key to access sweyn user:\n" SSH_KEY
    case $SSH_KEY in
    "") printf "\033[31m%s\n\033[0m" "Invalid input" ;;
    *) return 0 ;;
    esac
  done
}

printf "\033[32m"
add_ssh_key
printf "\033[0m" ""

# Print this servers SSH key (used to connect to Github)
printf "\033[32m"
cat /home/sweyn/.ssh/id_ed25519.pub
printf "\033[34m"
printf "Add this key to https://github.com/settings/ssh/new\n"
printf "\033[0m" ""