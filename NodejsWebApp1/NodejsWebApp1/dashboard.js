const serverConfig = {
    baseURL: 'http://localhost:1337' // Update this with your server's address
};

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
                            output += `<tr data-id="${item.id}">`;
                            output += `<td>${item.username}</td>`;
                            output += `<td>${item.BirthDate}</td>`;
                            output += '</tr>';
                        });

                        output += '</table>';
                        document.getElementById('content').innerHTML = output;
                    })
                    .catch(error => console.error('Error:', error));
            } else if (targetId === 'PersonalInfo') {
                fetch(`${serverConfig.baseURL}/getLoggedInUsername`)
                    .then(response => response.text())
                    .then(username => {
                        const usernameInput = document.getElementById('username');
                        if (usernameInput) {
                            usernameInput.value = username; // Set the username field in the modal
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching username:', error);
                    });
                fetch(`${serverConfig.baseURL}/user-info`)
                    .then(response => response.json())
                    .then(userInfo => {
                        document.getElementById('name').value = userInfo.Name_of_user;
                        document.getElementById('mobile').value = userInfo.Mobile_No;
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

                fetch(`${serverConfig.baseURL}/update-user-info`, {
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
    }
});
