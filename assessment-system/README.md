# DuoDesire™ Medical Assessment System

A secure, multi-step medical assessment system for evaluating patient eligibility for DuoDesire medications (Tadalafil, PT-141, Oxytocin).

## Features

### Patient Assessment Form
- **8-Step Wizard**: Patient Info, Medical History, Medications, Sexual Health, Contraindication Screening, PT-141 Specific, Oxytocin Specific, Consent & Signature
- Real-time validation
- Digital signature capture
- IP address and timestamp tracking

### Physician Dashboard
- Secure JWT authentication
- Assessment queue with filtering (Pending/Approved/Denied/Shipped)
- Color-coded risk flags (Red = Disqualifier, Yellow = Caution, Green = Clear)
- Full assessment review with expandable sections
- Approve/Deny workflow with notes

### Risk Flag Detection
**Auto-Disqualifying Conditions:**
- Nitrate medication use
- Doctor advised no sexual activity
- Severe cardiac condition
- Pregnancy (for PT-141/Oxytocin)

**Physician Review Required:**
- Blood pressure > 150/95 or < 90/60
- Heart attack or stroke history
- Eye disorder (NAION)
- SSRIs/psychiatric medications
- Kidney/liver impairment
- And more...

## Tech Stack
- **Next.js 14** - React framework
- **Prisma** - ORM
- **SQLite** - Database
- **Tailwind CSS** - Styling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

## Setup

### 1. Install Dependencies
```bash
cd assessment-system
npm install
```

### 2. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Default Accounts
```bash
node prisma/seed.js
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Physician | doctor@duodesire.com | physician123 |
| Admin | admin@duodesire.com | admin123 |

## URLs

- **Patient Assessment**: `http://localhost:3001`
- **Physician Login**: `http://localhost:3001/physician/login`
- **Physician Dashboard**: `http://localhost:3001/physician/dashboard`

## API Endpoints

### Public
- `POST /api/assessment/submit` - Submit patient assessment

### Protected (Physician/Admin)
- `POST /api/physician/login` - Authenticate physician
- `GET /api/physician/queue` - Get assessment queue
- `GET /api/physician/assessment/:id` - Get single assessment
- `POST /api/physician/decision` - Approve/deny assessment

### Admin Only
- `POST /api/admin/fulfillment/:id` - Mark order as shipped

## Database Schema

### PatientAssessment
- Patient information (JSON)
- Medical history (JSON)
- Medications (JSON)
- Sexual health (JSON)
- Contraindications (JSON)
- PT-141/Oxytocin sections (JSON)
- Risk flags and status
- Consent and signature data
- Physician decision and notes

### Physician
- Name, email, password hash
- Role (physician/admin)
- Last login timestamp

### AuditLog
- Action tracking for compliance
- Entity type and ID
- Physician who performed action
- IP address and timestamp

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT authentication with 24h expiry
- Role-based access control
- Audit logging for all physician actions
- IP address tracking

## Environment Variables (Production)

```env
JWT_SECRET=your-secure-secret-key
DATABASE_URL=your-database-url
```

## License

Proprietary - DuoDesire™

