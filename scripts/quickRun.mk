all:

f:
	$(MAKE) w c=front
a:
	$(MAKE) w c=auth
u:
	$(MAKE) w c=user
m:
	$(MAKE) w c=match
t:
	$(MAKE) w c=tour
g:
	$(MAKE) w c=game
tr:
	$(MAKE) w c=traefik
pr:
	$(MAKE) w c=prometheus
gr:
	$(MAKE) w c=grafana
fd:
	$(MAKE) D=1 fclean dcon
d:
	$(MAKE) D=1 dcon
