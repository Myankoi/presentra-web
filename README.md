# Presentra Web

Admin dashboard for **Presentra**, a QR-based school attendance management system. This frontend provides school administrators and counseling staff with tools to manage academic data, monitor attendance, review analytics, and export reports.

Presentra Web is powered by Firebase Authentication and communicates with the [Presentra API](https://github.com/Myankoi/presentra-api), which handles authorization, business logic, notifications, and MySQL persistence.

## Features

| Page | Route | Description | Access |
| --- | --- | --- | --- |
| Dashboard | `/` | School-wide attendance summary and attendance trends | Admin, BK |
| Users | `/pengguna` | Manage user accounts and roles | Admin |
| Classes | `/kelas` | Manage classes and class QR codes | Admin |
| Students | `/siswa` | Manage students and class assignments | Admin |
| Subjects | `/mapel` | Manage subjects and subject codes | Admin |
| Teaching Schedule | `/jadwal-mengajar` | Manage teaching schedules and bulk imports | Admin |
| Duty Schedule | `/jadwal-piket` | Manage teacher duty schedules | Admin |
| Reports | `/laporan` | Review attendance recaps and export Excel reports | Admin, BK |
| BK Analytics | `/bk` | Review daily attendance statistics and absence rankings | Admin, BK |
| Notifications | `/notifikasi` | View and manage user notifications | Authenticated dashboard users |

The current web dashboard is restricted to the `admin` and `bk` roles. The API also supports `guru` and `sekretaris` clients, such as a mobile application or another frontend.

## Architecture

```text
User
  │
  ▼
Firebase Authentication
  │ Firebase ID token
  ▼
Presentra Web (React + Vite)
  │ Authorization: Bearer <Firebase ID token>
  ▼
Presentra API (Express + TypeScript)
  │ Drizzle ORM
  ▼
MySQL
```

The frontend uses an Axios client configured with `VITE_API_URL`. A request interceptor attaches the current Firebase ID token to API requests. When the API returns `401 Unauthorized`, the frontend signs the user out and redirects to `/login`.

## Tech Stack

- **Framework:** React 19
- **Build tool:** Vite 7
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI:** shadcn/ui, Radix UI, and Lucide React
- **Routing:** React Router DOM 7
- **Authentication:** Firebase Authentication
- **HTTP client:** Axios
- **Charts:** Recharts
- **QR rendering:** React QR Code
- **Notifications:** Sonner

## Requirements

- Node.js `20.19+` or `22.12+`
- npm
- A Firebase project configured for Email/Password Authentication
- A running instance of the [Presentra API](https://github.com/Myankoi/presentra-api)
- MySQL and Firebase Admin credentials for the API

## Getting Started

Presentra Web depends on the API repository. Start the backend first, then start this frontend.

### 1. Clone both repositories

```bash
git clone https://github.com/Myankoi/presentra-api.git
git clone https://github.com/Myankoi/presentra-web.git
```

### 2. Configure and run the API

```bash
cd presentra-api
npm install
```

Create a `.env` file in the API root:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=mysql://root:password@localhost:3306/presentra
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

Place the Firebase Admin service-account file at the path configured by `FIREBASE_SERVICE_ACCOUNT_PATH`. Do not commit this file.

Prepare the database and start the API:

```bash
npm run db:push
npm run db:seed  # optional development/sample data
npm run dev
```

The API runs at `http://localhost:3000` and exposes its routes under `http://localhost:3000/api`.

For the complete API setup, endpoint reference, database notes, and security guidance, see the [Presentra API README](https://github.com/Myankoi/presentra-api#readme).

### 3. Configure and run the web dashboard

From the web repository:

```bash
cd presentra-web
npm install
```

Create a `.env` file in the project root:

```env
# Presentra API base URL, including the /api prefix
VITE_API_URL=http://localhost:3000/api

# Firebase Web configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Copy the Firebase Web configuration values from **Firebase Console → Project settings → Your apps**. The Firebase project must match the Firebase project used by the API.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Base URL of the Presentra API, normally ending in `/api` |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project identifier |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase Cloud Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase Web app ID |

Vite exposes variables prefixed with `VITE_` to browser code. Do not put database credentials, Firebase Admin credentials, service-account JSON, or other server secrets in this file.

## Authentication and Authorization

1. A user signs in with email and password through Firebase Authentication.
2. The frontend loads the user profile from `GET /api/users/me`.
3. Axios attaches the Firebase ID token to subsequent API requests.
4. The API verifies the token and resolves the application role from the database.
5. `ProtectedRoute` allows the dashboard only for `admin` and `bk` users.

The API supports these roles:

| Role | Responsibility |
| --- | --- |
| `admin` | Manage master data, schedules, QR codes, dashboards, and reports |
| `guru` | Record teacher attendance, view schedules, and monitor attendance |
| `sekretaris` | Record and review attendance for the assigned class |
| `bk` | View dashboards, attendance analytics, absence rankings, and reports |

Only `admin` and `bk` are currently allowed into this web dashboard. Role capabilities for `guru` and `sekretaris` are implemented by the API for other clients.

## API Integration

Frontend API calls are grouped by domain in `src/services/`:

| Frontend service | API area |
| --- | --- |
| `dashboard.ts` | Dashboard summaries and charts |
| `pengguna.ts` | User administration and bulk user imports |
| `kelas.ts` | Class management and QR codes |
| `siswa.ts` | Student management |
| `mapel.ts` | Subject management |
| `jadwal.ts` | Teaching and duty schedules |
| `laporan.ts` | Attendance recaps and Excel exports |
| `bk.ts` | Counseling statistics and absence rankings |
| `notification.ts` | Notifications and unread counts |

The complete endpoint contract is maintained in the [Presentra API repository](https://github.com/Myankoi/presentra-api#api-reference).

## Project Structure

```text
src/
├── components/
│   ├── layout/        # Sidebar, TopBar, and page layout components
│   ├── shared/        # Protected routes and shared loading states
│   └── ui/            # Reusable UI components
├── hooks/             # Authentication and data-fetching hooks
├── lib/               # Axios, Firebase, and utility modules
├── pages/             # Dashboard pages grouped by feature
├── services/          # API calls grouped by domain
└── types/             # Shared TypeScript models and API response types
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Development Notes

- Keep the API running while using the dashboard. Most pages load their data from the API during initialization.
- If requests fail with `401`, verify that the Firebase project, logged-in account, and API service-account configuration are aligned.
- If the API is running on another host or port, update `VITE_API_URL` and restart the Vite server.
- For a local database with sample records, run `npm run db:seed` in the API repository.
- Do not use the API development auth bypass outside local development. Details are documented in the [API authentication guide](https://github.com/Myankoi/presentra-api#authentication).

## Security Notes

- Never commit `.env` files or Firebase service-account JSON files.
- Never expose API database credentials or Firebase Admin credentials through `VITE_` variables.
- Use the same Firebase project for the web client and API Admin SDK.
- Restrict API CORS origins before deploying to production.
- Disable any development-only authentication bypass outside local development.
- Avoid sharing real student data in screenshots, issues, examples, or public logs.

## Related Repositories

- **Backend API:** [Myankoi/presentra-api](https://github.com/Myankoi/presentra-api)
- **Web dashboard:** [Myankoi/presentra-web](https://github.com/Myankoi/presentra-web)

## GitHub Repository Metadata

Suggested **About** description:

```text
Admin dashboard for Presentra, a QR-based school attendance management system built with React, Vite, TypeScript, Tailwind CSS, and Firebase Auth.
```

Suggested repository **Topics**:

```text
presentra, school-attendance, attendance-system, school-management,
admin-dashboard, education-technology, react, vite, typescript,
tailwindcss, firebase-auth, qr-code, rest-api, axios, recharts
```

These values can be added from **GitHub → Settings → General → Repository details**.

## License

No license is currently declared for this frontend repository.
