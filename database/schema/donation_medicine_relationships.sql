-- ERD foreign keys for Donation, DonationItem, and Medicine
-- Does not add a foreign key from donation to donation_item.

USE [MediShareDB];
GO

IF OBJECT_ID(N'dbo.user', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.donation', N'U') IS NOT NULL
   AND OBJECT_ID(N'FK_Donation_DonorUser', N'F') IS NULL
BEGIN
    ALTER TABLE dbo.donation
    ADD CONSTRAINT FK_Donation_DonorUser
        FOREIGN KEY (donor_user_id) REFERENCES dbo.[user](user_id);
END
GO

IF OBJECT_ID(N'dbo.organization', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.donation', N'U') IS NOT NULL
   AND OBJECT_ID(N'FK_Donation_ReceivingOrganization', N'F') IS NULL
BEGIN
    ALTER TABLE dbo.donation
    ADD CONSTRAINT FK_Donation_ReceivingOrganization
        FOREIGN KEY (receiving_organization_id) REFERENCES dbo.organization(organization_id);
END
GO

IF OBJECT_ID(N'FK_DonationItem_Donation', N'F') IS NULL
BEGIN
    ALTER TABLE dbo.donation_item
    ADD CONSTRAINT FK_DonationItem_Donation
        FOREIGN KEY (donation_id) REFERENCES dbo.donation(donation_id);
END
GO

IF OBJECT_ID(N'FK_DonationItem_Medicine', N'F') IS NULL
BEGIN
    ALTER TABLE dbo.donation_item
    ADD CONSTRAINT FK_DonationItem_Medicine
        FOREIGN KEY (medicine_id) REFERENCES dbo.medicine(medicine_id);
END
GO
