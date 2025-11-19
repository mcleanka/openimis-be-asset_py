.PHONY: install install-backend install-frontend migrate seed test test-backend test-frontend run run-backend run-frontend clean

# Install all dependencies
install: install-backend install-frontend

install-backend:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

# Database operations
migrate:
	@echo "Running migrations..."
	cd backend && python manage.py migrate

migrate-create:
	@echo "Creating migrations..."
	cd backend && python manage.py makemigrations

seed:
	@echo "Seeding database..."
	cd backend && python manage.py seed_data

# Testing
test: test-backend test-frontend

test-backend:
	@echo "Running backend tests..."
	cd backend && python manage.py test

test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm test

# Development servers
run: run-backend run-frontend

run-backend:
	@echo "🚀 Starting Django server..."
	cd backend && python manage.py runserver

run-frontend:
	@echo "⚡ Starting Vite dev server..."
	cd frontend && npm run dev

# Cleanup
clean:
	@echo "Cleaning up..."
	cd backend && find . -name "*.pyc" -delete
	cd backend && find . -name "__pycache__" -delete
	cd frontend && rm -rf node_modules dist

# Setup complete development environment
setup: install migrate seed
	@echo "Development environment ready!"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"

help:
	@echo "Available commands:"
	@echo "  make install          - Install all dependencies"
	@echo "  make migrate          - Run database migrations"
	@echo "  make seed             - Seed database with sample data"
	@echo "  make test             - Run all tests"
	@echo "  make run              - Start both servers"
	@echo "  make run-backend      - Start Django server only"
	@echo "  make run-frontend     - Start Vite server only"
	@echo "  make clean            - Clean generated files"
	@echo "  make setup            - Complete setup (install + migrate + seed)"