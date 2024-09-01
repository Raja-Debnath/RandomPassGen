import ipify from "ipify";
const ip = await ipify({useIPv6: false})
console.log(ip);
let val = ip.slice(-3)
let val1= val.slice(0,1)
let val2= val.slice(1,2)
let val3= val.slice(2,3)
// console.log(val);
// console.log(val1);
// console.log(val2);
// console.log(val3);



const inputSize = 12;
const alpaCheck = true;
const characterCheck = true;
const numCheck = true;

// Expanded character sets
const numbers = '0123456789';
const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?/';

// Function to get a character based on time and pool
function getCharacterFromPool(pool, timeComponent) {
  const index = timeComponent % pool.length;
  return pool[index];
}

// Function to generate a secure character from different pools with delay
async function generateCharacter(pool) {
  return new Promise(resolve => {
    setTimeout(() => {
      const now = new Date();
      const timeComponent = now.getMilliseconds() + now.getSeconds() * 1000 + now.getMinutes() * 60000 + now.getHours() * 3600000;
      resolve(getCharacterFromPool(pool, timeComponent));
    }, 100); // Delay of 100ms
  });
}

// Generate a password
async function generatePassword() {
  const pools = [];
  if (alpaCheck) pools.push(alphabets);
  if (numCheck) pools.push(numbers);
  if (characterCheck) pools.push(symbols);

  if (pools.length === 0) {
    throw new Error('At least one character type must be enabled');
  }

  // Generate characters with delay
  const password = [];
  for (let i = 0; i < inputSize; i++) {
    const pool = pools[i % pools.length]; // Rotate through pools
    const character = await generateCharacter(pool);
    password.push(character);
  }

  // Shuffle password array to ensure randomness
  for (let i = password.length - 1; i > 0; i--) {
    const now = new Date();
    const j = Math.floor((now.getMilliseconds() % (i + 1)) + (now.getSeconds() * 1000) % (i + 1)+(val*val2+val3)); // Ensure j is within bounds
    console.log(j);
    

    [password[i], password[j]] = [password[j], password[i]]; // Swap elements
  }

  return password.join('');
}

// Generate a single password and log it
generatePassword()
  .then(password => console.log(password))
  .catch(error => console.error('Error generating password:', error));



// async function fetchPublicIp() {
//   const response = await fetch('https://api.ipify.org?format=json');
//   const data = await response.json();
//   return data.ip;
// }
// console.log(fetchPublicIp());