PROJECT?=polypore
COMPOSE:=docker compose -f docker-compose.yml

.PHONY: setup up down build logs restart ps clean

setup:
	$(MAKE) -C backend setup
	$(MAKE) -C front setup

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

restart: down up

clean:
	$(MAKE) -C backend clean || true
	$(MAKE) -C front clean || true 