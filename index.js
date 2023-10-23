const mysql = require('mysql2');
const inquirer = require('inquirer');
require('dotenv').config();

// Hidden sql credentials
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: process.env.PASSWORD,
        database: 'employees_db'
    },
    console.log('Connected to employees_db database.')
);

function userPrompt() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'main_menu',
                message: 'Main Menu - Select an option:',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Update an employee role',
                    'Quit'
                ]
            }
        ])
        .then(input => {
            let answer = input.main_menu;
            if(answer === 'View all departments') {
                console.log('\nDisplaying ALL company departments:')
                showAllDepartments();
            }
            if(answer === 'View all roles') {
                console.log('\nDisplaying ALL company roles:')
                showAllRoles();
            }
            if(answer === 'View all employees') {
                console.log('\nDisplaying information for ALL employess:')
                showAllEmployees();
            }
            if(answer === 'Add a department') {
                addDepartment();
            }
            if(answer === 'Add a role') {
                addRole();
            }
            if(answer === 'Add an employee') {
                addEmployee();
            }
            if(answer === 'Update an employee role') {
                updateEmployee();
            }
            if(answer === 'Quit') {
                console.log('\nSuccessfully disconnected.\n')
                db.end();
            }
        })
}


///// App functions/SQL queries /////

function showAllDepartments() {  
    // formats table/headers
    const sqlQuery = `
        SELECT 
            department.id AS ID, 
            department.name AS Name
        FROM department
    `;
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
        }
        console.table(results)
        userPrompt();
    })
}



function showAllRoles() {
    // formats table/headers
    const sqlQuery = `
        SELECT 
            role.title AS 'Job Title',
            role.id AS 'Role ID',
            department.name AS 'Department Name',
            role.salary AS 'Salary'
        FROM role
        INNER JOIN department ON role.department_id = department.id
    `;

    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
        }            
        console.table(results);
        userPrompt();       
    });
}



function showAllEmployees() {
    // formats table/headers
    const sqlQuery = `
        SELECT
            employee.id AS ID,
            employee.first_name AS 'First Name',
            employee.last_name AS 'Last Name',
            role.title AS Title,
            role.salary AS Salary,
            CONCAT(manager.first_name, ' ', manager.last_name) AS Manager
        FROM employee
        JOIN role ON employee.role_id = role.id
        LEFT JOIN employee AS manager ON employee.manager_id = manager.id
    `;

    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
        } 
        console.table(results);
        userPrompt();        
    });
}



function addDepartment() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'department',
                message: 'Enter a name for the NEW department: '
            }
        ])
        .then(name => {
            // add random id?
            db.query('INSERT INTO department (name) VALUES (?)', name.department, (err) => {
                if (err) {
                    console.log(err)
                }
                console.log('\nNew department has been successfully created.\n')
                userPrompt();
            })
        })

}



function addRole() {
    // Fetches the department names to be used for selection in inquirer prompt
    db.query('SELECT name FROM department', (err, results) => {
        if (err) {
            console.log(err)
        }
        const departmentNames = results.map(row => row.name);

        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'Enter a name for the NEW role:'
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'What is the annual salary of this role?'
                },
                {
                    type: 'list',
                    name: 'department',
                    message: 'Select the department this role belongs to:',
                    choices: departmentNames
                }
            ])
            .then(data => {
                // need to link name with department ID
                db.query('SELECT id FROM department WHERE name = ?', data.department, (err, results) => {
                    if (err) {
                        console.log(results)
                    }
                    const departmentId = results[0].id;

                    // Add the new role to the table
                    db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', 
                        [data.title, data.salary, departmentId], (err) => {
                            if (err) {
                                console.log(err);
                            }
                            console.log('\nNew role has been successfully created.\n');
                            userPrompt();
                    })
                });
            });
    });
}



function addEmployee() {
    // Fetches the roles and employees for inquirer
    db.query('SELECT id, title FROM role', (err, roles) => {
        if (err) {
            console.log(err)           
        }
        db.query('SELECT id, first_name, last_name FROM employee', (err, employees) => {
            if (err) {
                console.log(err)        
            }
            const roleChoices = roles.map(role => ({
                name: role.title,
                value: role.id,
            }));
            const managerChoices = employees.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
            }));

            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'first_name',
                        message: "Enter the employee's first name:"
                    },
                    {
                        type: 'input',
                        name: 'last_name',
                        message: "Enter the employee's last name:"
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: "Select the employee's role:",
                        choices: roleChoices
                    },
                    {
                        type: 'list',
                        name: 'manager',
                        message: "Select the employee's manager:",
                        choices: [{ name: 'None', value: null }, ...managerChoices]
                    }
                ])
                .then(data => {
                    db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
                        [data.first_name, data.last_name, data.role, data.manager], (err) => {
                            if (err) {
                                console.log(err);
                            }
                            console.log('\nNew employee has been successfully added.\n');
                            userPrompt();
                        });
                })
        });
    });
}



function updateEmployee() {
    // Fetch employee names, IDs and roles for inquirer
    db.query('SELECT id, first_name, last_name FROM employee', (err, employees) => {
        if (err) {
            console.log(err)
        }
        db.query('SELECT id, title FROM role', (err, roles) => {
            if (err) {
                console.log(err)           
            }
            const employeeNames = employees.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
            }));
            const roleChoices = roles.map(role => ({
                name: role.title,
                value: role.id,
            }));

            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'employee_id',
                        message: "Select the employee to update:",
                        choices: employeeNames
                    },
                    {
                        type: 'list',
                        name: 'new_role_id',
                        message: "Select the employee's new role:",
                        choices: roleChoices
                    }
                ])
                // Finds and resets the id
                .then(data => {
                    db.query('UPDATE employee SET role_id = ? WHERE id = ?',
                        [data.new_role_id, data.employee_id], (err) => {
                            if (err) {
                                console.log(err)
                            }
                            console.log(`\nEmployee role has been successfully updated.\n`);
                            userPrompt();
                        });    
                });
        });
    });
}


// Begin application
userPrompt();