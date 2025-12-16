# Nova Backend - Django REST API

A Django REST API backend for the Nova Lost & Found application with AI-powered matching.

## Features

- 🔐 JWT Authentication
- 📦 PostgreSQL Database
- 🤖 AI-Powered Matching (integrates with FindBack_AI service)
- 📸 Image Upload Support
- 🔔 Real-time Notifications
- 🔍 Advanced Filtering & Search
- 👥 User Management
- 📊 Admin Dashboard

## Tech Stack

- Django 5.0
- Django REST Framework
- PostgreSQL
- JWT Authentication
- CORS Support
- Integration with FastAPI AI Service (CLIP-based matching)

## Setup Instructions

### Prerequisites

- Python 3.10+
- PostgreSQL 14+
- FindBack_AI service running (on port 3300)

### Installation

1. **Create virtual environment**
```bash
cd nova-backend
python -m venv venv
```

2. **Activate virtual environment**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
# Copy example env file
copy .env.example .env

# Edit .env and set your values:
# - SECRET_KEY (generate a secure key)
# - DATABASE credentials
# - CORS_ALLOWED_ORIGINS (your frontend URL)
# - AI_SERVICE_URL (default: http://localhost:3300)
```

5. **Create PostgreSQL database**
```sql
CREATE DATABASE nova_db;
CREATE USER postgres WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE nova_db TO postgres;
```

6. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

7. **Create superuser**
```bash
python manage.py createsuperuser
```

8. **Run development server**
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (get JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user profile
- `PUT /api/auth/me/` - Update user profile

### Items
- `GET /api/items/` - List all items (with filters)
- `POST /api/items/` - Create new item
- `GET /api/items/{id}/` - Get item details
- `PUT /api/items/{id}/` - Update item
- `DELETE /api/items/{id}/` - Delete item
- `GET /api/items/my_items/` - Get current user's items
- `PATCH /api/items/{id}/update_status/` - Update item status

### Matches
- `GET /api/matches/` - List matches for current user
- `POST /api/matches/trigger_matching/` - Trigger AI matching
- `GET /api/matches/{id}/` - Get match details
- `PATCH /api/matches/{id}/update_status/` - Update match status

### Notifications
- `GET /api/notifications/` - List user notifications
- `PATCH /api/notifications/{id}/mark_read/` - Mark as read
- `POST /api/notifications/mark_all_read/` - Mark all as read
- `DELETE /api/notifications/{id}/` - Delete notification

## AI Service Integration

The backend integrates with the FindBack_AI service for intelligent matching:

1. When an item is created, it's automatically indexed in the AI service
2. Users can trigger matching via `POST /api/matches/trigger_matching/`
3. The AI service uses CLIP embeddings to find similar items
4. Matches are created and users are notified

### AI Service Requirements

- FindBack_AI service must be running on the configured port (default: 3300)
- Endpoints used:
  - `POST /items/add` - Index new items
  - `POST /search/lost` - Find matches for lost items
  - `POST /search/found` - Find matches for found items

## Admin Dashboard

Access the Django admin at `http://localhost:8000/admin/`

Features:
- User management
- Item management
- Match management
- Notification management

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| SECRET_KEY | Django secret key | - |
| DEBUG | Debug mode | True |
| DATABASE_NAME | PostgreSQL database name | nova_db |
| DATABASE_USER | PostgreSQL user | postgres |
| DATABASE_PASSWORD | PostgreSQL password | - |
| DATABASE_HOST | PostgreSQL host | localhost |
| DATABASE_PORT | PostgreSQL port | 5432 |
| ALLOWED_HOSTS | Allowed hosts (comma-separated) | localhost,127.0.0.1 |
| CORS_ALLOWED_ORIGINS | CORS origins (comma-separated) | http://localhost:5173 |
| AI_SERVICE_URL | AI service URL | http://localhost:3300 |

## Database Models

### User
- Extended Django user with email, phone, timestamps

### Item
- Type: lost/found/anonymous
- Category, description, brand, color
- Location, date, time
- Status: active/matched/recovered/closed
- Image upload support
- Contact information
- AI indexing status

### Match
- Links lost and found items
- AI similarity score (0-100)
- Status: pending/confirmed/rejected

### Notification
- User notifications
- Types: match_found, match_confirmed, etc.
- Related items and matches

## Development

### Running Tests
```bash
python manage.py test
```

### Creating Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Collecting Static Files
```bash
python manage.py collectstatic
```

## Production Deployment

1. Set `DEBUG=False` in .env
2. Configure proper `SECRET_KEY`
3. Set `ALLOWED_HOSTS` to your domain
4. Use a production WSGI server (gunicorn, uwsgi)
5. Set up HTTPS
6. Configure static file serving
7. Set up database backups

## License

MIT
