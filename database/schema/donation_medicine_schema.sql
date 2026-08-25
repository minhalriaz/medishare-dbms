-- Donation, DonationItem, and Medicine schema for MediShareDB (SQL Server / SSMS)
-- Matches the project ERD. Does not drop or recreate user, organization, or inventory.

USE [MediShareDB];
GO

IF OBJECT_ID(N'dbo.medicine', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.medicine (
        medicine_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        medicine_name NVARCHAR(150) NOT NULL,
        generic_name NVARCHAR(100) NULL,
        manufacturer NVARCHAR(100) NULL,
        dosage_form NVARCHAR(100) NULL,
        strength NVARCHAR(100) NULL,
        medicine_category NVARCHAR(100) NULL,
        prescription_required BIT NOT NULL CONSTRAINT DF_medicine_prescription_required DEFAULT (0)
    );
END
GO

IF COL_LENGTH(N'dbo.medicine', N'medicine_category') IS NULL
BEGIN
    ALTER TABLE dbo.medicine ADD medicine_category NVARCHAR(100) NULL;
END
GO

IF COL_LENGTH(N'dbo.medicine', N'prescription_required') IS NULL
BEGIN
    ALTER TABLE dbo.medicine ADD prescription_required BIT NOT NULL CONSTRAINT DF_medicine_prescription_required DEFAULT (0);
END
GO

IF OBJECT_ID(N'dbo.donation', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.donation (
        donation_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        donor_user_id INT NOT NULL,
        receiving_organization_id INT NOT NULL,
        donation_date DATE NOT NULL,
        donation_status NVARCHAR(50) NOT NULL,
        donor_note NVARCHAR(MAX) NULL
    );
END
GO

IF OBJECT_ID(N'dbo.donation_item', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.donation_item (
        donation_item_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        donation_id INT NOT NULL,
        medicine_id INT NOT NULL,
        batch_number NVARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        manufacturing_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        packaging_condition NVARCHAR(255) NOT NULL,
        storage_condition NVARCHAR(255) NOT NULL
    );
END
GO
