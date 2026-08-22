-- donations.sql
USE [MediShareDB];
GO

-- Read all donations with their items
SELECT d.*, di.*
FROM dbo.donation d
LEFT JOIN dbo.donation_item di ON di.donation_id = d.donation_id;
GO

-- Read single donation by id (parameterize @id in SSMS query window)
-- Example: DECLARE @id INT = 1;  EXEC sp_executesql N'SELECT * FROM dbo.donation WHERE donation_id = @id', N'@id INT', @id;
SELECT * FROM dbo.donation WHERE donation_id = @id;
GO

-- Insert donation (use parameters in your client)
INSERT INTO dbo.donation (donor_user_id, receiving_organization_id, donation_date, donation_status, donor_note)
VALUES (@donor_user_id, @receiving_organization_id, @donation_date, @donation_status, @donor_note);
GO

-- Insert donation item
INSERT INTO dbo.donation_item (donation_id, medicine_id, batch_number, quantity, manufacturing_date, expiry_date, packaging_condition, storage_condition)
VALUES (@donation_id, @medicine_id, @batch_number, @quantity, @manufacturing_date, @expiry_date, @packaging_condition, @storage_condition);
GO

-- Update donation
UPDATE dbo.donation
SET donor_user_id = @donor_user_id,
    receiving_organization_id = @receiving_organization_id,
    donation_date = @donation_date,
    donation_status = @donation_status,
    donor_note = @donor_note
WHERE donation_id = @id;
GO

-- Delete donation (and related items)
DELETE FROM dbo.donation_item WHERE donation_id = @id;
DELETE FROM dbo.donation WHERE donation_id = @id;
GO
