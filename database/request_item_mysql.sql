-- ============================================================
-- MediShare DBMS - Request Item CRUD (MySQL 8.0+)
-- Author/Feature: Nazifa - Request Item
-- Run this after the medicine_request and medicine tables exist.
-- ============================================================

CREATE DATABASE IF NOT EXISTS medishare
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medishare;

CREATE TABLE IF NOT EXISTS request_item (
    request_item_id INT NOT NULL AUTO_INCREMENT,
    request_id      INT NOT NULL,
    medicine_id     INT NOT NULL,
    quantity        INT NOT NULL,
    notes           VARCHAR(255) NULL,

    CONSTRAINT PK_request_item
        PRIMARY KEY (request_item_id),

    CONSTRAINT CK_request_item_quantity
        CHECK (quantity > 0),

    CONSTRAINT FK_request_item_medicine_request
        FOREIGN KEY (request_id)
        REFERENCES medicine_request (request_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_request_item_medicine
        FOREIGN KEY (medicine_id)
        REFERENCES medicine (medicine_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX IX_request_item_request_id (request_id),
    INDEX IX_request_item_medicine_id (medicine_id)
) ENGINE = InnoDB;

-- CREATE
-- INSERT INTO request_item (request_id, medicine_id, quantity, notes)
-- VALUES (1, 1, 10, 'Needed within one week');

-- READ ALL (with related information)
-- SELECT ri.request_item_id, ri.request_id, ri.medicine_id, ri.quantity,
--        ri.notes, mr.request_status, m.medicine_name, m.strength
-- FROM request_item AS ri
-- INNER JOIN medicine_request AS mr ON mr.request_id = ri.request_id
-- INNER JOIN medicine AS m ON m.medicine_id = ri.medicine_id
-- ORDER BY ri.request_item_id DESC;

-- READ ONE
-- SELECT * FROM request_item WHERE request_item_id = 1;

-- UPDATE
-- UPDATE request_item
-- SET request_id = 1, medicine_id = 1, quantity = 20, notes = 'Urgent'
-- WHERE request_item_id = 1;

-- DELETE
-- DELETE FROM request_item WHERE request_item_id = 1;
