INSERT INTO department (id, name)
VALUES (1, 'Admin'),
       (2, 'Engineering'),
       (3, 'Sales'),
       (4, 'Shipping'),
       (5, 'CNC'),
       (6, 'Accounting'),
       (7, 'Marketing'),
       (8, 'Production');

INSERT INTO role (id, title, salary, department_id)
VALUES (123, 'Production Worker', 40000, 8),
       (456, 'CNC Machinist', 60000, 5),
       (789, 'Shipping Coordinator', 45000, 4),
       (101, 'Sales Rep', 75000, 3),
       (112, 'Purchasing Manager', 100000, 1),
       (131, 'Accountant', 75000, 6),
       (415, 'Operations Manager', 90000, 1),
       (161, 'Engineer', 85000, 2);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (7181, 'James', 'Roberts', 161, NULL),
       (3242, 'Joseph', 'Richards', 415, NULL),
       (5262, 'Thomas', 'Matthews', 112, NULL),
       (1323, 'Andrew', 'Scott', 456, NULL),
       (7282, 'Donald', 'Stevens', 101, 5262),
       (9303, 'Kenneth', 'Cole', 131, 5262),
       (9202, 'John', 'Michaels', 789, 3242),
       (1222, 'David', 'Williams', 123, 3242)