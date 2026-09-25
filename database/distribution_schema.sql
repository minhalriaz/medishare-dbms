USE [MediShareDB];
GO

IF OBJECT_ID(N'dbo.distribution', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.distribution (
        distribution_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        request_id INT NOT NULL,
        distributed_by_organization_id INT NOT NULL,
        distribution_date DATETIME NOT NULL DEFAULT GETDATE(),
        distribution_status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        received_by NVARCHAR(150) NULL,
        delivery_note NVARCHAR(MAX) NULL
    );
END
GO

IF OBJECT_ID(N'dbo.medicine_request', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.FK_Distribution_Request', N'F') IS NULL
BEGIN
    ALTER TABLE dbo.distribution
        ADD CONSTRAINT FK_Distribution_Request
        FOREIGN KEY (request_id) REFERENCES dbo.medicine_request(request_id);
END
GO

IF OBJECT_ID(N'dbo.organization', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.FK_Distribution_Organization', N'F') IS NULL
BEGIN
    ALTER TABLE dbo.distribution
        ADD CONSTRAINT FK_Distribution_Organization
        FOREIGN KEY (distributed_by_organization_id) REFERENCES dbo.organization(organization_id);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_distribution_request_id' AND object_id = OBJECT_ID('dbo.distribution'))
BEGIN
    CREATE INDEX IX_distribution_request_id ON dbo.distribution(request_id);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_distribution_organization_id' AND object_id = OBJECT_ID('dbo.distribution'))
BEGIN
    CREATE INDEX IX_distribution_organization_id ON dbo.distribution(distributed_by_organization_id);
END
GO

SELECT 'distribution schema ready' AS status;
GO
