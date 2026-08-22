-- 01_create_database.sql
-- Create the MediShareDB database if it does not exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'MediShareDB')
BEGIN
    CREATE DATABASE [MediShareDB];
END
GO

USE [MediShareDB];
GO
