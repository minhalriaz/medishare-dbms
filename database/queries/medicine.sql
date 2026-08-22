-- medicine.sql
USE [MediShareDB];
GO

-- Read all medicines
SELECT * FROM dbo.medicine;
GO

-- Read single medicine by id
SELECT * FROM dbo.medicine WHERE medicine_id = @id;
GO

-- Insert medicine
INSERT INTO dbo.medicine (medicine_name, generic_name, manufacturer, dosage_form, strength)
VALUES (@medicine_name, @generic_name, @manufacturer, @dosage_form, @strength);
GO

-- Update medicine
UPDATE dbo.medicine
SET medicine_name = @medicine_name,
    generic_name = @generic_name,
    manufacturer = @manufacturer,
    dosage_form = @dosage_form,
    strength = @strength
WHERE medicine_id = @id;
GO

-- Delete medicine
DELETE FROM dbo.medicine WHERE medicine_id = @id;
GO
