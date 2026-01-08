# University Management System - Backend

Django REST Framework backend for the University Management System.

## Tech Stack

- **Framework**: Django 6.0 + Django REST Framework
- **Database**: MySQL
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Documentation**: Swagger (drf-yasg)
- **Storage**: MinIO (S3-compatible)

## Project Structure

```
server/
├── core/                          # Project configuration
│   ├── settings/
│   │   ├── base.py               # Base settings
│   │   ├── local.py              # Local development settings
│   │   └── production.py         # Production settings
│   ├── urls.py                   # Main URL routing
│   └── wsgi.py
│
├── users/                         # User management app
│   ├── models.py                 # User model
│   ├── serializers.py            # User serializers
│   ├── views.py                  # Auth views (login, register, etc.)
│   ├── urls.py                   # Auth endpoints
│   ├── permissions.py            # Custom permissions (IsAdmin, etc.)
│   └── admin.py
│
├── academics/                     # Academic structure app
│   ├── models.py                 # Faculty, Major, Class models
│   ├── views/                    # Separated ViewSets
│   │   ├── __init__.py          # Exports all ViewSets
│   │   ├── faculty.py           # FacultyViewSet
│   │   ├── major.py             # MajorViewSet
│   │   └── class_view.py        # ClassViewSet
│   ├── serializers/              # Separated serializers
│   │   ├── __init__.py          # Exports all serializers
│   │   ├── faculty.py           # Faculty serializers
│   │   ├── major.py             # Major serializers
│   │   └── class_serializer.py  # Class serializers
│   ├── urls.py                   # Academic endpoints
│   ├── admin.py
│   └── management/
│       └── commands/
│           └── seed_academics.py # Seed data command
│
├── manage.py
└── requirements.txt
```

## API Endpoints

### Authentication (`/api/v1/auth/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login/` | User login, returns JWT tokens |
| POST | `/register/` | Admin-only user registration |
| POST | `/logout/` | Logout (blacklist refresh token) |
| POST | `/refresh/` | Refresh access token |
| GET | `/me/` | Get current user profile |
| PATCH | `/me/` | Update current user profile |
| POST | `/change-password/` | Change password |

### Faculties (`/api/v1/faculties/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all faculties (paginated, searchable) |
| GET | `/{id}/` | Get faculty detail |
| POST | `/` | Create faculty (Admin only) |
| PATCH | `/{id}/` | Update faculty (Admin only) |
| DELETE | `/{id}/` | Delete faculty (Admin only, blocked if has majors) |
| GET | `/dropdown/` | Get minimal list for dropdowns |

### Majors (`/api/v1/majors/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all majors (filter by faculty) |
| GET | `/{id}/` | Get major detail |
| POST | `/` | Create major (Admin only) |
| PATCH | `/{id}/` | Update major (Admin only) |
| DELETE | `/{id}/` | Delete major (Admin only, blocked if has classes) |
| GET | `/dropdown/` | Get minimal list for dropdowns |

### Classes (`/api/v1/classes/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all classes (filter by major, academic_year) |
| GET | `/{id}/` | Get class detail |
| POST | `/` | Create class (Admin only) |
| PATCH | `/{id}/` | Update class (Admin only) |
| DELETE | `/{id}/` | Delete class (Admin only) |
| GET | `/dropdown/` | Get minimal list for dropdowns |
| GET | `/academic_years/` | Get available academic years |

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate

# Seed sample data
python manage.py seed_academics

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

## Environment Variables

Create `.env` file with:

```env
DEBUG=True
SECRET_KEY=your-secret-key

# Database
MYSQL_DATABASE=university_db
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_HOST=localhost
MYSQL_PORT=3306

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=university-storage
```

## Database Models

### User Roles
- `ADMIN` - Full system access
- `TEACHER` - Teacher-specific access
- `STUDENT` - Student-specific access

### Academic Hierarchy
```
Faculty (Khoa)
└── Major (Ngành)
    └── Class (Lớp)
```

## API Documentation

- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/

## Development

```bash
# Check for issues
python manage.py check

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Run tests
python manage.py test
```
