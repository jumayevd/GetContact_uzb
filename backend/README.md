# GetContact Uzb Backend API

A complete backend API for the GetContact Uzb mobile application, built with Node.js, Express, and PostgreSQL.

## Features

- 🔐 User authentication (register/login) with JWT
- 📱 Contact upload and management
- 🔍 Contact search by phone number
- 🛡️ Security features (helmet, rate limiting, CORS)
- ✅ Input validation with Joi
- 🗄️ PostgreSQL database with optimized queries
- 📊 Health check endpoint

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE getcontact_uzb;
```

2. Run the schema file:
```bash
psql -d getcontact_uzb -f database/schema.sql
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=getcontact_uzb
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "phone": "+998901234567",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+998901234567",
  "password": "password123"
}
```

### Contacts

#### Upload Contacts
```
POST /api/contacts/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "contacts": [
    {
      "name": "Alice Smith",
      "phone": "+998901234568"
    },
    {
      "name": "Bob Johnson",
      "phone": "+998901234569"
    }
  ]
}
```

#### Search Contact
```
POST /api/contacts/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+998901234568"
}
```

#### Get My Contacts
```
GET /api/contacts/my-contacts
Authorization: Bearer <token>
```

### Health Check
```
GET /health
```

## Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable cross-origin requests
- **JWT**: Secure token-based authentication
- **Input Validation**: Request data validation with Joi
- **SQL Injection Protection**: Parameterized queries

## Database Schema

### Users Table
- `id`: Primary key
- `phone`: Unique phone number
- `password_hash`: Bcrypt hashed password
- `name`: User's display name
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Contacts Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `contact_name`: Name saved for the contact
- `contact_phone`: Phone number of the contact
- `created_at`: Contact creation timestamp

## Development

### Project Structure
```
backend/
├── config/
│   └── database.js      # Database configuration
├── database/
│   └── schema.sql       # Database schema
├── middleware/
│   ├── auth.js          # Authentication middleware
│   └── validation.js    # Request validation
├── models/
│   └── User.js          # User model and methods
├── routes/
│   ├── auth.js          # Authentication routes
│   └── contacts.js      # Contact management routes
├── index.js             # Main server file
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

### Adding New Features

1. Create new route files in `routes/`
2. Add validation schemas in `middleware/validation.js`
3. Update the main `index.js` to include new routes
4. Add database migrations if needed

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Use environment variables for all sensitive data
6. Set up proper logging and monitoring

## License

MIT License 