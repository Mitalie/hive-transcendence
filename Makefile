NAME := ft_transcendence

DC := docker compose

# Ensures 'make' runs 'all' by default
.DEFAULT_GOAL := all

all: $(NAME)

$(NAME): up

# Builds and starts the containers in the background
# up --build : Forces fresh image compilation from Dockerfiles before starting.
# -d         : Runs the stack in the background (detached mode).
up:
	@echo "Starting $(NAME) containers in the background..."
	@$(DC) up --build -d

# Starts the containers attached to the terminal (good for seeing live logs)
dev:
	@echo "Starting $(NAME) in development mode..."
	@$(DC) up --build

# Gracefully stops containers and the bridge network.
# Leaves volumes intact.
down:
	@echo "Stopping $(NAME) containers..."
	@$(DC) down

# Shows the live logs of the containers
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
