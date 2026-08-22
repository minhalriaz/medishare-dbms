-- dashboard.sql
USE [MediShareDB];
GO

-- Total donations
SELECT COUNT(*) AS total_donations FROM dbo.donation;

-- Pending donations
SELECT COUNT(*) AS pending_donations FROM dbo.donation WHERE donation_status = 'Pending';

-- Completed donations
SELECT COUNT(*) AS completed_donations FROM dbo.donation WHERE donation_status = 'Completed';

-- Total inventory quantity
SELECT SUM(quantity) AS total_inventory_items FROM dbo.inventory;

-- Medicines close to expiry (within 90 days)
SELECT * FROM dbo.inventory WHERE expiry_date <= DATEADD(day, 90, CAST(GETDATE() AS date));
GO
