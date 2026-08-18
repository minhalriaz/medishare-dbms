export interface MedicineItem {
  id?: string;
  medicine: string;
  batchNumber: string;
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  packagingCondition: string;
  storageCondition: string;
}

export interface Donation {
  id: string;
  donationId?: string;
  donor: string;
  receivingOrganization: string;
  donationDate: string;
  status: 'Pending' | 'Completed' | 'Received' | 'Cancelled';
  donorNote?: string;
  itemsCount?: number;
  medicineItems: MedicineItem[];
}

export type CreateDonationDto = Omit<Donation, 'id' | 'donationId'>;