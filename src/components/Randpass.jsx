"use client";
import React, { useState, useEffect, useRef } from 'react';
import { LuRefreshCw } from "react-icons/lu";

async function fetchIp() {
  const response = await fetch('https://api.ipify.org?format=json');
  const data = await response.json();
  return data.ip;
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

async function generatePassword() {
  try {
    const ip = await fetchIp();
    let val = ip.slice(-3);
    let val1 = parseInt(val.slice(0, 1), 10);
    let val2 = parseInt(val.slice(1, 2), 10);
    let val3 = parseInt(val.slice(2, 3), 10);

    const inputSize = 16;
    const alpaCheck = true;
    const smallAlpaCheck = true;
    const characterCheck = true;
    const numCheck = true;

    const numbers = '0123456789';
    const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const smallAlphabets = 'abcdefghijklmnopqrstuvwxyz';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?/';

    const pools = [];
    if (alpaCheck) pools.push(alphabets);
    if (smallAlpaCheck) pools.push(smallAlphabets);
    if (numCheck) pools.push(numbers);
    if (characterCheck) pools.push(symbols);

    if (pools.length === 0) {
      throw new Error('At least one character type must be enabled');
    }

    const generatedPassword = [];
    for (let i = 0; i < inputSize; i++) {
      const pool = pools[i % pools.length];
      const character = await generateCharacter(pool);
      generatedPassword.push(character);
    }

    for (let i = generatedPassword.length - 1; i > 0; i--) {
      const now = new Date();
      const j =
        Math.floor(
          (now.getMilliseconds() % (i + 1)) +
          (now.getSeconds() * 1000) % (i + 1) + (val1 * val2 + val3)
        );
      [generatedPassword[i], generatedPassword[j]] = [generatedPassword[j], generatedPassword[i]];
    }
    return generatedPassword.join('');
  } catch (error) {
    console.error('Error generating password:', error);
    return '';
  }
}

export default function GeneratePassword() {
  const [Password, setPassword] = useState('');
  const [buttonText, setButtonText] = useState('Copy');
  const [isClicked, setIsClicked] = useState(false);
  const [darkThemeMq, setDarkThemeMq] = useState(null);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return; // Exit if already run
    hasRunRef.current = true; // Mark as run
   
    if (typeof window !== 'undefined') { // Check if window is defined
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      setDarkThemeMq(mq);
    }
    
    async function generate() {
      const password = await generatePassword();
      setPassword(password);
    }

    generate();
  }, []);

  const handleButtonClick = async () => {
    setIsClicked(true);
    setPassword("");
    setTimeout(() => setIsClicked(false), 2000);// Duration of animation
    const newPassword = await generatePassword();
    setPassword(newPassword);
  };

  const copyPassword = () => {
    if (Password) {
      navigator.clipboard.writeText(Password)
        .then(() => {
          setButtonText('Copied!');
          setTimeout(() => setButtonText('Copy'), 1000); // Reset button text after 1 second
        })
        .catch(err => {
          console.error('Failed to copy password:', err);
        });
    }
  };

  console.log(darkThemeMq);
  console.log(Password);

  return (
    <main className='h-screen bg-slate-950 cursor-default'>
      <div className='w-fit mx-auto pt-28'>
        <div>
          <h1 className='text-white text-[3.3rem] text-center'>Random Password Generator.</h1>
          <h2 className='text-white text-2xl text-center'>Ensure your online safety with strong, secure passwords—generate them effortlessly.</h2>
        </div>
        <div className='w-9/12 h-14 flex mx-auto py-2.5 pl-[30px] mt-12 bg-slate-900 items-center rounded-full'>
          <div className='flex w-full items-center'>
            <p className='text-white'>{Password || 'Generating...'}</p>
            <LuRefreshCw onClick={handleButtonClick} className={`ml-auto text-[1.7rem] mr-2 text-white cursor-pointer ${isClicked ? 'animate-wiggle' : ''}`} />
          </div>
          <div className='w-[25%] h-14 cursor-pointer flex items-center bg-pink-800 ml-auto rounded-e-full' onClick={copyPassword}>
            <span className="font-medium text-white mx-auto text-[1.5rem]"> {buttonText}</span>
          </div>
        </div>
        <div className='w-8/12 flex mx-auto py-2.5 px-[30px] mt-8 bg-slate-900'>
          <h2 className='font-huehue text-white text-3xl mx-auto'>Strength Box</h2>

        </div>
      </div>
    </main>
  );
}
