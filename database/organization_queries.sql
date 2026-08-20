SELECT
    u.user_id,
    u.full_name,
    u.email,
    o.organization_id,
    o.organization_name,
    o.organization_type,
    o.verification_status
FROM `user` u
INNER JOIN organization o
    ON u.user_id = o.user_id;



SELECT
    u.user_id,
    u.full_name,
    u.email,
    o.organization_id,
    o.organization_name,
    o.organization_type
FROM `user` u
LEFT JOIN organization o
    ON u.user_id = o.user_id;


SELECT
    o.organization_id,
    o.organization_name,
    u.user_id,
    u.full_name,
    u.email
FROM organization o
RIGHT JOIN `user` u
    ON o.user_id = u.user_id;


SELECT
    u.user_id,
    u.full_name,
    o.organization_id,
    o.organization_name
FROM `user` u
LEFT JOIN organization o
    ON u.user_id = o.user_id

UNION

SELECT
    u.user_id,
    u.full_name,
    o.organization_id,
    o.organization_name
FROM `user` u
RIGHT JOIN organization o
    ON u.user_id = o.user_id;


SELECT
    o.organization_id,
    o.organization_name,
    o.organization_type,
    i.inventory_id,
    i.received_quantity,
    i.available_quantity,
    i.storage_location,
    i.inventory_status
FROM organization o
LEFT JOIN inventory i
    ON o.organization_id = i.organization_id
ORDER BY o.organization_id;


SELECT
    o.organization_id,
    o.organization_name,
    o.organization_type
FROM organization o
LEFT JOIN inventory i
    ON o.organization_id = i.organization_id
WHERE i.inventory_id IS NULL;


SELECT
    o.organization_id,
    o.organization_name,
    i.inventory_id,
    i.received_quantity,
    i.available_quantity,
    i.storage_location,
    di.batch_number,
    di.expiry_date,
    m.medicine_id,
    m.medicine_name,
    m.generic_name,
    m.strength
FROM organization o
INNER JOIN inventory i
    ON o.organization_id = i.organization_id
INNER JOIN donation_item di
    ON i.donation_item_id = di.donation_item_id
INNER JOIN medicine m
    ON di.medicine_id = m.medicine_id
ORDER BY o.organization_id;



SELECT
    o.organization_id,
    o.organization_name,
    COUNT(i.inventory_id) AS total_inventory_items
FROM organization o
LEFT JOIN inventory i
    ON o.organization_id = i.organization_id
GROUP BY
    o.organization_id,
    o.organization_name
ORDER BY o.organization_id;


SELECT
    o.organization_id,
    o.organization_name,
    COUNT(i.inventory_id) AS inventory_records,
    COALESCE(
        SUM(i.available_quantity),
        0
    ) AS total_available_quantity
FROM organization o
LEFT JOIN inventory i
    ON o.organization_id = i.organization_id
GROUP BY
    o.organization_id,
    o.organization_name;



SELECT
    o.organization_id,
    o.organization_name,
    SUM(i.available_quantity) AS available_medicines
FROM organization o
INNER JOIN inventory i
    ON o.organization_id = i.organization_id
GROUP BY
    o.organization_id,
    o.organization_name
HAVING SUM(i.available_quantity) > 0;