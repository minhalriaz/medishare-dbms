-- Donation raw SQL examples (SQL Server / SSMS)
USE [MediShareDB];
GO

-- READ ALL donations with items and medicine
SELECT
    d.donation_id,
    d.donor_user_id,
    d.receiving_organization_id,
    d.donation_date,
    d.donation_status,
    d.donor_note,
    di.donation_item_id,
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
FROM dbo.donation d
LEFT JOIN dbo.donation_item di ON d.donation_id = di.donation_id
LEFT JOIN dbo.medicine m ON di.medicine_id = m.medicine_id
ORDER BY d.donation_id, di.donation_item_id;
GO

-- READ ONE donation
SELECT *
FROM dbo.donation
WHERE donation_id = @id;
GO

-- CREATE donation
INSERT INTO dbo.donation (
    donor_user_id,
    receiving_organization_id,
    donation_date,
    donation_status,
    donor_note
)
OUTPUT inserted.donation_id AS donation_id
VALUES (
    @donor_user_id,
    @receiving_organization_id,
    @donation_date,
    @donation_status,
    @donor_note
);
GO

-- UPDATE donation
UPDATE dbo.donation
SET donor_user_id = @donor_user_id,
    receiving_organization_id = @receiving_organization_id,
    donation_date = @donation_date,
    donation_status = @donation_status,
    donor_note = @donor_note
WHERE donation_id = @id;
GO

-- DELETE donation (only after related donation_item rows are removed
-- and no inventory/verification references remain)
DELETE FROM dbo.donation
WHERE donation_id = @id;
GO
