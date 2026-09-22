USE [MediShareDB];
GO

/* =========================================================
   1. CREATE MEDICINE AUDIT TABLE
   ========================================================= */

IF OBJECT_ID(N'dbo.medicine_audit', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.medicine_audit
    (
        audit_id INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_medicine_audit PRIMARY KEY,

        medicine_id INT NOT NULL,

        action_type NVARCHAR(10) NOT NULL
            CONSTRAINT CK_medicine_audit_action
            CHECK (action_type = 'UPDATE'),

        changed_at DATETIME2 NOT NULL
            CONSTRAINT DF_medicine_audit_changed_at
            DEFAULT SYSUTCDATETIME(),

        changed_by NVARCHAR(128) NOT NULL
            CONSTRAINT DF_medicine_audit_changed_by
            DEFAULT SUSER_SNAME(),

        /* OLD VALUES */
        medicine_name_old NVARCHAR(150) NULL,
        generic_name_old NVARCHAR(100) NULL,
        manufacturer_old NVARCHAR(100) NULL,
        dosage_form_old NVARCHAR(100) NULL,
        strength_old NVARCHAR(100) NULL,
        medicine_category_old NVARCHAR(100) NULL,
        prescription_required_old BIT NULL,

        /* NEW VALUES */
        medicine_name_new NVARCHAR(150) NULL,
        generic_name_new NVARCHAR(100) NULL,
        manufacturer_new NVARCHAR(100) NULL,
        dosage_form_new NVARCHAR(100) NULL,
        strength_new NVARCHAR(100) NULL,
        medicine_category_new NVARCHAR(100) NULL,
        prescription_required_new BIT NULL
    );
END
GO


/* =========================================================
   2. CREATE / UPDATE MEDICINE AFTER UPDATE TRIGGER
   ========================================================= */

CREATE OR ALTER TRIGGER dbo.trg_medicine_audit
ON dbo.medicine
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.medicine_audit
    (
        medicine_id,
        action_type,
        changed_at,
        changed_by,

        /* OLD VALUES */
        medicine_name_old,
        generic_name_old,
        manufacturer_old,
        dosage_form_old,
        strength_old,
        medicine_category_old,
        prescription_required_old,

        /* NEW VALUES */
        medicine_name_new,
        generic_name_new,
        manufacturer_new,
        dosage_form_new,
        strength_new,
        medicine_category_new,
        prescription_required_new
    )
    SELECT
        d.medicine_id,
        N'UPDATE',
        SYSUTCDATETIME(),
        SUSER_SNAME(),

        /* OLD VALUES FROM deleted */
        d.medicine_name,
        d.generic_name,
        d.manufacturer,
        d.dosage_form,
        d.strength,
        d.medicine_category,
        d.prescription_required,

        /* NEW VALUES FROM inserted */
        i.medicine_name,
        i.generic_name,
        i.manufacturer,
        i.dosage_form,
        i.strength,
        i.medicine_category,
        i.prescription_required

    FROM deleted AS d
    INNER JOIN inserted AS i
        ON d.medicine_id = i.medicine_id;
END
GO


/* =========================================================
   3. CHECK THAT THE TRIGGER EXISTS
   ========================================================= */

SELECT
    name AS trigger_name,
    is_disabled
FROM sys.triggers
WHERE name = N'trg_medicine_audit';
GO


/* =========================================================
   4. CHECK MEDICINE ID 1 BEFORE UPDATE
   ========================================================= */

SELECT *
FROM dbo.medicine
WHERE medicine_id = 1;
GO


/* =========================================================
   5. TEST THE TRIGGER
      Change only two fields so the result is easy to explain.
   ========================================================= */

UPDATE dbo.medicine
SET
    medicine_name = N'Paracetamol Plus',
    strength = N'500mg'
WHERE medicine_id = 1;
GO


/* =========================================================
   6. CHECK THE UPDATED MEDICINE
   ========================================================= */

SELECT *
FROM dbo.medicine
WHERE medicine_id = 1;
GO


/* =========================================================
   7. CHECK THE AUTOMATIC AUDIT RECORD
   ========================================================= */

SELECT
    audit_id,
    medicine_id,
    action_type,
    changed_at,
    changed_by,

    medicine_name_old,
    medicine_name_new,

    generic_name_old,
    generic_name_new,

    manufacturer_old,
    manufacturer_new,

    dosage_form_old,
    dosage_form_new,

    strength_old,
    strength_new,

    medicine_category_old,
    medicine_category_new,

    prescription_required_old,
    prescription_required_new

FROM dbo.medicine_audit
WHERE medicine_id = 1
ORDER BY audit_id DESC;
GO