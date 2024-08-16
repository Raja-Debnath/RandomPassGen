const inputSize = 12;
const alpaCheck = true;
const characterCheck = true;
const numCheck = true;

const password = [];

function getRandomNumber() {
  const now = new Date();

  // Get various time components
  const milliseconds = now.getMilliseconds();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();
  const microsec = now.getMilliseconds() / 1000;
  const nanosec = microsec / 1000;

  // Initial seed based on time components
  let seed = milliseconds + seconds * minutes - hours + microsec * nanosec;

  // Apply multiple arithmetic operations for randomness
  seed = (seed * 17 + 53) / (seconds + 1);
  seed = (seed - 31) * (milliseconds + 11);
  seed = (seed + minutes) / (hours + 3);
  seed = seed * 29 - seconds * 7;

  // console.log(seed);

  // Ensure the seed is within the range for the number (0-9)
  const randomCharCode = 48 + (Math.abs(Math.floor(seed)) % 10);

  return String.fromCharCode(randomCharCode);
}
// console.log(getRandomNumber());

function getRandomAlphabet() {
  const now = new Date();

  // Get various time components
  const milliseconds = now.getMilliseconds();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();
  const microsec = now.getMilliseconds() / 1000;
  const nanosec = microsec / 1000;

  // Initial seed based on time components
  let seed = milliseconds + seconds * minutes - hours + microsec * nanosec;

  // Apply multiple arithmetic operations for randomness
  seed = (seed * 17 + 53) / (seconds + 1);
  seed = (seed - 31) * (milliseconds + 11);
  seed = (seed + minutes) / (hours + 3);
  seed = seed * 29 - seconds * 7;

  // console.log(seed);

  // Ensure the seed is within the range for the alphabet (0-25)
  const randomCharCode = 65 + (Math.abs(Math.floor(seed)) % 26);

  return String.fromCharCode(randomCharCode);
}
// console.log(getRandomAlphabet());

function getRandomSymbol() {
  const now = new Date();

  // Get various time components
  const milliseconds = now.getMilliseconds();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();
  const microsec = now.getMilliseconds() / 1000;
  const nanosec = microsec / 1000;

  // Initial seed based on time components
  let seed = milliseconds + seconds * minutes - hours + microsec * nanosec;

  // Apply multiple arithmetic operations for randomness
  seed = (seed * 17 + 53) / (seconds + 1);
  seed = (seed - 31) * (milliseconds + 11);
  seed = (seed + minutes) / (hours + 3);
  seed = seed * 29 - seconds * 7;

  // console.log(seed);

  // Ensure the seed is within the range for the symbol ()
  const randomCharCode = 33 + (Math.abs(Math.floor(seed)) % 15);

  return String.fromCharCode(randomCharCode);
}
// console.log(getRandomSymbol());

function getRandomCondition(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Generate a random number between 1 and 3
// console.log(getRandomCondition); // Output: a random number between 1 and 3

// conditional logic based on alphabet , numbers , symbols

if (alpaCheck && characterCheck && numCheck == true) {
  while (password.length <= inputSize) {
    let randomNumber = getRandomCondition(1, 3);
    switch (randomNumber) {
      case 1:
        let char = password.push(getRandomAlphabet())
        setTimeout(char, 2000);

        break;
      case 2:
        let sym = password.push(getRandomSymbol())
        setTimeout(sym, 2000);

        break;
      case 3:
        let num = password.push(getRandomNumber())
        setTimeout(num , 2000);
        break;
    }
  }
}
if (alpaCheck && numCheck == true) {
}
if (numCheck && characterCheck == true) {
}
if (alpaCheck && characterCheck == true) {
}
if (alpaCheck == true) {
  while (password.length <= inputSize) {
    password.push(getRandomAlphabet());
  }
}
if (characterCheck == true) {
  while (password.length <= inputSize) {
    password.push(getRandomSymbol());
  }
}
if (numCheck == true) {
  while (password.length <= inputSize) {
    password.push(getRandomNumber());
  }
}
console.log(password);
