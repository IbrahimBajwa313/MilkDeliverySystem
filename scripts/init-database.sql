-- Initialize the database with sample data
-- This script will be run to set up the initial database

-- Sample customers
INSERT INTO customers (id, name, phone, address, ratePerLiter, isActive, createdAt, updatedAt) VALUES
('cust1', 'Rajesh Kumar', '+919876543210', '123 MG Road, Bangalore', 45.0, 1, datetime('now'), datetime('now')),
('cust2', 'Priya Sharma', '+919876543211', '456 Brigade Road, Bangalore', 50.0, 1, datetime('now'), datetime('now')),
('cust3', 'Amit Patel', '+919876543212', '789 Koramangala, Bangalore', 48.0, 1, datetime('now'), datetime('now')),
('cust4', 'Sunita Devi', '+919876543213', '321 Jayanagar, Bangalore', 47.0, 1, datetime('now'), datetime('now'));

-- Sample deliveries for the current month
INSERT INTO deliveries (id, customerId, date, quantity, status, createdAt, updatedAt) VALUES
('del1', 'cust1', date('now', '-5 days'), 2.0, 'delivered', datetime('now'), datetime('now')),
('del2', 'cust1', date('now', '-4 days'), 2.0, 'delivered', datetime('now'), datetime('now')),
('del3', 'cust1', date('now', '-3 days'), NULL, 'absent', datetime('now'), datetime('now')),
('del4', 'cust2', date('now', '-5 days'), 1.5, 'delivered', datetime('now'), datetime('now')),
('del5', 'cust2', date('now', '-4 days'), 1.5, 'delivered', datetime('now'), datetime('now')),
('del6', 'cust3', date('now', '-5 days'), 3.0, 'delivered', datetime('now'), datetime('now')),
('del7', 'cust3', date('now', '-4 days'), NULL, 'not_delivered', datetime('now'), datetime('now'));
