USE [MediShareDB];
GO
IF OBJECT_ID(N'dbo.distribution_item', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.distribution_item (
        distribution_item_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        distribution_id INT NOT NULL,
        inventory_id INT NOT NULL,
        distributed_quantity INT NOT NULL,
        CONSTRAINT CK_distribution_item_quantity CHECK (distributed_quantity > 0),
        CONSTRAINT FK_distribution_item_distribution FOREIGN KEY (distribution_id)
            REFERENCES dbo.distribution(distribution_id),
        CONSTRAINT FK_distribution_item_inventory FOREIGN KEY (inventory_id)
            REFERENCES dbo.inventory(inventory_id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_distribution_item_distribution' AND object_id = OBJECT_ID(N'dbo.distribution_item'))
    CREATE INDEX IX_distribution_item_distribution ON dbo.distribution_item(distribution_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_distribution_item_inventory' AND object_id = OBJECT_ID(N'dbo.distribution_item'))
    CREATE INDEX IX_distribution_item_inventory ON dbo.distribution_item(inventory_id);
GO
