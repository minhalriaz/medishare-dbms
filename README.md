# medishare-dbms
An ERD-focused database system for managing medicine donations, verification, inventory, expiry tracking, recipient requests, and redistribution.

## Request Item CRUD (Nazifa)

The complete MySQL-backed Request Item CRUD is available at `http://localhost:3001/request-items`.

- MySQL schema: `database/request_item_mysql.sql`
- API: `GET/POST /request-items` and `GET/PATCH/DELETE /request-items/:id`
- The UI performs real create, read, update and delete operations through the NestJS backend.

## Medicine Inventory Frontend Checkpoint

A real API-connected Medicine Inventory CRUD screen is available at:

- `http://localhost:3001/inventory`

### 1. Backend setup

Copy `backend/.env.example` to `backend/.env` and set the MySQL credentials, then run:

```bash
cd backend
npm install
npm run start:dev
```

The NestJS API uses port `3000` by default.

### 2. Frontend setup

Copy `frontend/.env.example` to `frontend/.env.local`, then run the frontend on port `3001`:

```bash
cd frontend
npm install
npm run dev -- -p 3001
```

`NEXT_PUBLIC_API_URL` defaults to `http://localhost:3000`.

### Inventory CRUD API used by the frontend

- `GET /inventory`
- `GET /inventory/:id`
- `POST /inventory`
- `PATCH /inventory/:id`
- `DELETE /inventory/:id`

The Inventory UI does not use mock CRUD data. Create, view, edit, and delete actions call the NestJS backend directly, and successful mutations refresh the list from the backend.
