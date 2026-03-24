NAME := ft_transcendence
DC := docker compose

.DEFAULT_GOAL := help

help:
	@echo "Available targets:"
	@echo "  make install      - install npm dependencies"
	@echo "  make db           - start only MariaDB in Docker"
	@echo "  make db-down      - stop MariaDB container"
	@echo "  make db-reset     - reset MariaDB volume and restart DB"
	@echo "  make prisma       - generate Prisma client and push schema"
	@echo "  make setup        - install deps, start DB, setup Prisma"
	@echo "  make up           - start full Docker stack"
	@echo "  make dev          - start full Docker stack attached"
	@echo "  make down         - stop full Docker stack"
	@echo "  make logs         - show Docker logs"
	@echo "  make clean        - remove containers, volumes, images"
	@echo "  make fclean       - deep Docker cleanup"
	@echo "  make re           - rebuild everything"

install:
	@echo "Installing npm dependencies..."
	@npm install

db:
	@echo "Starting MariaDB only..."
	@$(DC) up -d mariadb

db-down:
	@echo "Stopping MariaDB..."
	@$(DC) stop mariadb

db-reset:
	@echo "Resetting MariaDB volume and restarting DB..."
	@$(DC) down -v
	@$(DC) up -d mariadb

prisma:
	@echo "Generating Prisma client..."
	@npx prisma generate
	@echo "Pushing schema to database..."
	@npx prisma db push

setup: install db prisma
	@echo "Setup complete."
	@echo "Now run: npm run dev"

up:
	@echo "Starting $(NAME) containers in the background..."
	@$(DC) up --build -d

dev:
	@echo "Starting $(NAME) in development mode..."
	@$(DC) up --build

down:
	@echo "Stopping $(NAME) containers..."
	@$(DC) down

logs:
	@$(DC) logs -f

clean:
	@echo "Cleaning containers, volumes, and custom images..."
	@$(DC) down -v --rmi all --remove-orphans || true

fclean: clean
	@echo "Deep cleaning Docker environment..."
	@docker system prune -a --force

re: fclean up

.PHONY: help install db db-down db-reset prisma setup up dev down logs clean fclean re