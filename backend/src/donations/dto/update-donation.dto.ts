export class UpdateDonationDto {
    donor_user_id?: number;
    receiving_organization_id?: number;
    donation_date?: string;
    donation_status?: string;
    donor_note?: string;
}