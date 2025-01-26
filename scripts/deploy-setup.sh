#!/bin/bash

set_app_name() {
  while true; do
    read -r -p "Name of the app? " APP_NAME
    case $APP_NAME in
    "") printf "\033[31m%s\n\033[0m" "Invalid input" ;;
    *) return 0 ;;
    esac
  done
}

set_server_port() {
  read -r -p "Server port? " SERVER_PORT
  SERVER_PORT=${SERVER_PORT:-3003}
}

set_domain_name() {
  while true; do
    read -r -p "Domain name? (without protocol, i.e.: example.com) " DOMAIN_NAME
    case $DOMAIN_NAME in
    "") printf "\033[31m%s\n\033[0m" "Invalid input" ;;
    *) return 0 ;;
    esac
  done
}

# Setup variables
set_app_name
set_server_port
set_domain_name

# Add site to Nginx
touch /etc/nginx/sites-available/$APP_NAME
echo "server{
  server_name $DOMAIN_NAME;
  location / {
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header Host \$host;
    proxy_pass http://0.0.0.0:$SERVER_PORT;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection \"upgrade\";
  }
}" >>/etc/nginx/sites-available/$APP_NAME
ln -s /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo systemctl reload nginx
