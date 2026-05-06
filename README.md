# Asset Management System

A simple full-stack application for managing assets across regions using Django REST Framework and React.

## Tech Stack

- **Backend**: Django 4.2, Django REST Framework
- **Frontend**: React 18
- **Database**: SQLite
- **API**: RESTful API

## Project Structure

```
asset-manager/
├── backend/              # Django backend
├── frontend/             # React frontend
└── documentation files
```

## Setup Instructions

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations assets
python manage.py migrate
python seed_data.py
python manage.py test
python manage.py runserver
```

Backend API: http://localhost:8000/api/

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000

## Usage

1. **Dashboard**: View statistics about assets, users, and regions
2. **Assets**: View all assets, create/edit/delete assets
3. **Users**: View all users
4. **Regions**: View all regions

Note: User and Region forms need to be implemented as part of the assignment.

## API Endpoints

### Regions
- `GET /api/regions/` - List all regions
- `POST /api/regions/` - Create a new region
- `GET /api/regions/{id}/` - Get a specific region
- `PUT /api/regions/{id}/` - Update a region
- `DELETE /api/regions/{id}/` - Delete a region

### Users
- `GET /api/users/` - List all users
- `POST /api/users/` - Create a new user
- `GET /api/users/{id}/` - Get a specific user
- `PUT /api/users/{id}/` - Update a user
- `DELETE /api/users/{id}/` - Delete a user

### Assets
- `GET /api/assets/` - List all assets
- `POST /api/assets/` - Create a new asset
- `GET /api/assets/{id}/` - Get a specific asset
- `PUT /api/assets/{id}/` - Update an asset
- `DELETE /api/assets/{id}/` - Delete an asset

## Initial Data

The seed script creates:
- **5 Regions**: North, South, East, West, Central
- **3 Users**: 
  - John Admin (admin@example.com)
  - Jane Supervisor (supervisor@example.com)
  - Bob User (user@example.com)
- **2 Assets**:
  - iPhone 14 (ASSET001, East region)
  - Galaxy Tab (ASSET002, South region)

Note: Feel free to extend `seed_data.py` with more test data if needed.

## Testing

Run the test suite:
```bash
cd backend
python manage.py test
```

All tests should pass. Do not modify existing test files. Add new tests for any features you implement.

## Django Admin

Access the Django admin panel at: http://localhost:8000/admin/

Use the superuser credentials you created during setup.

## Notes

- This is a basic starter application
- User and Asset models are intentionally minimal
- Styling is required but can be basic
- CORS is enabled for local development
- The application uses SQLite as the database

## Development

- Backend runs on port 8000
- Frontend runs on port 3000
- Frontend proxies API requests to the backend
