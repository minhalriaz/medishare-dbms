-- inventory.sql
USE [MediShareDB];
GO

-- Read all inventory
SELECT * FROM dbo.inventory;
GO

-- Read single inventory item by id
SELECT * FROM dbo.inventory WHERE id = @id;
GO

-- Insert inventory
INSERT INTO dbo.inventory (medicine_name, batch_number, quantity, expiry_date, status)
VALUES (@medicine_name, @batch_number, @quantity, @expiry_date, @status);
GO

-- Update inventory
UPDATE dbo.inventory
SET medicine_name = @medicine_name,
    batch_number = @batch_number,
    quantity = @quantity,
    expiry_date = @expiry_date,
    status = @status
WHERE id = @id;
GO

-- Delete inventory
DELETE FROM dbo.inventory WHERE id = @id;
GO
