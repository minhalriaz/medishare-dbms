-- 02_create_tables.sql
USE [MediShareDB];
GO

-- Create core tables: medicine, donation, inventory
-- Medicine
IF OBJECT_ID('dbo.medicine', 'U') IS NOT NULL DROP TABLE dbo.medicine;
CREATE TABLE dbo.medicine (
    medicine_id INT IDENTITY(1,1) PRIMARY KEY,
    medicine_name NVARCHAR(150) NOT NULL,
    generic_name NVARCHAR(100) NULL,
    manufacturer NVARCHAR(100) NULL,
    dosage_form NVARCHAR(100) NULL,
    strength NVARCHAR(100) NULL
);
GO

-- Donation
IF OBJECT_ID('dbo.donation', 'U') IS NOT NULL DROP TABLE dbo.donation;
CREATE TABLE dbo.donation (
    donation_id INT IDENTITY(1,1) PRIMARY KEY,
    donor_user_id INT NOT NULL,
    receiving_organization_id INT NOT NULL,
    donation_date DATE NOT NULL,
    donation_status NVARCHAR(50) NOT NULL,
    donor_note NVARCHAR(MAX) NULL
);
GO

-- Inventory
IF OBJECT_ID('dbo.inventory', 'U') IS NOT NULL DROP TABLE dbo.inventory;
CREATE TABLE dbo.inventory (
    id INT IDENTITY(1,1) PRIMARY KEY,
    medicine_name NVARCHAR(200) NOT NULL,
    batch_number NVARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    expiry_date DATE NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'Available',
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- Donation Item (created after medicine and donation to allow FKs)
IF OBJECT_ID('dbo.donation_item', 'U') IS NOT NULL DROP TABLE dbo.donation_item;
CREATE TABLE dbo.donation_item (
    donation_item_id INT IDENTITY(1,1) PRIMARY KEY,
    donation_id INT NOT NULL,
    medicine_id INT NOT NULL,
    batch_number NVARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    manufacturing_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    packaging_condition NVARCHAR(255) NOT NULL,
    storage_condition NVARCHAR(255) NOT NULL
);
GO
