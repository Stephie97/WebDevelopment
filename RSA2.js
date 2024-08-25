const crypto = require('crypto'); // Imports the "crypto" module to be able to use cryptographic functions.

const readline = require('readline'); // Imports the "readline" module to read user input from the terminal.

function generateKeyPair() { // Function to generate the RSA public and private keys.
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048, // 2048 bits = length of the key. According to Villanueva (2024), NIST agreed that 2048-bit keys are acceptable until 2030. After that 4096-bit keys will be mandatory.
        publicKeyEncoding: { // Object specifying how the public key will be formatted.
            type: 'spki', // "Subject Public Key Info" = Format of the public key, includes the algorithm identifier and the public key data.
            format: 'pem' // "Privacy-Enhanced Mail" = Encoding format for the public key, includes header and footer lines.
        },
        privateKeyEncoding: { // Object specifying how the private key will be formatted.
            type: 'pkcs8', // "Public Key Cryptography Standards #8" = Format of the private key, includes the private key and its attributes, algorithms, and a way to encode and transport the private keys.
            format: 'pem', // "Privacy-Enhanced Mail" = Encoding format for the private key, includes header and footer lines.
            cipher: 'aes-256-cbc', // "Advanced Encryption Standard - 256 bits - Cipher Block Chaining" = Encryption cipher for the private key.
            passphrase: 'your-passphrase' // Passphrase for encrypting the private key, which adds an extra layer of protection, since this "password" is required to get to the actual private key.
        }
    });
}

function encrypt(text, publicKey) { // Function to encrypt a text using the public key.
    const buffer = Buffer.from(text, 'utf8'); // Convert text to a buffer using UTF-8 encoding. A buffer is a binary data type to handle binary data and be able to process it further.
    const encrypted = crypto.publicEncrypt(publicKey, buffer); // Encrypts the buffer using the public key.
    return encrypted.toString('base64'); // Convert the encrypted buffer to a base64 string for easier display. base64 is an encoding scheme to convert binary data into a string using 64 different characters this ensures readability.
}

function decrypt(encryptedText, privateKey) { // Function to decrypt text using the private key.
    const buffer = Buffer.from(encryptedText, 'base64'); // Converts the base64 string to a buffer.
    const decrypted = crypto.privateDecrypt({ // Decrypts the buffer using the private key.
        key: privateKey, // Private key used for decryption.
        passphrase: 'your-passphrase' // Passphrase for the private key.
    }, buffer); // Decrypts the buffer.
    return decrypted.toString('utf8'); // Converts the decrypted buffer back to a UTF-8 string.
}

const rl = readline.createInterface({ // The declared variable rl provides the interface for user input.
    input: process.stdin, // Allows "Standard Input" via the terminal.
    output: process.stdout // Allows "Standrad Output" via the terminal.
});

// Generate the RSA keys
const { publicKey, privateKey } = generateKeyPair(); // Function to get the public and private keys.
console.log('Public Key:\n', publicKey); // Displays the public key on the console.
console.log('Private Key:\n', privateKey); // Displays the private key on the console.

function askQuestion(query) { // Function to ask a question and return the user's answer
    return new Promise((resolve) => rl.question(query, resolve)); // Use readline to ask the question and resolve the promise with the user's answer
}

async function main() { // Main asynchronous function to handle the flow of the script. (runs in the background while the rest of the code continues to execute)
    // Asks the user for text to encrypt
    const textToEncrypt = await askQuestion('Enter the text to encrypt: '); // Displays the text "Enter the text to encrypt:" and waits for user input.
    const encryptedText = encrypt(textToEncrypt, publicKey); // Encrypts the user input
    console.log('Encrypted Text:', encryptedText); // Displays the encrypted text

    // Ask the user if they want to decrypt the message
    const decryptChoice = await askQuestion('Would you like to decrypt this message again? (yes/no): '); // Displays the text "Would you like to decrypt this message again?"" and waits for user input.
    if (decryptChoice.toLowerCase() === 'yes') { // Check if the user choose "yes".
        try {
            const decryptedText = decrypt(encryptedText, privateKey); // Decrypts the previously encrypted text.
            console.log('Decrypted Text:', decryptedText); // Displays the decrypted text.
        } catch (error) {
            console.error('Failed to decrypt text. Ensure you have the correct private key and passphrase.'); // Error handling including a message if decryption fails.
        }
    } else {
        console.log('Exiting. Have a nice day!'); // Exit message if the user choses "no".
    }

    rl.close(); // Closes the readline interface
}

main(); // Calls the main function to run the script
