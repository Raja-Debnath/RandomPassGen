// app/generate-password.jsx
import ipify from 'ipify';

async function fetchIp() {
  const ip = await ipify({ useIPv6: false });
  return ip;
}

function getCharacterFromPool(pool, timeComponent) {
  const index = timeComponent % pool.length;
  return pool[index];
}

async function generateCharacter(pool) {
  return new Promise(resolve => {
    setTimeout(() => {
      const now = new Date();
      const timeComponent =
        now.getMilliseconds() +
        now.getSeconds() * 1000 +
        now.getMinutes() * 60000 +
        now.getHours() * 3600000;
      resolve(getCharacterFromPool(pool, timeComponent));
    }, 100);
  });
}

export default async function GeneratePassword() {
  try {
    const ip = await fetchIp();
    let val = ip.slice(-3);
    let val1 = parseInt(val.slice(0, 1), 10);
    let val2 = parseInt(val.slice(1, 2), 10);
    let val3 = parseInt(val.slice(2, 3), 10);

    const inputSize = 12;
    const alpaCheck = true;
    const characterCheck = true;
    const numCheck = true;

    const numbers = '0123456789';
    const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?/';

    const pools = [];
    if (alpaCheck) pools.push(alphabets);
    if (numCheck) pools.push(numbers);
    if (characterCheck) pools.push(symbols);

    if (pools.length === 0) {
      throw new Error('At least one character type must be enabled');
    }

    const password = [];
    for (let i = 0; i < inputSize; i++) {
      const pool = pools[i % pools.length];
      const character = await generateCharacter(pool);
      password.push(character);
    }

    for (let i = password.length - 1; i > 0; i--) {
      const now = new Date();
      const j =
        Math.floor(
          (now.getMilliseconds() % (i + 1)) +
          (now.getSeconds() * 1000) % (i + 1) +
          (val1 * val2 + val3)
        );
      [password[i], password[j]] = [password[j], password[i]];
    }

    return <p>Generated Password: {password.join('')}</p>;
  } catch (error) {
    return <p>Error generating password: {error.message}</p>;
  }
}
