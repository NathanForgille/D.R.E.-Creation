const { prompt } = require("inquirer");
const db = require("./db");
require("console.table");

letsPlay();

function letsPlay() {
   loadPrompts();
  }

//an async function is necessary for the await. once everything is oaded the prompt can begin.
  async function loadPrompts() {
    const selection = await prompt([
      {
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: [
          {
            name: "See Employees",
            value: "See_EMPLOYEES"
          },
          {
            name: "See Employees By Department",
            value: "See_EMPLOYEES_BY_DEPARTMENT"
          },
          {
            name: "Add Employee",
            value: "Add_EMPLOYEE"
          },
          {
            name: "Remove Employee",
            value: "Remove_EMPLOYEE"
          },
          {
            name: "Update Employee Role",
            value: "Update_EMPLOYEE_ROLE"
          },
          {
            name: "See Roles",
            value: "See_ROLES"
          },
          {
            name: "Add Role",
            value: "Add_ROLE"
          },
          {
            name: "Remove Role",
            value: "Remove_ROLE"
          },
          {
            name: "See Departments",
            value: "See_DEPARTMENTS"
          },
          {
            name: "Add Department",
            value: "Add_DEPARTMENT"
          },
          {
            name: "Remove Department",
            value: "Remove_DEPARTMENT"
          },
          {
            name: "Quit",
            value: "QUIT"
          }
        ]
      }
    ]);
    
    //This switch statements is based on the users choice within the prompts. A switch statement is a cleaner "selection" based way to write an if/else in this scenario.
    switch (selection.choice) {
      case "See_EMPLOYEES":
        return seeEmployees();
      case "See_EMPLOYEES_BY_DEPARTMENT":
        return seeEmployeesByDepartment();
      case "Add_EMPLOYEE":
        return addEmployee();
      case "Remove_EMPLOYEE":
        return removeEmployee();
      case "Update_EMPLOYEE_ROLE":
        return updateEmployeeRole();
      case "See_DEPARTMENTS":
        return seeDepartments();
      case "Add_DEPARTMENT":
        return addDepartment();
      case "Remove_DEPARTMENT":
        return removeDepartment();
      case "See_ROLES":
        return seeRoles();
      case "Add_ROLE":
        return addRole();
      case "Remove_ROLE":
        return removeRole();
      default:
        return quit();
    }
  }

  async function seeEmployees() {
    const employees = await db.findEmployees();
    // this is break in the line for readability. yeah, I had to look this up and it took like ten minutes...
    console.log("\n");
    //now wee see the returned employee object in the console
    console.table(employees);
    loadPrompts();
  }
  
  async function seeEmployeesByDepartment() {
    // assigning a variable to the data that represents all the departments and awaiting it all to fully load it.
    const departments = await db.findDepartments();
    // assigning a variable that maps the selected departments data
    const departmentOptions = departments.map(({ id, name }) => ({
      name: name,
      value: id
    }));
    // a variable representing the list of choices for departments in th form of a prompt
    const { departmentId } = await prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Which department would you like to see employees for?",
        choices: departmentOptions
      }
    ]);
    // a variable representing the employees the user chose based on the department choice
    const employees = await db.findEmployeesByDepartment(departmentId);
  
    console.log("\n");
    console.table(employees);
  
    loadPrompts();
  }

  async function addEmployee() {
    //two variables assigned values the user will need for selection later on based on the new employee's role and their manager.
    const roles = await db.findRoles();
    const employees = await db.findEmployees();
    // variable assigned for assigning the new employee's first and last name
    const employee = await prompt([
      {
        name: "first_name",
        message: "What is the employee's first name?"
      },
      {
        name: "last_name",
        message: "What is the employee's last name?"
      }
    ]);
    // variable assigned to map through role data to pull into the prompt below
    const roleOptions = roles.map(({ id, title }) => ({
      name: title,
      value: id
    }));
    // assigning the new employees role
    const { roleId } = await prompt({
      type: "list",
      name: "roleId",
      message: "What is the employee's role?",
      choices: roleOptions
    });
    // asigning the new employees role_id to the variable roleId
    employee.role_id = roleId;
    // mapping through the available data on possible managers to assign over the new employee
    const managerOptions = employees.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id
    }));
    managerOptions.unshift({ name: "None", value: null });
    // manager selection
    const { managerId } = await prompt({
      type: "list",
      name: "managerId",
      message: "Who is the employee's manager?",
      choices: managerOptions
    });
    // assigning the new employees manager_id to managagerId
    employee.manager_id = managerId;
    // function to create the employee and move the data to the database fires when all info is completed
    await db.createEmployee(employee);
    // visible confirmation in the console
    console.log(
      `Added ${employee.first_name} ${employee.last_name} to the database`
    );
    // the main set of prompts re-loads
    loadPrompts();
  }
  
  async function removeEmployee() {
    const employees = await db.findEmployees();
  
    const employeeOptions = employees.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id
    }));
  
    const { employeeId } = await prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to remove?",
        choices: employeeOptions
      }
    ]);
  
    await db.removeEmployee(employeeId);
  
    console.log("Removed employee from the database");
  
    loadPrompts();
  }

  async function updateEmployeeRole() {
    const employees = await db.findEmployees();
  
    const employeeOptions = employees.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id
    }));
  
    const { employeeId } = await prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee's role do you want to update?",
        choices: employeeOptions
      }
    ]);
  
    const roles = await db.findRoles();
  
    const roleOptions = roles.map(({ id, title }) => ({
      name: title,
      value: id
    }));
  
    const { roleId } = await prompt([
      {
        type: "list",
        name: "roleId",
        message: "Which role do you want to assign the selected employee?",
        choices: roleOptions
      }
    ]);
  
    await db.updateEmployeeRole(employeeId, roleId);
  
    console.log("Updated employee's role");
  
    loadPrompts();
  }
  
  async function seeDepartments() {
    const departments = await db.findDepartments();
  
    console.log("\n");
    console.table(departments);
  
    loadPrompts();
  }

  async function addDepartment() {
    const department = await prompt([
      {
        name: "name",
        message: "What is the name of the department?"
      }
    ]);
  
    await db.createDepartment(department);
  
    console.log(`Added ${department.name} to the database`);
  
    loadPrompts();
  }

  async function removeDepartment() {
    const departments = await db.findDepartments();
  
    const departmentChoices = departments.map(({ id, name }) => ({
      name: name,
      value: id
    }));
  
    const { departmentId } = await prompt({
      type: "list",
      name: "departmentId",
      message:
        "Which department would you like to remove? (Warning: This will also remove associated roles and employees)",
      choices: departmentChoices
    });
  
    await db.removeDepartment(departmentId);
  
    console.log(`Removed department from the database`);
  
    loadPrompts();
  }

  async function seeRoles() {
    const roles = await db.findRoles();
  
    console.log("\n");
    console.table(roles);
  
    loadPrompts();
  }
  
  async function addRole() {
    const departments = await db.findDepartments();
  
    const departmentOptions = departments.map(({ id, name }) => ({
      name: name,
      value: id
    }));
  
    const role = await prompt([
      {
        name: "title",
        message: "What is the name of the role?"
      },
      {
        name: "salary",
        message: "What is the salary of the role?"
      },
      {
        type: "list",
        name: "department_id",
        message: "Which department does the role belong to?",
        choices: departmentOptions
      }
    ]);
  
    await db.createRole(role);
  
    console.log(`Added ${role.title} to the database`);
  
    loadPrompts();
  }

  async function removeRole() {
    const roles = await db.findRoles();
  
    const roleOptions = roles.map(({ id, title }) => ({
      name: title,
      value: id
    }));
  
    const { roleId } = await prompt([
      {
        type: "list",
        name: "roleId",
        message:
          "Which role do you want to remove? (Warning: This will also remove employees)",
        choices: roleOptions
      }
    ]);
  
    await db.removeRole(roleId);
  
    console.log("Removed role from the database");
  
    loadPrompts();
  }

  function quit() {
    console.log("Goodbye!");
    process.exit();
  }