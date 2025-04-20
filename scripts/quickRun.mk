all:

w:
	@while true; do \
		docker compose logs --follow $$c || { clear; true; }; \
		sleep 2; \
	done
f:
	$(MAKE) --no-print w c=front
a:
	$(MAKE) --no-print w c=auth
u:
	$(MAKE) --no-print w c=user
m:
	$(MAKE) --no-print w c=match
t:
	$(MAKE) --no-print w c=tour
g:
	$(MAKE) --no-print --no-print w c=game
tr:
# $(MAKE) --no-print w c=traefik
	watch docker exec -it traefik sh -c "cat /traefik/logs/"
pr:
	$(MAKE) --no-print w c=prometheus
gr:
	$(MAKE) --no-print w c=grafana
fd:
	$(MAKE) --no-print D=1 fclean dcon
d:
	$(MAKE) --no-print D=1 dcon
