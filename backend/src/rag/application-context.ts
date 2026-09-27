import { RagEntity } from './question-analyzer';
import { RagSource } from './rag.types';

const applicationContext: Record<RagEntity, { section: string; content: string }> = {
  medicine: {
    section: 'Medicine catalog',
    content: 'The medicine catalog stores medicine name, generic name, manufacturer, dosage form, strength, category and prescription-required flag. No price field is declared. Medicine edits are recorded by the medicine audit trigger.',
  },
  inventory: {
    section: 'Inventory',
    content: 'Inventory rows link an organization and a donation item. The application displays received quantity, available quantity, storage location and inventory status. InventoryService sets Out of Stock when available quantity is zero, Low Stock below 20 percent of received quantity, and Available otherwise. Distribution-item operations deduct or restore available quantity transactionally.',
  },
  donations: {
    section: 'Donations',
    content: 'A donation records a donor user, receiving organization, date, status and optional donor note. Donation items identify medicine, batch, quantity, manufacturing and expiry dates, packaging condition and storage condition. Donation create/update operations save donation and item data in a transaction.',
  },
  'donation-items': {
    section: 'Donation items',
    content: 'A donation item belongs to a donation and a medicine. Its recorded fields include batch number, quantity, manufacturing date, expiry date, packaging condition and storage condition. Inventory references a donation-item ID in application queries.',
  },
  organizations: {
    section: 'Organizations',
    content: 'An organization has a representative user, name, type, licence number, address and verification status. Organization inventory is linked through inventory.organization_id. Organization verification status is stored on the organization row; this is distinct from verification records for donated items.',
  },
  users: {
    section: 'Users',
    content: 'User rows contain account identity, contact fields, account type and account status. Password hashes are sensitive and must never be returned by the assistant. User-to-organization and user-to-donation relationships are used by existing application queries.',
  },
  verification: {
    section: 'Medicine verification',
    content: 'The verification service checks that a donation item and verifier user exist and prevents more than one verification record per donation item. It sets verification_date on create and exposes a detail view joining verifier, donation item, medicine, donation and receiving organization. Live verification-record retrieval is unavailable until the deployed table DDL is confirmed.',
  },
  requests: {
    section: 'Medicine requests',
    content: 'A medicine request links a requester user to the organization it is requested from and records priority, reason, status and request date. The UI offers Pending, Approved and Rejected statuses and Normal, High and Urgent priorities. Request items identify requested medicines and quantities.',
  },
  'request-items': {
    section: 'Request items',
    content: 'Each request item links one medicine to one medicine request and records quantity and optional notes. The checked-in SQL requires a positive quantity and cascades request deletion to request items.',
  },
  distributions: {
    section: 'Distributions',
    content: 'A distribution links a medicine request to the distributing organization and records date, status, receiver and delivery note. The UI offers Pending, In Transit, Completed and Cancelled. Existing coverage/outstanding queries treat Completed and In Transit distributions as fulfilled.',
  },
  'distribution-items': {
    section: 'Distribution items',
    content: 'A distribution item allocates a positive quantity from an inventory row to a distribution. The service checks that stock belongs to the distributing organization, the medicine appears in the request, allocation does not exceed requested quantity, and enough inventory is available. Creation, update and removal adjust inventory in a transaction.',
  },
  'medicine-audit': {
    section: 'Medicine audit',
    content: 'The medicine audit table records UPDATE actions with old and new medicine fields, timestamp and database actor. The trigger logs changes made to medicine records; the checked-in trigger script also includes a sample update used as a test.',
  },
  reports: {
    section: 'Reports',
    content: 'The Reports page exposes Donation Summary, Organization Activity, Medicine Contribution, High-Volume Donations (more than five units), and Donation Insights (average item quantity and donations above average total quantity). These are computed from donation, donation_item, medicine and organization data; there is no reports table.',
  },
};

const overview = {
  section: 'MediShare application',
  content: 'MediShare manages a medicine catalog, donated medicine batches, organization inventory, organization requests and the distribution of requested stock. Its frontend includes medicine, inventory, donations, organizations, users, verification, requests, request items, distributions, distribution items, reports and the AI assistant.',
};

export function getApplicationContext(entity?: RagEntity): {
  context: string;
  sources: RagSource[];
} {
  const entry = entity ? applicationContext[entity] : overview;
  return {
    context: `${entry.section}: ${entry.content}`,
    sources: [
      {
        kind: 'application',
        label: `Application: ${entry.section}`,
        section: entry.section,
      },
    ],
  };
}