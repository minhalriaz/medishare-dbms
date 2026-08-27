"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Mail, MapPin, Phone, Plus, Search, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { createUser, deleteUser, getUsers, updateUser, UserRecord } from '@/services/userApi';


type UserForm = Omit<UserRecord, 'user_id'> & { password_hash: string };

const initialForm: UserForm = {
    full_name: '', email: '', phone: '', address: '', password_hash: '',
    user_type: 'Donor', account_status: 'Active',
};

export default function UsersPage() {

    const [users, setUsers] = useState<UserRecord[]>([]);
    const [form, setForm] = useState<UserForm>(initialForm);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);


    const loadUsers = async () => {
        try {
            setLoading(true); setError(''); setUsers(await getUsers());
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to load users.');
        } finally { setLoading(false); }
    };

    useEffect(() => { loadUsers(); }, []);

    const filteredUsers = useMemo(() => {
        const value = query.trim().toLowerCase();
        if (!value) return users;
        return users.filter((user) => [user.full_name, user.email, user.user_type, user.account_status]
            .some((field) => field?.toLowerCase().includes(value)));
    }, [query, users]);

    const updateField = (field: keyof UserForm, value: string) => {
        setForm((previous) => ({ ...previous, [field]: value }));
    };

    function handleEdit(user: UserRecord) {
        setEditingId(user.user_id);
        setForm({
            full_name: user.full_name,
            email: user.email,
            phone: user.phone ?? '',
            address: user.address ?? '',
            password_hash: '',
            user_type: user.user_type,
            account_status: user.account_status,
        });
        setError('');
        setSuccess('');
    }

    function cancelEdit() {
        setEditingId(null);
        setForm(initialForm);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); setSaving(true); setError(''); setSuccess('');
        try {
            if (editingId !== null) {

    const updateData = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        user_type: form.user_type,
        account_status: form.account_status,
    };

    await updateUser(editingId, updateData);

    setSuccess('User account updated successfully.');
            } else {
                await createUser(form);
                setSuccess('User account created successfully.');
            }
            setEditingId(null); setForm(initialForm); await loadUsers();
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to create user.');
        } finally { setSaving(false); }
    }

    async function handleDelete(id: number) {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            setError(''); setSuccess('');
            await deleteUser(id);
            if (editingId === id) cancelEdit();
            setSuccess('User account deleted successfully.');
            await loadUsers();
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to delete user.');
        }
    }


        return (
            <div className="min-h-screen bg-[#f5f9f7]"><Sidebar /><main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-64 lg:px-8 lg:py-8"><div className="mx-auto max-w-[1500px]">
                <header className="mb-8 flex flex-col gap-5 border-b border-emerald-100 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">MediShare administration</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">User accounts</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Create and review the people who keep medicine moving through the platform.</p></div><div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><UsersRound className="h-5 w-5" /></div><div><p className="text-xs font-medium text-slate-400">Registered users</p><p className="text-xl font-bold text-slate-900">{users.length}</p></div></div></header>
                {error && <Notice icon={<AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />} className="border-rose-100 bg-rose-50 text-rose-700">{error}</Notice>}{success && <Notice icon={<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />} className="border-emerald-100 bg-emerald-50 text-emerald-700">{success}</Notice>}
                <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]"><div className="mb-6 flex items-start gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">{editingId === null ? <Plus className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}</div><div><h2 className="text-lg font-bold text-slate-900">{editingId === null ? 'Add a user' : 'Edit user'}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{editingId === null ? 'Set access details for a new MediShare account.' : 'Update this account\'s profile and access details.'}</p></div></div><form onSubmit={handleSubmit} className="space-y-4"><Field label="Full name" value={form.full_name} onChange={(value) => updateField('full_name', value)} placeholder="e.g. Ayesha Khan" required /><Field label="Email address" type="email" value={form.email} onChange={(value) => updateField('email', value)} placeholder="name@example.com" required /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"><Field label="Phone" value={form.phone ?? ''} onChange={(value) => updateField('phone', value)} placeholder="Optional" /><Field label="User type" as="select" value={form.user_type} onChange={(value) => updateField('user_type', value)} options={['Donor', 'Recipient', 'Admin']} required /></div><Field label="Address" value={form.address ?? ''} onChange={(value) => updateField('address', value)} placeholder="Optional" /><Field label={editingId === null ? 'Password' : 'New password (optional)'} type="password" value={form.password_hash} onChange={(value) => updateField('password_hash', value)} placeholder={editingId === null ? 'Create a secure password' : 'Leave blank to keep current password'} required={editingId === null} /><div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500"><span>Account status</span><span className="font-semibold text-emerald-700">Active</span></div><div className="flex gap-3"><button type="submit" disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"><ShieldCheck className="h-4 w-4" />{saving ? 'Saving...' : editingId === null ? 'Create user account' : 'Update user account'}</button>{editingId !== null && <button type="button" onClick={cancelEdit} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>}</div></form></section>
                      <section className="min-w-0 rounded-3xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)]"><div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold text-slate-900">User directory</h2><p className="mt-1 text-xs text-slate-500">Search active accounts and access roles.</p></div><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" /></div></div>{loading ? <div className="p-12 text-center text-sm text-slate-500"><div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600" />Loading user directory...</div> : filteredUsers.length === 0 ? <div className="p-14 text-center"><UserRound className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">{query ? 'No matching users' : 'No users registered yet'}</p><p className="mt-1 text-xs text-slate-400">{query ? 'Try a different name, email, or role.' : 'Create the first account using the form.'}</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-400"><tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredUsers.map((user) => <tr key={user.user_id} className="transition hover:bg-emerald-50/30"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 font-bold text-teal-700">{user.full_name.charAt(0).toUpperCase()}</div><div><p className="font-semibold text-slate-800">{user.full_name}</p><p className="text-xs text-slate-400">ID #{user.user_id}</p></div></div></td><td className="px-6 py-4"><p className="flex items-center gap-2 text-sm text-slate-700"><Mail className="h-3.5 w-3.5 text-slate-400" />{user.email}</p>{user.phone && <p className="mt-1 flex items-center gap-2 text-xs text-slate-400"><Phone className="h-3.5 w-3.5" />{user.phone}</p>}{user.address && <p className="mt-1 flex items-center gap-2 text-xs text-slate-400"><MapPin className="h-3.5 w-3.5" />{user.address}</p>}</td><td className="px-6 py-4"><span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{user.user_type}</span></td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.account_status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{user.account_status}</span></td><td className="px-6 py-4"><div className="flex gap-2"><button type="button" onClick={() => handleEdit(user)} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">Edit</button><button type="button" onClick={() => handleDelete(user.user_id)} className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">Delete</button></div></td></tr>)}</tbody></table></div>}</section></div>
            </div></main></div>
        );
}

function Notice({ icon, className, children }: { icon: React.ReactNode; className: string; children: React.ReactNode }) { return <div className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${className}`}>{icon}<span>{children}</span></div>; }

function Field({ label, value, onChange, placeholder, type = 'text', required = false, as = 'input', options }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean; as?: 'input' | 'select'; options?: string[] }) { const className = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100'; return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}{required && <span className="ml-1 text-rose-500">*</span>}</span>{as === 'select' ? <select value={value} required={required} onChange={(event) => onChange(event.target.value)} className={className}>{options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input type={type} value={value} required={required} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={className} />}</label>; }