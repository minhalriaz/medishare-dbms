CREATE TABLE [user] (
    user_id INT IDENTITY(1,1) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    address VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL,
    account_status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_user PRIMARY KEY (user_id),
    CONSTRAINT UQ_user_email UNIQUE (email)
);


CREATE TABLE organization (
    organization_id INT IDENTITY(1,1) NOT NULL,
    user_id INT NOT NULL,
    organization_name VARCHAR(150) NOT NULL,
    organization_type VARCHAR(50) NOT NULL,
    licence_number VARCHAR(100) NOT NULL,
    organization_address VARCHAR(255),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'Pending',

    CONSTRAINT PK_organization PRIMARY KEY (organization_id),

    CONSTRAINT UQ_organization_licence 
        UNIQUE (licence_number),

    CONSTRAINT FK_organization_user
        FOREIGN KEY (user_id)
        REFERENCES [user](user_id)
);