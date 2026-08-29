import { getApiBaseUrl } from '@/lib/apiBase';

const API_URL = getApiBaseUrl();

export interface UserRecord {
    user_id: number;
    full_name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    user_type: string;
    account_status: string;
}

export async function getUsers(): Promise<UserRecord[]> {
    const response = await fetch(`${API_URL}/users`);

    if (!response.ok) {
        throw new Error(`Unable to load users (API ${response.status}).`);
    }

    return response.json();
}


export async function createUser(data: Omit<UserRecord, 'user_id'> & { password_hash: string }) {

    const response = await fetch(
        `${API_URL}/users`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify(data)
        }
    );

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Unable to create user (API ${response.status}).`);
    }

    return response.json();
}

export async function updateUser(
    id: number,
    data: Partial<Omit<UserRecord, 'user_id'>> & { password_hash?: string },
) {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Unable to update user (API ${response.status}).`);
    }

    return response.json();
}

export async function deleteUser(id: number) {
    const response = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Unable to delete user (API ${response.status}).`);
    }

    return response.text();
}