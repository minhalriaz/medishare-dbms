INSERT INTO `user`
(
    full_name,
    email,
    phone,
    address,
    password_hash,
    user_type,
    account_status
)
VALUES
(
    'Rahim Ahmed',
    'rahim@medishare.com',
    '01711111111',
    'Dhaka, Bangladesh',
    'demo_hash_1',
    'Organization',
    'Active'
),
(
    'Karim Hasan',
    'karim@medishare.com',
    '01822222222',
    'Chattogram, Bangladesh',
    'demo_hash_2',
    'Organization',
    'Active'
),
(
    'Nusrat Jahan',
    'nusrat@medishare.com',
    '01933333333',
    'Sylhet, Bangladesh',
    'demo_hash_3',
    'Organization',
    'Active'
),
(
    'Sabbir Hossain',
    'sabbir@medishare.com',
    '01644444444',
    'Rajshahi, Bangladesh',
    'demo_hash_4',
    'Donor',
    'Active'
);


INSERT INTO organization
(
    user_id,
    organization_name,
    organization_type,
    licence_number,
    organization_address,
    verification_status
)
VALUES
(
    1,
    'MediShare Dhaka Foundation',
    'NGO',
    'ORG-DHK-001',
    'Dhaka, Bangladesh',
    'Verified'
),
(
    2,
    'MediShare Chattogram Hospital',
    'Hospital',
    'ORG-CTG-002',
    'Chattogram, Bangladesh',
    'Verified'
),
(
    3,
    'Sylhet Care Center',
    'Clinic',
    'ORG-SYL-003',
    'Sylhet, Bangladesh',
    'Pending'
);