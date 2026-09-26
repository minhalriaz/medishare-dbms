# medishare-dbms
An ERD-focused database system for managing medicine donations, verification, inventory, expiry tracking, recipient requests, and redistribution.

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


### Distribution items

Run `database/schema/distribution_item_schema.sql` in SQL Server **after** the distribution,
inventory, donation item, medicine, and request item schemas. The new
`/distribution-items` screen adds, edits, and removes medicine batches for a
distribution. Each operation adjusts inventory atomically and rejects an item
from another organization, an unrequested medicine, insufficient stock, or a
quantity above the requested total. The API routes are
`GET /distribution-items`, `GET /distribution-items/options`,
`GET /distribution-items/:id`, `POST /distribution-items`,
`PATCH /distribution-items/:id`, and `DELETE /distribution-items/:id`.
