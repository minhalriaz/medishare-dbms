USE [MediShareDB];
GO

IF OBJECT_ID(N'dbo.inventory', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.inventory (
        inventory_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        organization_id INT NOT NULL,
        donation_item_id INT NOT NULL,
        received_quantity INT NOT NULL DEFAULT 0,
        available_quantity INT NOT NULL DEFAULT 0,
        storage_location NVARCHAR(255) NOT NULL,
        inventory_status NVARCHAR(50) NOT NULL DEFAULT 'Available',
        added_date DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

IF OBJECT_ID(N'dbo.medicine_request', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.medicine_request (
        request_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        requester_user_id INT NOT NULL,
        requested_from_organization_id INT NOT NULL,
        priority_level NVARCHAR(50) NOT NULL DEFAULT 'Normal',
        reason NVARCHAR(MAX) NOT NULL,
        request_status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        request_date DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

IF OBJECT_ID(N'dbo.request_item', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.request_item (
        request_item_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        request_id INT NOT NULL,
        medicine_id INT NOT NULL,
        quantity INT NOT NULL,
        notes NVARCHAR(255) NULL
    );
END
GO

IF OBJECT_ID(N'dbo.organization', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.FK_Inventory_Organization', N'F') IS NULL
BEGIN
    ALTER TABLE dbo.inventory
        ADD CONSTRAINT FK_Inventory_Organization
        FOREIGN KEY (organization_id) REFERENCES dbo.organization(organization_id);
END
GO

IF OBJECT_ID(N'dbo.[user]', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.FK_MedicineRequest_RequesterUser', N'F') IS NULL
BEGIN
    ALTER TABLE dbo.medicine_request
        ADD CONSTRAINT FK_MedicineRequest_RequesterUser
        FOREIGN KEY (requester_user_id) REFERENCES dbo.[user](user_id);
END
GO

IF OBJECT_ID(N'dbo.organization', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.FK_MedicineRequest_RequestedOrganization', N'F') IS NULL
BEGIN
    ALTER TABLE dbo.medicine_request
        ADD CONSTRAINT FK_MedicineRequest_RequestedOrganization
        FOREIGN KEY (requested_from_organization_id) REFERENCES dbo.organization(organization_id);
END
GO

IF OBJECT_ID(N'dbo.medicine_request', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.FK_RequestItem_Request', N'F') IS NULL
BEGIN
    ALTER TABLE dbo.request_item
        ADD CONSTRAINT FK_RequestItem_Request
        FOREIGN KEY (request_id) REFERENCES dbo.medicine_request(request_id);
END
GO

IF OBJECT_ID(N'dbo.medicine', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.FK_RequestItem_Medicine', N'F') IS NULL
BEGIN
    ALTER TABLE dbo.request_item
        ADD CONSTRAINT FK_RequestItem_Medicine
        FOREIGN KEY (medicine_id) REFERENCES dbo.medicine(medicine_id);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_request_item_request_id' AND object_id = OBJECT_ID('dbo.request_item'))
BEGIN
    CREATE INDEX IX_request_item_request_id ON dbo.request_item(request_id);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_request_item_medicine_id' AND object_id = OBJECT_ID('dbo.request_item'))
BEGIN
    CREATE INDEX IX_request_item_medicine_id ON dbo.request_item(medicine_id);
END
GO

SELECT 'medicine_request and request_item schema ready' AS status;
GO
