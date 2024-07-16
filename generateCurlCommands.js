const CryptoJS = require('crypto-js');
require('dotenv').config();
const readline = require('readline');
const execSync = require('child_process').execSync;

// Secret key from .env file
const secretKey = process.env.SECRET_KEY;

// Function to encrypt data
function encryptData(data) {
    return CryptoJS.AES.encrypt(data, secretKey).toString();
}

// Get action, email/username, and password from command line arguments
const [,, action, identifier, usernameOrPassword, password] = process.argv;

let identifierValue, username, passwordValue;

if (action === 'register') {
    [identifierValue, username, passwordValue] = [identifier, usernameOrPassword, password];
} else if (action === 'login') {
    [identifierValue, passwordValue] = [identifier, usernameOrPassword];
}

if (!action || !identifierValue || !passwordValue || (action === 'register' && !username)) {
    console.log('Usage: node generateCurlCommands.js <register|login> <email|username> <username (for register)> <password>');
    process.exit(1);
}

const encryptedPassword = encryptData(passwordValue);

// Function to execute command and return output
function executeCommand(command) {
    try {
        return execSync(command, { encoding: 'utf-8' });
    } catch (error) {
        console.error('Error executing command:', error.message);
        process.exit(1);
    }
}

// Function to handle OTP verification
function verifyOtp(identifier, endpoint) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter the OTP sent to your email: ', (otp) => {
        const verifyCommand = `curl -X POST https://ec2-3-109-41-79.ap-south-1.compute.amazonaws.com/${endpoint} \
-H "Content-Type: application/json" \
-d '{"identifier": "${identifier}", "otp": "${otp}"}' --insecure`;

        console.log(`Verify ${endpoint} Command:\n`, verifyCommand);
        const verifyOutput = executeCommand(verifyCommand);
        console.log(verifyOutput);
        rl.close();
    });
}

if (action === 'register') {
    const registerCommand = `curl -X POST https://ec2-3-109-41-79.ap-south-1.compute.amazonaws.com/register \
    -H "Content-Type: application/json" \
    -d '{"email": "${identifierValue}", "username": "${username}", "password": "${encryptedPassword}"}' --insecure`;

    console.log("Register Command:\n", registerCommand);
    const output = executeCommand(registerCommand);
    console.log(output);

    verifyOtp(identifierValue, 'verify-registration');

} else if (action === 'login') {
    const loginCommand = `curl -X POST https://ec2-3-109-41-79.ap-south-1.compute.amazonaws.com/login \
    -H "Content-Type: application/json" \
    -d '{"identifier": "${identifierValue}", "password": "${encryptedPassword}"}' --insecure`;

    console.log("Login Command:\n", loginCommand);
    const output = executeCommand(loginCommand);
    console.log(output);

    verifyOtp(identifierValue, 'verify-login');
} else {
    console.log('Invalid action. Use "register" or "login".');
}
