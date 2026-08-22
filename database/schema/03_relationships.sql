-- 03_relationships.sql
USE [MediShareDB];
GO

-- Add foreign key constraints for donation_item
IF OBJECT_ID('FK_DonationItem_Donation', 'F') IS NULL
BEGIN
    ALTER TABLE dbo.donation_item
    ADD CONSTRAINT FK_DonationItem_Donation FOREIGN KEY (donation_id) REFERENCES dbo.donation(donation_id);
END
GO

IF OBJECT_ID('FK_DonationItem_Medicine', 'F') IS NULL
BEGIN
    ALTER TABLE dbo.donation_item
    ADD CONSTRAINT FK_DonationItem_Medicine FOREIGN KEY (medicine_id) REFERENCES dbo.medicine(medicine_id);
END
GO
