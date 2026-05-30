-- Run once if upgrading from legacy PropertyType enum values
UPDATE properties SET property_type = 'villa' WHERE property_type::text IN ('residence', 'beach_house', 'cabin');
UPDATE properties SET property_type = 'hotel' WHERE property_type::text = 'boutique_stay';
