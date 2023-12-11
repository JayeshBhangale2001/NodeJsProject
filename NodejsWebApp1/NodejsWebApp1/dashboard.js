const serverConfig = {
    baseURL: 'http://10.85.81.228:1337' //update this whoever is using with your ip address , port is hardcoded
};

function extractLoggedInUsername() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('username');
}

const username = extractLoggedInUsername();

function displayLoggedInUsername() {
    if (username) {
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = `Logged in as: ${username}`;
        }
    }
}



function showLoadingSpinner(element) {

    console.log('Showing loading spinner');
    if (!element.querySelector('.loading-spinner')) {
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'loading-spinner';
        loadingSpinner.innerHTML = '<div class="spinner"></div>'; 
        element.appendChild(loadingSpinner);
    }
}


function hideLoadingSpinner(element) {
    console.log('hide loading spinner');
    const loadingSpinner = element.querySelector('.loading-spinner');
    if (loadingSpinner) {
        loadingSpinner.remove();
    }
}


// Variable to store the fetched name
let fetchedName = '';


async function fetchNameFromServer(username) {
    try {
        const response = await fetch(`/fetchName/${username}`);
        const data = await response.json();

        fetchedName = data.name || '';
    } catch (error) {
        console.error('Error fetching name:', error);
        fetchedName = '';
    }
}

async function fetchNamesAndPopulateDropdown(dropdownElementId, formElementId) {
    try {
        console.log('Fetching data...');
        const response = await fetch('/fetchBirthdayPersons');
        const data = await response.json();

        console.log('Data received from server:', data);

        const dropdown = document.getElementById(dropdownElementId);

        if (!dropdown) {
            console.error(`Dropdown with ID '${dropdownElementId}' not found.`);
            return;
        }

        
        dropdown.innerHTML = '';

        data.forEach(person => {
            const option = document.createElement('option');
            option.value = person[0]; // Username
            option.textContent = person[1] !== null ? person[1] : 'null';
            dropdown.appendChild(option);
        });

        console.log('Dropdown populated successfully.');
    } catch (error) {
        console.error('Error fetching or populating dropdown:', error);
    } finally {
        hideLoadingSpinner(formElementId);
    }
}





async function saveContributionToDatabase(username, name, selectedPerson, amount, note) {
    try {
        const response = await fetch('/saveContribution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, name, selectedPerson, amount, note })
        });

        if (response.ok) {
            console.log('Contribution saved successfully!');
            alert("Contribution saved successfully!");
        } else {
            console.error('Failed to save contribution');
            
        }
    } catch (error) {
        console.error('Error saving contribution:', error);
        
    } finally {
        hideLoadingSpinner(contributionForm);
    }
}

async function saveExpenseToDatabase(Expense_Title,username, name, selectedPerson, amount, note, ExpenseForm) {
    try {
        const response = await fetch('/saveExpenseToDatabase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, name, Expense_Title, selectedPerson, amount, note })
        });

        if (response.ok) {
            console.log('Expense saved successfully!');
            alert("Expense saved successfully!");
        } else {
            console.error('Failed to save Expense');

        }
    } catch (error) {
        console.error('Error saving Expense:', error);

    } finally {
        hideLoadingSpinner(ExpenseForm);
    }
}
async function handleSavePersonalInfo(name, mobile, birthdate) {
    console.log('Updating user information...');

    try {
        const response = await fetch(`/update-user-info/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, mobile, birthdate })
        });

        if (response.ok) {
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log('User information updated successfully!');
                console.log('Response data:', data);
                alert("User information updated successfully!'");
            } else {
                
                console.log('User information updated successfully!');
            }
        } else {
            console.error('Failed to update user information');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', displayLoggedInUsername);

document.addEventListener('DOMContentLoaded', function () {
    
    const loginSignup = document.querySelector('.login-signup');
    if (loginSignup) {
        loginSignup.addEventListener('click', function (event) {
            const targetId = event.target.id;

            if (targetId === 'showSignup') {
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('signupForm').style.display = 'block';
            } else if (targetId === 'showLogin') {
                document.getElementById('signupForm').style.display = 'none';
                document.getElementById('loginForm').style.display = 'block';
            }
        });
    }
});


document.addEventListener('DOMContentLoaded', async function () {
    
    const dashboard = document.querySelector('.dashboard');

    if (dashboard) {
        dashboard.addEventListener('click', async function (event) {
            const targetId = event.target.id;
            console.log('Clicked target ID:', targetId);
            const personalInfoModal = document.getElementById('personalInfoModal');
            const name = document.getElementById('name').value;
            const mobile = document.getElementById('mobile').value;
            const birthdate = document.getElementById('birthdate').value;
            if (targetId === 'showBirthdays') {
                console.log('Clicked Show Birthdays');
                
                fetch(`${serverConfig.baseURL}/teammates-birthdays`)
                    .then(response => response.json())
                    .then(data => {
                        console.log('Data received:', data);
                        displayTable(data, ['USERNAME', 'MOBILENO', 'BIRTHDATE'], 'content', 'Team Birthdates');
                        
                    })
                    .catch(error => console.error('Error fetching birthdays:', error));
            } else if (targetId === 'PersonalInfo') {
                showLoadingSpinner(personalInfoModal);
                handlePersonalInfoDisplay();


            } else if (targetId === 'savePersonalInfo') {
                await handleSavePersonalInfo(name, mobile, birthdate);

            } else if (targetId === 'ShowExpenses') {
                fetch(`${serverConfig.baseURL}/show-expenses`)
                    .then(response => response.json())
                    .then(data => {
                        console.log('Data received:', data);
                        displayTable(data, ['Expense_Title', 'Added_By', 'Birthday_Person', 'Amount', 'Note', 'Expense_Date'], 'ShowExpenseTable','Expenses');
                        
                    })
            }

       

        const closeModal = document.querySelector('.close');
        if (closeModal) {
            closeModal.addEventListener('click', function () {
                hidePersonalInfoModal();
            });
        }


            async function displayTable(data, columnNames, targetElementId, tableName) {
                let output = `<h2>${tableName}:</h2>`;
            output += '<table class="birthday-table">';
            output += '<tr>';
            columnNames.forEach(column => {
                output += `<th>${column}</th>`;
            });
            output += '</tr>';

            data.forEach(item => {
                output += '<tr>';
                columnNames.forEach(column => {
                    output += `<td>${item[column]}</td>`;
                });
                output += '</tr>';
            });

            output += '</table>';
            document.getElementById(targetElementId).innerHTML = output;
          }

          async  function handlePersonalInfoDisplay() {
            const profileImage = document.getElementById('profileImage');
            profileImage.src = `/getProfileImage/${username}`;
            document.getElementById('username').value = username;
            document.getElementById('personalInfoModal').style.display = 'block';
               try {
                   const response = await fetch(`${serverConfig.baseURL}/user-info/${username}`);
                   if (response.ok) {
                       const userInfo = await response.json();
                       document.getElementById('name').value = userInfo.Name;
                       document.getElementById('mobile').value = userInfo.MobileNo;
                       document.getElementById('birthdate').value = userInfo.BirthDate;
                       document.getElementById('personalInfoModal').style.display = 'block';
                   } else {
                       console.error('Error fetching user information:', response.statusText);
                   }
               } catch (error) {
                   console.error('Error fetching user information:', error);
               } finally {
                   hideLoadingSpinner(personalInfoModal);
               }
           }
            


            function hidePersonalInfoModal() {
              document.getElementById('personalInfoModal').style.display = 'none';
            }
        });
    }

        //ContributionForm
        const addContributionBtn = document.getElementById('addContributionBtn');
        const contributionForm = document.getElementById('contributionForm');
        const closeBtn = document.querySelector('#contributionForm .close');
        const saveContributionBtn = document.getElementById('saveContribution');
        const contributionUsername = document.getElementById('contributionUsername');
        const contributionName = document.getElementById('contributionName');
        const birthdayPerson = document.getElementById('birthdayPersonDropdown');
        const contributionAmount = document.getElementById('contributionAmount');
        const contributionNote = document.getElementById('contributionNote');
        const showMyContributionBtn = document.getElementById('ShowMyContribution');


        addContributionBtn.addEventListener('click', async function () {
            contributionForm.style.display = 'block';
            showLoadingSpinner(contributionForm);          ///showing spinner here
            await fetchNameFromServer(username);
            contributionUsername.value = username;
            contributionName.value = fetchedName;
            fetchNamesAndPopulateDropdown('birthdayPersonDropdown', contributionForm);
            ///hiding spinner here
        });




        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                document.getElementById('contributionForm').style.display = 'none';
            });
        }


        saveContributionBtn.addEventListener('click', function () {
            showLoadingSpinner(contributionForm);

            const username_forContributionForm = contributionUsername.value;
            const name = contributionName.value;
            const selectedPerson = birthdayPerson.value;
            const amount = contributionAmount.value;
            const note = contributionNote.value;

            // Function to save the contribution to the server
            saveContributionToDatabase(username_forContributionForm, name, selectedPerson, amount, note);

        });

        // Event listener for the "Show My Contribution" button
        showMyContributionBtn.addEventListener('click', () => {
            const Contribution_Table = document.getElementById('Contribution_Table');
            Contribution_Table.style.display = 'block'; 

            showLoadingSpinner(Contribution_Table)

            fetchData(username);

            const filterInput = document.getElementById('filterInput');
            const dataTable = document.getElementById('dataTable');
            const filterColumn = document.getElementById('filterColumn');



            // Add event listener for the close button
            const closeBtn = document.querySelector('#Contribution_Table .close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function () {
                    Contribution_Table.style.display = 'none';
                });
            }




            filterInput.addEventListener('input', function () {
                filterTable(this.value.trim().toLowerCase(), filterColumn.value);
            });

            filterColumn.addEventListener('change', function () {
                filterTable(filterInput.value.trim().toLowerCase(), this.value);
            });

            async function fetchData(username) {
                try {
                    const response = await fetch(`/fetchData/${username}`);

                    const data = await response.json();
                    displayData(data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }

            function displayData(data) {
                let output = '<tr><th>Birthday Person</th><th>Amount</th><th>Note</th><th>Date</th></tr>';
                data.forEach(item => {
                    output += '<tr>';
                    output += `<td>${item.BirthDay_Person}</td>`;
                    output += `<td>${item.Amount}</td>`;
                    output += `<td>${item.Note}</td>`;
                    output += `<td>${item.Contribution_Date}</td>`;
                    output += '</tr>';
                });
                dataTable.innerHTML = output;
                hideLoadingSpinner(Contribution_Table)
            }

            function filterTable(filterValue, filterColumn) {
                const rows = dataTable.getElementsByTagName('tr');
                for (let i = 1; i < rows.length; i++) {
                    const birthdayPerson = rows[i].getElementsByTagName('td')[0].textContent.toLowerCase();
                    const amount = rows[i].getElementsByTagName('td')[1].textContent.toLowerCase();
                    const note = rows[i].getElementsByTagName('td')[2].textContent.toLowerCase();
                    const date = rows[i].getElementsByTagName('td')[3].textContent.toLowerCase();

                    if (birthdayPerson.includes(filterValue) || amount.includes(filterValue) || note.includes(filterValue) || date.includes(filterValue)) {
                        rows[i].style.display = '';
                    } else {
                        rows[i].style.display = 'none';
                    }
                }
            }


        });

        //ExpenseForm

        const addExpenseBtn = document.getElementById('Add_ExpenseBtn');
        const ExpenseForm = document.getElementById('AddExpenseForm');
        const saveExpenseBtn = document.getElementById('saveExpenseBtn');
        const birthdayPersonNames = document.getElementById('expenseBirthdayPersonDropdown');
        const ExpenseAmount = document.getElementById('Amount');
        const ExpenseNote = document.getElementById('ExpenseNote');

        const ExpenseTitle = document.getElementById('ExpenseTitle');

             
    console.log('Selected Person:', birthdayPersonNames); // Log selected person
    console.log('Amount:', ExpenseAmount); // Log amount
    console.log('Note:', ExpenseNote); // Log note
    console.log('ExpenseTitle:', ExpenseTitle); 
        

        addExpenseBtn.addEventListener('click', async function () {
            ExpenseForm.style.display = 'block';
            showLoadingSpinner(ExpenseForm);          ///showing spinner here
            setTimeout(() => {
                fetchNamesAndPopulateDropdown('expenseBirthdayPersonDropdown', ExpenseForm);
            }, 100);



        })
        const closeBtnForExpenseForm = document.querySelector('#AddExpenseForm .close');
        if (closeBtnForExpenseForm) {
            closeBtnForExpenseForm.addEventListener('click', function () {
                ExpenseForm.style.display = 'none';
            });
        }


        saveExpenseBtn.addEventListener('click', async function () {
            showLoadingSpinner(ExpenseForm);

            await fetchNameFromServer(username);
            const username_forExpenseForm = username;
            const name = fetchedName;
            const selectedPerson = birthdayPersonNames.value;
            const amount = ExpenseAmount.value;
            const note = ExpenseNote.value;
            const Expense_Title = ExpenseTitle.value;

            console.log('Fetched Name:', name); // Log fetched name from server
            console.log('Selected Person:', selectedPerson); // Log selected person
            console.log('Amount:', amount); // Log amount
            console.log('Note:', note); // Log note
            console.log('Expense Title:', Expense_Title); // Log expense title


            // Function to save the contribution to the server
            await saveExpenseToDatabase(Expense_Title, username_forExpenseForm, name,selectedPerson, amount, note, ExpenseForm);

        });

    document.getElementById('BtnSummary').addEventListener('click', async () => {
        try {
            const response = await fetch(`${serverConfig.baseURL}/summary`);
            const data = await response.json();

            const summaryDiv = document.getElementById('summary');
            summaryDiv.innerHTML = `
          <h2>Summary</h2>
          <p>Total Contribution: ${data.totalContribution}</p>
          <p>Total Expenses: ${data.totalExpenses}</p>
          <p>Remaining Amount: ${data.remainingAmount}</p>
        `;
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    });

    document.getElementById('Btnlogout').addEventListener('click', async () => {
        try {
             await fetch(`${serverConfig.baseURL}/logout`);
            
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    });
        
});
