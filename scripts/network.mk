
# Default target, does nothing
all:

# Display the IP address of the active network interface
ip:
	-ifconfig `ifconfig wlan1 >/dev/null 2>&1 && echo wlan1 || echo enp6s0` |  grep 'inet ' | awk '{print $$2}'
	@printf "$(LF)\n$(D_GREEN)[✔] IP: $(shell ip route get 8.8.8.8 | awk '{print $$7}') $(P_NC)\n"

# Display the subnet mask of the active network interface
subnet:
	ifconfig `ifconfig wlan1 >/dev/null 2>&1 && echo wlan1 || echo enp6s0` |  grep 'netmask ' | awk '{print $$2}'

# Obtain and display the gateway for the current device
gate:
	@traceroute -m 1 8.8.8.8 | awk 'NR==2 {print $$3}' | tr -d '()'

# Ping a specific IP address (10.64.249.168) and display if the traceroute was successful
pingPixel:
	@ip="10.64.249.168"; \
	traceroute -m 3 -q 1 $$ip >/dev/null 2>&1; \
	if [ $$? -eq 0 ]; then \
		echo "Traceroute to $$ip was successful"; \
	else \
		echo "Traceroute to $$ip failed"; \
	fi

# Ping a specific IP address (10.12.1.1) and display if the traceroute was successful
ping:
	@ip="10.12.1.1"; \
	traceroute -m 3 -q 1 $$ip >/dev/null 2>&1; \
	if [ $$? -eq 0 ]; then \
		echo "Traceroute to $$ip was successful"; \
	else \
		echo "Traceroute to $$ip failed"; \
	fi

# Display the IP address of the Docker host
dockerHostIP:
	docker run --rm alpine ip route | awk '/default/ { print $3 }'

# Perform DNS lookup for specific nameservers and domain
42dns:
	nslookup ns6.kasserver.com
	nslookup ns4.kasserver.com
	dig NS 42wolfsburg.de

# Check DNS settings and perform various DNS lookups
dnsCk:
	DNS42=$(shell nmcli dev show | grep DNS | awk '{print $$2}') ; \
	nslookup $(shell hostname) $$DNS42
	-nslookup lilizarr.42.fr
	-nslookup -type=NS $(shell hostname)
	-dig $(shell hostname)
	-dig NS $(shell hostname)
	-openssl s_client -connect 42wolfsburg.de:443 -showcerts
	netstat -tuln | grep 53

# Test NGINX server with curl commands
testNG:
	-docker exec -it nginx sh -c "curl -fk https://\$$DOMAIN"
	@echo ----
	-docker exec -it nginx sh -c "curl -fk https://\$$DOMAIN"
	@echo;echo "----" ;
	-docker exec -it nginx sh -c "curl -Ik https://\$$DOMAIN"

# Test web server with curl and openssl commands
testWeb:
	@echo ----
	-curl -I http://$(shell hostname)
	@echo ----
	-curl -I https://$(shell hostname)
	@echo ----
	-curl -fk https://$(shell hostname)
	@echo ----
	-openssl s_client -connect $(shell hostname):443 -showcerts
	@echo ----
	-curl -k https://$(shell hostname)
	@echo;echo "----" ;

# Open Firefox in private window with specific URLs
browser:
	firefox --private-window "127.0.0.1" && \
	firefox --private-window "$(shell hostname)" && \
	firefox --private-window "$(shell hostname -i)" && \
	firefox --private-window "localhost:8080"

# Perform curl requests with specific headers
curlt:
	curl -v -H "Host: c3r2s3.42wolfsburg.de" https://localhost:443
	curl -v -H "Host: c3r2s3.42wolfsburg.de" http://localhost:80

# Perform various tests related to 42wolfsburg.de domain
42test:
	-curl -fk --resolve 42wolfsburg.de
	@echo ----
	-openssl s_client -connect 42wolfsburg.de:443 -showcerts
	@echo ----
	-DNS42=$(shell nmcli dev show | grep DNS | awk '{print $$2}') ; \
	nslookup 42wolfsburg.de $$DNS42
	@echo ----
	dig NS 42wolfsburg.de
	@echo ----
	nslookup -type=NS 42wolfsburg.de
	@echo ----
	nmcli dev show | grep DNS

# Ping a specific IP address and perform DNS lookup inside a Docker container
pingClient:
	docker exec -it --privileged traefik sh -c "nslookup 10.12.1.1"
	docker exec -it --privileged traefik sh -c "nslookup -type=NS 42wolfsburg.de"

# Run a Docker container with specific DNS settings and perform nslookup
pingDNS:
	docker run --rm --dns 10.51.1.253 --dns-search 42wolfsburg.de ft_transcendence-fastify:latest /bin/sh -c "nslookup 10.12.1.1"