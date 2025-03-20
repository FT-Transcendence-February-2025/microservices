#!/bin/bash
set -x
if [ -f .secrets/.env.tmp ]; then
	echo "File with secrets not found. Please contact microservices Admin for further information"
	exit 1
fi

if [ -f srcs/.env ]; then
	exit 0
fi

# ---------- Authentication ---------- #

# ---------- DNS ---------- #
# ---------- Frontend ---------- #
# ---------- Game ---------- #
# ---------- DATABASE ---------- #

# DB_PORT=3306

# ---------- User-management ---------- #


# ---------- .env ---------- #
DEBUG="$1"
if [ "$DEBUG" -eq 1 ]; then
	echo "########### ---- Debug mode is enabled ---- ###########3"
fi
export $(egrep '(SSL|DATA|ADMIN_EMAIL|AUTH_ENV)=' ./secrets/.env.tmp)
export DOMAIN=$(hostname)
IP=$(ip route get 8.8.8.8 | awk '{print $7}')
echo "# --- COMPOSE & TRAEFIK SERVICE --- #" >> .env
grep -vE '^(TOKEN|AUTH_ENV)=' ./secrets/.env.tmp >> .env


echo $ADMIN_EMAIL > $SSL/adminEmail.txt
cat <<EOF >> .env
USER=$USER
USER_ID=$(id -u)
GROUP_ID=$(id -g)
HOST_USER=$USER
DOMAIN=$DOMAIN
IP=$IP
# ---------- VOLUMES ---------- #
NGINX_VOL=$PWD/$DATA/nginx
FASTIFY_VOL=$PWD/$DATA/fastify
TRAEFIK_VOL=$PWD/$DATA/traefik
# ---------- CERTIFICATES ---------- #
SSL_PATH=$PWD/$SSL
SSL_CRT=$PWD/$SSL/$(hostname -s).crt
SSL_KEY=$PWD/$SSL/$(hostname -s).key
SSL_PEM=$PWD/$SSL/rootCA.pem
SSL_EMAIL=$PWD/$SSL/adminEmail.txt
EOF
echo "#-------- AUTHENTICATION ----- " >> .env
# echo "AUTH_ENV=test" >> .env
echo "AUTH_ENV=$PWD/$AUTH_ENV" >> .env
cat $AUTH_ENV >> .env
# cat $AUTH_ENV >> .env
# echo -e "\nContent: \n" && tree --dirsfirst ./
echo
