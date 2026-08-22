-- 04_insert_sample_data.sql
USE [MediShareDB];
GO

INSERT INTO dbo.medicine (medicine_name, generic_name, manufacturer, dosage_form, strength)
VALUES
('Paracetamol', 'Acetaminophen', 'Pharma Inc', 'Tablet', '500mg'),
('Amoxicillin', 'Amoxicillin', 'HealthCorp', 'Capsule', '250mg');

INSERT INTO dbo.donation (donor_user_id, receiving_organization_id, donation_date, donation_status, donor_note)
VALUES
(1, 10, '2026-01-10', 'Pending', 'Please deliver to main clinic'),
(2, 11, '2026-02-15', 'Completed', 'Handled with care');

INSERT INTO dbo.donation_item (donation_id, medicine_id, batch_number, quantity, manufacturing_date, expiry_date, packaging_condition, storage_condition)
VALUES
(1, 1, 'BATCH-A1', 100, '2025-01-01', '2027-01-01', 'Good', 'Room Temp'),
(1, 2, 'BATCH-A2', 50, '2024-06-01', '2026-06-01', 'Good', 'Refrigerated'),
(2, 1, 'BATCH-B1', 200, '2025-03-01', '2027-03-01', 'Good', 'Room Temp');

INSERT INTO dbo.inventory (medicine_name, batch_number, quantity, expiry_date, status)
VALUES
('Paracetamol', 'BATCH-A1', 100, '2027-01-01', 'Available'),
('Amoxicillin', 'BATCH-A2', 50, '2026-06-01', 'Available');
GO
