'use client';

import Sidebar from '@/components/Sidebar';
import {
  ArrowLeft,
  Building2,
  Save,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { organizationApi } from '../../../services/organizationApi';

export default function NewOrganizationPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',

    organization_name: '',
    organization_type: '',
    licence_number: '',
    organization_address: '',
    verification_status: 'Pending',
  });

  function handleChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      await organizationApi.createOrganization(
        formData,
      );

      router.push('/organizations');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create organization',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <Sidebar />

      <main className="min-h-screen px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}

          <header className="mb-7">
            <p className="text-xs font-medium text-gray-400">
              Dashboard / Organizations / New
            </p>

            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Building2 className="h-5 w-5" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    Add Organization
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    Register a new organization and its
                    representative.
                  </p>
                </div>
              </div>

              <Link
                href="/organizations"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />

                Back
              </Link>
            </div>
          </header>

          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Representative */}

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <User className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="font-bold text-gray-800">
                    Representative Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Details of the person representing the
                    organization.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />

                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <Field
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <Field
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Organization */}

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Building2 className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="font-bold text-gray-800">
                    Organization Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Organization registration information.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Organization Name"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Organization Type
                  </label>

                  <select
                    name="organization_type"
                    value={formData.organization_type}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">
                      Select organization type
                    </option>

                    <option value="Hospital">
                      Hospital
                    </option>

                    <option value="Clinic">
                      Clinic
                    </option>

                    <option value="NGO">
                      NGO
                    </option>

                    <option value="Pharmacy">
                      Pharmacy
                    </option>

                    <option value="Charity">
                      Charity
                    </option>
                  </select>
                </div>

                <Field
                  label="Licence Number"
                  name="licence_number"
                  value={formData.licence_number}
                  onChange={handleChange}
                  required
                />

                <Field
                  label="Organization Address"
                  name="organization_address"
                  value={
                    formData.organization_address
                  }
                  onChange={handleChange}
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Verification Status
                  </label>

                  <select
                    name="verification_status"
                    value={
                      formData.verification_status
                    }
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Verified">
                      Verified
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>
                  </select>
                </div>
              </div>
            </section>

            <div className="flex justify-end gap-3">
              <Link
                href="/organizations"
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />

                {saving
                  ? 'Creating...'
                  : 'Create Organization'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// =====================================================
// REUSABLE INPUT COMPONENT
// =====================================================

function Field({
  label,
  name,
  value,
  type = 'text',
  required = false,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  type?: string;
  required?: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input
        name={name}
        value={value}
        type={type}
        required={required}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}