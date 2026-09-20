'use client';

import { FormEvent, useEffect, useState } from 'react';
import { X, ShieldCheck, Save } from 'lucide-react';

import {
  Verification,
  VerificationPayload,
} from '@/types/verification';

interface VerificationFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  verification?: Verification | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (
    payload: VerificationPayload,
  ) => Promise<void>;
}

type FormState = {
  donation_item_id: string;
  verified_by_user_id: string;
  verification_result: string;
  verification_remarks: string;
};

const emptyForm: FormState = {
  donation_item_id: '',
  verified_by_user_id: '',
  verification_result: '',
  verification_remarks: '',
};

export default function VerificationFormModal({
  open,
  mode,
  verification,
  submitting = false,
  onClose,
  onSubmit,
}: VerificationFormModalProps) {
  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => {
      if (mode === 'edit' && verification) {
        setForm({
          donation_item_id: String(
            verification.donation_item_id,
          ),
          verified_by_user_id: String(
            verification.verified_by_user_id,
          ),
          verification_result:
            verification.verification_result || '',
          verification_remarks:
            verification.verification_remarks || '',
        });
      } else {
        setForm(emptyForm);
      }

      setErrors({});
    }, 0);

    return () =>
      window.clearTimeout(timeoutId);
  }, [open, mode, verification]);

  if (!open) return null;

  const setField = (
    field: keyof FormState,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: '',
    }));
  };

  const validate = () => {
    const nextErrors: Record<
      string,
      string
    > = {};

    const donationItemId =
      Number(form.donation_item_id);

    const userId =
      Number(form.verified_by_user_id);

    if (
      !Number.isInteger(donationItemId) ||
      donationItemId <= 0
    ) {
      nextErrors.donation_item_id =
        'Donation Item ID must be a positive integer.';
    }

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      nextErrors.verified_by_user_id =
        'User ID must be a positive integer.';
    }

    if (!form.verification_result.trim()) {
      nextErrors.verification_result =
        'Verification Result is required.';
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validate()) return;

    await onSubmit({
      donation_item_id: Number(
        form.donation_item_id,
      ),
      verified_by_user_id: Number(
        form.verified_by_user_id,
      ),
      verification_result:
        form.verification_result.trim(),
      verification_remarks:
        form.verification_remarks.trim() ||
        undefined,
    });
  };

  const inputClass = (
    hasError: boolean,
  ) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-emerald-100 ${
      hasError
        ? 'border-rose-300 focus:border-rose-400'
        : 'border-gray-200 focus:border-emerald-500'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">

      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

              {mode === 'create' ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <Save className="h-5 w-5" />
              )}

            </div>

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                {mode === 'create'
                  ? 'Add Verification'
                  : 'Edit Verification'}
              </h2>

              <p className="text-xs text-gray-500">
                Verification Information
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="max-h-[78vh] overflow-y-auto p-6"
        >

          {mode === 'edit' &&
            verification && (
              <div className="mb-5 grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">

                <div>

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Verification ID
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    #{verification.verification_id}
                  </p>

                </div>

                <div>

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Verification Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {new Date(
                      verification.verification_date,
                    ).toLocaleString()}
                  </p>

                </div>

              </div>
            )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <Field
              label="Donation Item ID"
              error={
                errors.donation_item_id
              }
            >

              <input
                type="number"
                min="1"
                step="1"
                value={
                  form.donation_item_id
                }
                onChange={(e) =>
                  setField(
                    'donation_item_id',
                    e.target.value,
                  )
                }
                placeholder="1"
                className={inputClass(
                  Boolean(
                    errors.donation_item_id,
                  ),
                )}
                disabled={submitting}
              />

            </Field>

            <Field
              label="Verified By User ID"
              error={
                errors.verified_by_user_id
              }
            >

              <input
                type="number"
                min="1"
                step="1"
                value={
                  form.verified_by_user_id
                }
                onChange={(e) =>
                  setField(
                    'verified_by_user_id',
                    e.target.value,
                  )
                }
                placeholder="1"
                className={inputClass(
                  Boolean(
                    errors.verified_by_user_id,
                  ),
                )}
                disabled={submitting}
              />

            </Field>

            <Field
              label="Verification Result"
              error={
                errors.verification_result
              }
            >

              <input
                type="text"
                value={
                  form.verification_result
                }
                onChange={(e) =>
                  setField(
                    'verification_result',
                    e.target.value,
                  )
                }
                placeholder="Approved"
                maxLength={50}
                className={inputClass(
                  Boolean(
                    errors.verification_result,
                  ),
                )}
                disabled={submitting}
              />

            </Field>

            <Field
              label="Verification Remarks"
              error={
                errors.verification_remarks
              }
            >

              <input
                type="text"
                value={
                  form.verification_remarks
                }
                onChange={(e) =>
                  setField(
                    'verification_remarks',
                    e.target.value,
                  )
                }
                placeholder="Optional remarks"
                maxLength={500}
                className={inputClass(
                  Boolean(
                    errors.verification_remarks,
                  ),
                )}
                disabled={submitting}
              />

            </Field>

          </div>

          {/* BUTTONS */}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {mode === 'create' ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {submitting
                ? 'Saving...'
                : mode === 'create'
                  ? 'Add Verification'
                  : 'Save Changes'}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </span>

      {children}

      {error && (
        <span className="mt-1.5 block text-xs text-rose-600">
          {error}
        </span>
      )}

    </label>
  );
}