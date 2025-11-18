# Quick Setup Guide

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ and npm installed

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations assets
python manage.py migrate
python seed_data.py
python manage.py test
python manage.py runserver
```

Backend will be at http://localhost:8000

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend will open at http://localhost:3000

## What You Should See

**Frontend** (http://localhost:3000):
   - Dashboard with stats
   - Assets page with full CRUD
   - Users page (table only)
   - Regions page (table only)

**API** (http://localhost:8000/api/)

## Testing

**Backend tests:**
```bash
cd backend
python manage.py test
```

**Frontend tests:**
```bash
cd frontend
npm test
```

## Troubleshooting

### Backend Issues
- **Port 8000 in use**: Kill the process
- **"no such table" error**: Run `makemigrations` before `migrate`
- **Tests failing**: Check migrations are applied

### Frontend Issues
- **Port 3000 in use**: Vite will offer port 3001
- **CORS errors**: Make sure backend is running
- **Blank page**: Check browser console

