# Makefile
.PHONY: install migrate seed seed-force test test-clean run setup clean

# Install dependencies
install:
	pip install -r requirements.txt

# Run migrations
migrate:
	python manage.py makemigrations assets
	python manage.py migrate

# Seed data (safe - skips if data exists)
seed:
	python seed_data.py

# Force reseed (clears and recreates)
seed-force:
	python seed_data.py --force

# Run tests with clean database
test:
	python manage.py test

# Complete setup
setup: install migrate seed-force
	@echo "✅ Setup complete! Run 'make run' to start server."

# Run development server
run:
	python manage.py runserver

# Clean pycache
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete

help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make migrate    - Run migrations"
	@echo "  make seed       - Seed database (safe)"
	@echo "  make seed-force - Force reseed (clear & recreate)"
	@echo "  make test       - Run tests with clean database"
	@echo "  make run        - Start development server"
	@echo "  make setup      - Complete setup"
	@echo "  make clean      - Clean pycache files"