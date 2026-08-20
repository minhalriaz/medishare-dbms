CREATE TABLE IF NOT EXISTS `user` (
    user_id INT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    address VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL,
    account_status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),
    UNIQUE KEY uq_user_email (email)
);


CREATE TABLE IF NOT EXISTS organization (
    organization_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    organization_name VARCHAR(150) NOT NULL,
    organization_type VARCHAR(50) NOT NULL,
    licence_number VARCHAR(100) NOT NULL,
    organization_address VARCHAR(255),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'Pending',

    PRIMARY KEY (organization_id),
    UNIQUE KEY uq_organization_licence (licence_number),

    
    CONSTRAINT fk_organization_user
        FOREIGN KEY (user_id)
        REFERENCES `user`(user_id)
);