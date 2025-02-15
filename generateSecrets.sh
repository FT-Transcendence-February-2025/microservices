#!/bin/bash

if [ -f .secrets/.env.tmp ]; then
	echo "File with secrets not found. Please contact microservices Admin for further information"
	exit 1
fi

if [ -f srcs/.env ]; then
	exit 0
fi

# ---------- Authentication ---------- #
# ---------- Backend ---------- #
# ---------- DNS ---------- #
# ---------- Frontend ---------- #
# ---------- Game ---------- #
# ---------- DATABASE ---------- #

# DB_PORT=3306

# ---------- User-management ---------- #


# ---------- NGINX ---------- #


# ---------- .env ---------- #
DEBUG="$1"
export $(grep -vE '^(AUTH_KEY|SECURE_AUTH_KEY|LOGGED_IN_KEY|NONCE_KEY|AUTH_SALT|SECURE_AUTH_SALT|LOGGED_IN_SALT|NONCE_SALT|TOKEN)=' ./secrets/.env.tmp)
export DATA=$DATA/$USER/data
export DOMAIN=$WEB_DOMAIN
IP=$(ifconfig `ifconfig wlan1 >/dev/null 2>&1 && echo wlan1 || echo enp6s0` |  grep 'inet ' | awk '{print $2}')

if [ "$DEBUG" -eq 1 ]; then
    echo "########### ---- Debug mode is enabled ---- ###########3"
	export DOMAIN=$USER.$WEB_DOMAIN
fi
cat <<EOF > .env
USER=$USER
USER_ID=$(id -u)
GROUP_ID=$(id -g)
CONTAINER_NAME=$CONTAINER_NAME
HOST_USER=$USER
DOMAIN=$DOMAIN
# ---------- NGINX-DNS ---------- #
NGINX_CERT=$PWD/$CERT
NGINX_KEY=$PWD/$KEY
NGINX_PORT=$NGINX_PORT
NGINX_VOL=$DATA/nginx

IP=$IP
EOF


# echo -e "\nContent: \n" && tree --dirsfirst ./
echo
