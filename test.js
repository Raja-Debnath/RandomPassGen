const passwordLength = 12;
const includeAlphabets = true;
const includeNumbers = true;
const includeSymbols = true;

const numbers = '0123456789';
const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?/';

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function generateCharacter(pool) {
  // Use a CSPRNG for better randomness
  const randomIndex = getRandomInt(pool.length);
  return pool[randomIndex];
}

async function generatePassword() {
  const pools = [];
  if (includeAlphabets) pools.push(alphabets);
  if (includeNumbers) pools.push(numbers);
  if (includeSymbols) pools.push(symbols);

  if (pools.length === 0) {
    throw new Error('At least one character type must be enabled');
  }

  const password = [];
  for (let i = 0; i < passwordLength; i++) {
    const pool = pools[i % pools.length];
    const character = await generateCharacter(pool);
    password.push(character);
  }

  // Shuffle password using a CSPRNG
  for (let i = password.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

function startGeneratingPasswords(interval) {
  setInterval(async () => {
    try {
      const password = await generatePassword();
      console.log(password);
    } catch (error) {
      console.error('Error generating password:', error);
    }
  }, interval);
}

startGeneratingPasswords(5000);

// made changes from ai this need further experiment