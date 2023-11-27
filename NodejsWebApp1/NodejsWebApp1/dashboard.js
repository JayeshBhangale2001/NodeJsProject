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
    }
});
