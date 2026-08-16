import { Donation, CreateDonationDto } from '../types/donation';

// Dummy Initial Data
let initialDonations: Donation[] = [
  {
    id: '1',
    donationId: 'DON-000128',
    donor: 'Sarah Johnson',
    receivingOrganization: 'City Hospital',
    donationDate: 'May 12, 2025',
    status: 'Completed',
    donorNote: 'Thank you for your generosity!',
    totalValue: 1250,
    medicineItems: [
      { medicine: 'Paracetamol 500mg', batchNumber: 'BAT-101', quantity: 50, manufacturingDate: '2024-01-01', expiryDate: '2026-05-12', packagingCondition: 'Sealed', storageCondition: 'Room Temperature' },
      { medicine: 'Amoxicillin 250mg', batchNumber: 'BAT-102', quantity: 30, manufacturingDate: '2024-02-01', expiryDate: '2026-06-15', packagingCondition: 'Sealed', storageCondition: 'Cool Place' },
      { medicine: 'Ibuprofen 400mg', batchNumber: 'BAT-103', quantity: 20, manufacturingDate: '2024-01-15', expiryDate: '2026-07-20', packagingCondition: 'Good', storageCondition: 'Room Temperature' },
      { medicine: 'Vitamin C 500mg', batchNumber: 'BAT-104', quantity: 10, manufacturingDate: '2024-03-01', expiryDate: '2026-08-10', packagingCondition: 'Sealed', storageCondition: 'Room Temperature' },
    ],
  },
  {
    id: '2',
    donationId: 'DON-000127',
    donor: 'HealthPlus Foundation',
    receivingOrganization: 'Green Valley Clinic',
    donationDate: 'May 11, 2025',
    status: 'Completed',
    totalValue: 2340,
    medicineItems: [
      { medicine: 'Omeprazole 20mg', batchNumber: 'BAT-201', quantity: 15, manufacturingDate: '2024-01-01', expiryDate: '2026-11-01', packagingCondition: 'Sealed', storageCondition: 'Room Temperature' },
    ],
  },
  {
    id: '3',
    donationId: 'DON-000126',
    donor: 'Mary Williams',
    receivingOrganization: 'Sunshine Hospital',
    donationDate: 'May 10, 2025',
    status: 'Pending',
    totalValue: 890,
    medicineItems: [
      { medicine: 'Metformin 500mg', batchNumber: 'BAT-301', quantity: 6, manufacturingDate: '2024-02-10', expiryDate: '2026-09-01', packagingCondition: 'Sealed', storageCondition: 'Room Temperature' },
    ],
  },
  {
    id: '4',
    donationId: 'DON-000125',
    donor: 'MedLife Charity',
    receivingOrganization: 'Hope Medical Center',
    donationDate: 'May 9, 2025',
    status: 'Received',
    totalValue: 3450,
    medicineItems: [
      { medicine: 'Aztor 10mg', batchNumber: 'BAT-401', quantity: 20, manufacturingDate: '2024-01-20', expiryDate: '2026-10-05', packagingCondition: 'Sealed', storageCondition: 'Room Temperature' },
    ],
  },
  {
    id: '5',
    donationId: 'DON-000124',
    donor: 'James Anderson',
    receivingOrganization: 'City Hospital',
    donationDate: 'May 8, 2025',
    status: 'Completed',
    totalValue: 1780,
    medicineItems: [
      { medicine: 'Losartan 50mg', batchNumber: 'BAT-501', quantity: 10, manufacturingDate: '2024-03-01', expiryDate: '2026-12-01', packagingCondition: 'Good', storageCondition: 'Room Temperature' },
    ],
  },
  {
    id: '6',
    donationId: 'DON-000123',
    donor: 'Helping Hands Org.',
    receivingOrganization: 'Green Valley Clinic',
    donationDate: 'May 7, 2025',
    status: 'Pending',
    totalValue: 2150,
    medicineItems: [
      { medicine: 'Ciprofloxacin 500mg', batchNumber: 'BAT-601', quantity: 12, manufacturingDate: '2024-02-15', expiryDate: '2026-08-20', packagingCondition: 'Sealed', storageCondition: 'Room Temperature' },
    ],
  },
  {
    id: '7',
    donationId: 'DON-000122',
    donor: 'Linda Brown',
    receivingOrganization: 'Sunshine Hospital',
    donationDate: 'May 6, 2025',
    status: 'Cancelled',
    totalValue: 450,
    medicineItems: [
      { medicine: 'Cetirizine 10mg', batchNumber: 'BAT-701', quantity: 5, manufacturingDate: '2024-01-10', expiryDate: '2026-05-30', packagingCondition: 'Damaged', storageCondition: 'Room Temperature' },
    ],
  },
  {
    id: '8',
    donationId: 'DON-000121',
    donor: 'Global Medics',
    receivingOrganization: 'Hope Medical Center',
    donationDate: 'May 5, 2025',
    status: 'Received',
    totalValue: 2780,
    medicineItems: [
      { medicine: 'Azithromycin 500mg', batchNumber: 'BAT-801', quantity: 18, manufacturingDate: '2024-04-01', expiryDate: '2026-11-15', packagingCondition: 'Sealed', storageCondition: 'Room Temperature' },
    ],
  },
];

export const api = {
  // 1. Get all donations
  async getDonations(): Promise<Donation[]> {
    return Promise.resolve([...initialDonations]);
  },

  // 2. Get single donation by ID
  async getDonationById(id: string): Promise<Donation> {
    const item = initialDonations.find((d) => d.id === id);
    if (!item) throw new Error('Donation not found');
    return Promise.resolve(item);
  },

  // 3. Create a new donation
  async createDonation(data: CreateDonationDto): Promise<Donation> {
    const newDonation: Donation = {
      ...data,
      id: Date.now().toString(),
      donationId: `DON-000${Math.floor(100 + Math.random() * 900)}`,
      totalValue: data.medicineItems?.reduce((acc, curr) => acc + curr.quantity * 20, 0) || 500,
    };
    initialDonations.unshift(newDonation);
    return Promise.resolve(newDonation);
  },

  // 4. Update an existing donation
  async updateDonation(id: string, data: Partial<CreateDonationDto>): Promise<Donation> {
    const index = initialDonations.findIndex((d) => d.id === id);
    if (index !== -1) {
      initialDonations[index] = { ...initialDonations[index], ...data };
      return Promise.resolve(initialDonations[index]);
    }
    throw new Error('Donation not found');
  },

  // 5. Delete a donation
  async deleteDonation(id: string): Promise<void> {
    initialDonations = initialDonations.filter((d) => d.id !== id);
    return Promise.resolve();
  },
};