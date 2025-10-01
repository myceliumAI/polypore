PROJECT?=polypore
COMPOSE:=docker compose -f docker-compose.yml

.PHONY: setup up down build logs restart ps clean fmt lint

setup:
	$(MAKE) -C backend setup
	$(MAKE) -C front setup
fmt:
	$(MAKE) -C backend fmt
	$(MAKE) -C front fmt
lint:
	$(MAKE) -C backend lint
	$(MAKE) -C front lint
up:
	$(COMPOSE) up -d --build

dev:
	$(MAKE) -C front dev & $(MAKE) -C backend dev & wait

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