

USE [MediShareDB];
GO

-- Create the request_item table if it does not exist
IF OBJECT_ID(N'dbo.request_item', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.request_item (
        request_item_id INT IDENTITY(1,1) NOT NULL,
        request_id      INT NOT NULL,
        medicine_id     INT NOT NULL,
        quantity        INT NOT NULL,
        notes           NVARCHAR(255) NULL,

        CONSTRAINT PK_request_item
            PRIMARY KEY (request_item_id),

        CONSTRAINT CK_request_item_quantity
            CHECK (quantity > 0)
    );
END
GO

-- Foreign key: request_item → medicine_request
IF OBJECT_ID(N'dbo.medicine_request', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.FK_RequestItem_Request', N'F') IS NULL
BEGIN
    ALTER TABLE dbo.request_item
        ADD CONSTRAINT FK_RequestItem_Request
        FOREIGN KEY (request_id) REFERENCES dbo.medicine_request(request_id)
        ON DELETE CASCADE;
END
GO

-- Foreign key: request_item → medicine
IF OBJECT_ID(N'dbo.medicine', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.FK_RequestItem_Medicine', N'F') IS NULL
BEGIN
    ALTER TABLE dbo.request_item
        ADD CONSTRAINT FK_RequestItem_Medicine
        FOREIGN KEY (medicine_id) REFERENCES dbo.medicine(medicine_id);
END
GO

-- Index on request_id
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_request_item_request_id' AND object_id = OBJECT_ID('dbo.request_item'))
BEGIN
    CREATE INDEX IX_request_item_request_id ON dbo.request_item(request_id);
END
GO

-- Index on medicine_id
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_request_item_medicine_id' AND object_id = OBJECT_ID('dbo.request_item'))
BEGIN
    CREATE INDEX IX_request_item_medicine_id ON dbo.request_item(medicine_id);
END
GO

-- CRUD example queries (SQL Server / T-SQL syntax)
-- CREATE
-- INSERT INTO request_item (request_id, medicine_id, quantity, notes)
-- OUTPUT inserted.request_item_id
-- VALUES (1, 1, 10, N'Needed within one week');

-- READ ALL (with related information)
-- SELECT ri.request_item_id, ri.request_id, ri.medicine_id, ri.quantity,
--        ri.notes, mr.request_status, m.medicine_name, m.strength
-- FROM request_item AS ri
-- INNER JOIN medicine_request AS mr ON mr.request_id = ri.request_id
-- INNER JOIN medicine AS m ON m.medicine_id = ri.medicine_id
-- ORDER BY ri.request_item_id DESC;

-- READ ONE
-- SELECT TOP 1 * FROM request_item WHERE request_item_id = 1;

-- UPDATE
-- UPDATE request_item
-- SET request_id = 1, medicine_id = 1, quantity = 20, notes = N'Urgent'
-- WHERE request_item_id = 1;

-- DELETE
-- DELETE FROM request_item WHERE request_item_id = 1;

SELECT 'request_item schema ready' AS status;
GO
