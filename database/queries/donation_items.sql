-- DonationItem raw SQL examples (SQL Server / SSMS)
USE [MediShareDB];
GO

-- READ ALL donation items with medicine
SELECT
    di.donation_item_id,
    di.donation_id,
    di.medicine_id,
    di.batch_number,
    di.quantity,
    di.manufacturing_date,
    di.expiry_date,
    di.packaging_condition,
    di.storage_condition,
    m.medicine_name,
    m.generic_name,
    m.manufacturer,
    m.dosage_form,
    m.strength,
    m.medicine_category,
    m.prescription_required
FROM dbo.donation_item di
LEFT JOIN dbo.medicine m ON di.medicine_id = m.medicine_id
ORDER BY di.donation_item_id;
GO

-- READ items for one donation
SELECT
    di.*,
    m.medicine_name,
    m.medicine_category,
    m.prescription_required
FROM dbo.donation_item di
LEFT JOIN dbo.medicine m ON di.medicine_id = m.medicine_id
WHERE di.donation_id = @donation_id;
GO

-- READ ONE donation item
SELECT di.*, m.medicine_name
FROM dbo.donation_item di
LEFT JOIN dbo.medicine m ON di.medicine_id = m.medicine_id
WHERE di.donation_item_id = @id;
GO

-- CREATE donation item
INSERT INTO dbo.donation_item (
    donation_id,
    medicine_id,
    batch_number,
    quantity,
    manufacturing_date,
    expiry_date,
    packaging_condition,
    storage_condition
)
OUTPUT inserted.donation_item_id AS donation_item_id
VALUES (
    @donation_id,
    @medicine_id,
    @batch_number,
    @quantity,
    @manufacturing_date,
    @expiry_date,
    @packaging_condition,
    @storage_condition
);
GO

-- UPDATE donation item
UPDATE dbo.donation_item
SET medicine_id = @medicine_id,
    batch_number = @batch_number,
    quantity = @quantity,
    manufacturing_date = @manufacturing_date,
    expiry_date = @expiry_date,
    packaging_condition = @packaging_condition,
    storage_condition = @storage_condition
WHERE donation_item_id = @id;
GO

-- Safety check before DELETE (inventory and optional verification)
SELECT COUNT(*) AS inventory_count
FROM dbo.inventory
WHERE donation_item_id = @id;
GO

-- DELETE donation item
DELETE FROM dbo.donation_item
WHERE donation_item_id = @id;
GO
