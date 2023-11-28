const serverConfig = {
    baseURL: 'http://10.85.81.228:1337' // Update this with your server's address
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

// Variable to store the fetched name
let fetchedName = '';

// Function to fetch the name from the server
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

async function fetchNamesAndPopulateDropdown() {
    try {
        const response = await fetch('/fetchBirthdayPersons');
        const data = await response.json();

        console.log('Data received from server:', data);

        const dropdown = document.getElementById('birthdayPersonDropdown');

        // Clear previous options
        dropdown.innerHTML = '';

        data.forEach(person => {
            const option = document.createElement('option');
            option.value = person[0]; // Username
            option.textContent = person[1] !== null ? person[1] : 'null'; // Name or 'null'
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching birthday persons:', error);
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
            // Add logic here to handle successful save, if needed
        } else {
            console.error('Failed to save contribution');
            // Add logic here to handle failed save, if needed
        }
    } catch (error) {
        console.error('Error saving contribution:', error);
        // Add logic here to handle error while saving, if needed
    }
}




document.addEventListener('DOMContentLoaded', displayLoggedInUsername);

document.addEventListener('DOMContentLoaded', function () {
    // Login and signup functionality
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

    // Dashboard functionality
    const dashboard = document.querySelector('.dashboard');
    if (dashboard) {
        dashboard.addEventListener('click', function (event) {
            const targetId = event.target.id;

            if (targetId === 'showBirthdays') {
                fetch(`${serverConfig.baseURL}/teammates-birthdays`)
                    .then(response => response.json())
                    .then(data => {
                        let output = '<h2>Teammates\' Birthdays:</h2>';
                        output += '<table class="birthday-table">';
                        output += '<tr><th>Username</th><th>Birthday</th></tr>';

                        data.forEach(item => {
                            output += '<tr>';
                            output += `<td>${item.USERNAME}</td>`;
                            output += `<td>${item.BIRTHDATE}</td>`;
                            output += '</tr>';
                        });

                        output += '</table>';
                        document.getElementById('content').innerHTML = output;
                    })
                    .catch(error => console.error('Error fetching birthdays:', error));
            } else if (targetId === 'PersonalInfo') {
                // Find the image element by its ID
                const profileImage = document.getElementById('profileImage');

                // Set the 'src' attribute of the image dynamically using the username
                profileImage.src = `/getProfileImage/${username}`;

                document.getElementById('username').value = username;

                fetch(`${serverConfig.baseURL}/user-info/${username}`)
                    .then(response => response.json())
                    .then(userInfo => {
                        document.getElementById('name').value = userInfo.Name;
                        document.getElementById('mobile').value = userInfo.MobileNo;
                        document.getElementById('birthdate').value = userInfo.BirthDate;
                    })
                    .catch(error => {
                        console.error('Error fetching user information:', error);
                    });

                document.getElementById('personalInfoModal').style.display = 'block';
            } else if (targetId === 'savePersonalInfo') {
                const name = document.getElementById('name').value;
                const mobile = document.getElementById('mobile').value;
                const birthdate = document.getElementById('birthdate').value;

                fetch(`${serverConfig.baseURL}/update-user-info/${username}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, mobile, birthdate })
                })
                    .then(response => {
                        if (response.ok) {
                            console.log('User information updated successfully!');
                        } else {
                            console.error('Failed to update user information');
                        }
                    })
                    .catch(error => console.error('Error:', error));
            }
        });

        // Close modal functionality

        const closeModal = document.querySelector('.close');
        if (closeModal) {
            closeModal.addEventListener('click', function () {
                document.getElementById('personalInfoModal').style.display = 'none';
            });
        }


        const addContributionBtn = document.getElementById('addContributionBtn');
        const contributionForm = document.getElementById('contributionForm');
        const closeBtn = document.querySelector('#contributionForm .close');
        const saveContributionBtn = document.getElementById('saveContribution');
        const contributionUsername = document.getElementById('contributionUsername');
        const contributionName = document.getElementById('contributionName');
        const birthdayPerson = document.getElementById('birthdayPersonDropdown');
        const contributionAmount = document.getElementById('contributionAmount');
        const contributionNote = document.getElementById('contributionNote');
        const contributionTable = document.getElementById('contributionTable');

        addContributionBtn.addEventListener('click', async function () {
            contributionForm.style.display = 'block';
            await fetchNameFromServer(username);
            contributionUsername.value = username;
            contributionName.value = fetchedName;
            fetchNamesAndPopulateDropdown();
        });

       
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                document.getElementById('contributionForm').style.display = 'none';
            });
        }


        saveContributionBtn.addEventListener('click', function () {
            const username_forContributionForm = contributionUsername.value;
            const name = contributionName.value;
            const selectedPerson = birthdayPerson.value;
            const amount = contributionAmount.value;
            const note = contributionNote.value;

            // Function to save the contribution to the server
            saveContributionToDatabase(username_forContributionForm, name, selectedPerson, amount, note);
        });

        const filterInput = document.getElementById('filterInput');
        const dataTable = document.getElementById('dataTable');
        const filterColumn = document.getElementById('filterColumn');

        filterInput.addEventListener('input', function () {
            filterTable(this.value.trim().toLowerCase(), filterColumn.value);
        });

        filterColumn.addEventListener('change', function () {
            filterTable(filterInput.value.trim().toLowerCase(), this.value);
        });

        async function fetchData() {
            try {
                const response = await fetch('/fetchData');
                const data = await response.json();
                displayData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        function displayData(data) {
            let output = '<tr><th>Username</th><th>Name</th><th>Mobile No</th></tr>';
            data.forEach(item => {
                output += '<tr>';
                output += `<td>${item.USERNAME}</td>`;
                output += `<td>${item.NAME}</td>`;
                output += `<td>${item.MOBILENO}</td>`;
                output += '</tr>';
            });
            dataTable.innerHTML = output;
        }

        function filterTable(filterValue, filterColumn) {
            const rows = dataTable.getElementsByTagName('tr');
            for (let i = 1; i < rows.length; i++) {
                const username = rows[i].getElementsByTagName('td')[0].textContent.toLowerCase();
                const name = rows[i].getElementsByTagName('td')[1].textContent.toLowerCase();
                const mobile = rows[i].getElementsByTagName('td')[2].textContent.toLowerCase();

                if (username.includes(filterValue) || name.includes(filterValue) || mobile.includes(filterValue)) {
                    rows[i].style.display = '';
                } else {
                    rows[i].style.display = 'none';
                }
            }
        }

        fetchData();
    }
});
