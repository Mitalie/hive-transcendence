NAME := ft_transcendence

DC := docker compose
DB_CONTAINER := transcendence_db

# Ensures 'make' runs 'all' by default
.DEFAULT_GOAL := all

all: $(NAME)

$(NAME): dev

# Starts the database container and then runs Next.js dev server
dev: up
	@echo "Starting $(NAME) Next.js dev server"
	@npm run dev

# Builds and starts the database container in the background.
# up --build : Forces fresh image compilation from Dockerfiles before starting.
# -d         : Runs the stack in the background (detached mode).
up:
	@echo "Starting $(NAME) database container in the background..."
	@$(DC) up --build -d
	@echo "Waiting for database to become healthy..."
	@until [ "$$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}starting{{end}}' $(DB_CONTAINER))" = "healthy" ]; do \
		sleep 2; \
	done
	@echo "Applying Prisma migrations..."
	@attempt=1; \
	until npm run migrate:deploy; do \
		if [ $$attempt -ge 10 ]; then \
			echo "Prisma migrations failed after $$attempt attempts."; \
			exit 1; \
		fi; \
		echo "Migration attempt $$attempt failed. Retrying in 3 seconds..."; \
		attempt=$$((attempt + 1)); \
		sleep 3; \
	done

# Stop the database container.
# Leaves volumes intact.
down:
	@echo "Stopping $(NAME) containers..."
	@$(DC) down

# Shows the live logs of the database container
# -f         : Follows the log output continuously.
logs:
	@$(DC) logs -f

# Full Docker compose wipe.
# down -v          : Deletes internal Docker named volumes (wipes the database).
# --rmi all        : Deletes all custom built images for the services.
# --remove-orphans : Cleans up ghost containers not currently in the compose file.
# || true          : Prevents make from crashing if there is nothing to stop.
clean:
	@echo "Cleaning containers, volumes, and custom images..."
	@$(DC) down -v --rmi all --remove-orphans || true

# The Nuclear Option: Cleans the compose setup, then purges the entire Docker system.
# system prune -a  : Removes all unused images, networks, and build cache.
# --force          : Bypasses the terminal Y/N confirmation prompt.
fclean: clean
	@echo "Deep cleaning Docker environment..."
	@docker system prune -a --force

# Full factory reset: wipes everything and rebuilds from scratch.
re: fclean all

.PHONY: all up dev down logs clean fclean re
