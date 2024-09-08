"use client";
import React, { useState, useEffect, useRef } from 'react';
import { LuRefreshCw } from "react-icons/lu";
import { SunIcon } from '@/assests/SunIcon';
import { MoonIcon } from '@/assests/MoonIcon';
import { Checkbox, Slider, Switch, VisuallyHidden, useSwitch } from "@nextui-org/react";

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

export default function GeneratePassword(props) {
  const hasRunRef = useRef(false);
  const [Password, setPassword] = useState('');
  const [isClicked, setIsClicked] = useState(false);
  const [buttonText, setButtonText] = useState('Copy');
  const [isAlphaSelected, setIsAlphaSelected] = useState(true);
  const [isSmallAlphSelected, setIsSmallAlphSelected] = useState(true);
  const [isSpecialCharacterSelected, setIsSpecialCharacterSelected] = useState(true);
  const [isNumbersSelected, setIsNumbersSelected] = useState(true);
  const [passwordLength, setPasswordLength] = useState(16);
  const [warningMessage, setWarningMessage] = useState('');
  const {
    Component,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps
  } = useSwitch(props);
  const selectedCount = [isAlphaSelected, isSmallAlphSelected, isSpecialCharacterSelected, isNumbersSelected].filter(Boolean).length;
  const shouldDisable = selectedCount <= 1;

  async function generatePassword() {
    try {
      if (passwordLength > 32) {
        setWarningMessage('Password may take a bit longer to generate due to length.');
      } else {
        setWarningMessage('');
      }

      const ip = await fetchIp();
      let val = ip.slice(-3);
      let val1 = parseInt(val.slice(0, 1), 10);
      let val2 = parseInt(val.slice(1, 2), 10);
      let val3 = parseInt(val.slice(2, 3), 10);

      const inputSize = passwordLength;
      const alpaCheck = isAlphaSelected;
      const smallAlpaCheck = isSmallAlphSelected;
      const characterCheck = isSpecialCharacterSelected;
      const numCheck = isNumbersSelected;

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

  useEffect(() => {
    if (hasRunRef.current) return;
    setPassword('')
    async function generatePasswordOnSettingsChange() {
      const newPassword = await generatePassword();
      setPassword(newPassword);
    }
    generatePasswordOnSettingsChange();
  }, [isAlphaSelected, isNumbersSelected, isSmallAlphSelected, isSpecialCharacterSelected, passwordLength]);

  const handleButtonClick = async () => {
    setIsClicked(true);
    setPassword("");
    setTimeout(() => setIsClicked(false), 2000);
    const newPassword = await generatePassword();
    setPassword(newPassword);
  };

  const copyPassword = () => {
    if (Password) {
      navigator.clipboard.writeText(Password)
        .then(() => {
          setButtonText('Copied!');
          setTimeout(() => setButtonText('Copy'), 1000);
        })
        .catch(err => {
          console.error('Failed to copy password:', err);
        });
    }
  };

  return (
    <main className='h-screen bg-slate-950 cursor-default'>
      <div className='w-fit mx-auto pt-20'>
        <div>
          <h1 className='text-white text-[3.3rem] text-center'>Random Password Generator.</h1>
          <h2 className='text-white text-2xl text-center'>Ensure your online safety with strong, secure passwords—generate them effortlessly.</h2>
        </div>
        <div className='w-9/12 mx-auto mt-12'>
          <div className='flex items-center'>
            <input
              type='text'
              value={Password || 'Generating...'}
              readOnly
              className='w-full h-14 py-2.5 pl-[30px] bg-slate-900 text-white rounded-l-full focus:outline-none'
            />
            <button
              onClick={handleButtonClick}
              className={`h-14 px-2 bg-slate-900 text-white flex items-center justify-center cursor-pointer`}
            >
              <LuRefreshCw className={`text-[1.7rem]  ${isClicked ? 'animate-wiggle' : ''}`} />
            </button>
            <button
              onClick={copyPassword}
              className='w-[25%] h-14 cursor-pointer flex items-center bg-pink-800 ml-auto rounded-e-full'
            >
              <span className="font-medium text-white mx-auto text-[1.5rem]">{buttonText}</span>
            </button>
          </div>
        </div>
        {warningMessage && (
          <div className='w-2/4 mx-auto mt-4 bg-orange-700 rounded-lg text-white p-2 text-base rounded-lg text-center'>
            {warningMessage}
          </div>
        )}
        <div className='w-8/12 mx-auto py-2.5 px-[30px] mt-8 bg-slate-900 rounded-lg'>
          <div className="flex gap-28 items-center">
            <div className="w-fit">
              <div className="flex flex-col gap-2">
                <Component {...getBaseProps()}>
                  <VisuallyHidden>
                    <input {...getInputProps()} />
                  </VisuallyHidden>
                  <div
                    {...getWrapperProps()}
                    className={slots.wrapper({
                      class: [
                        "w-8 h-8",
                        "flex items-center justify-center",
                        "rounded-lg bg-default-100 hover:bg-default-200",
                      ],
                    })}
                  >
                    {isSelected ? <SunIcon /> : <MoonIcon />}
                  </div>
                </Component>
              </div>
            </div>
            <h2 className='font-NerkoOne mr-auto text-white text-3xl w-fit'>Strength Box</h2>

          </div>
          <div className='flex justify-between mt-5'>
            <div className='flex flex-col gap-4'>
              <Checkbox
                size="md"
                radius="md"
                color='primary'
                classNames={{ label: "text-white font-SUSE" }}
                isSelected={isAlphaSelected}
                isDisabled={shouldDisable && isAlphaSelected}
                onValueChange={setIsAlphaSelected}
              >
                Capital Letters
              </Checkbox>
              <Checkbox
                size="md"
                radius="md"
                color='primary'
                classNames={{ label: "text-white font-SUSE" }}
                isSelected={isSmallAlphSelected}
                isDisabled={shouldDisable && isSmallAlphSelected}
                onValueChange={setIsSmallAlphSelected}
              >
                Small Letters
              </Checkbox>
            </div>

            <div className='flex flex-col gap-4'>
              <Checkbox
                size="md"
                radius="md"
                color='primary'
                classNames={{ label: "text-white font-SUSE" }}
                isSelected={isSpecialCharacterSelected}
                isDisabled={shouldDisable && isSpecialCharacterSelected}
                onValueChange={setIsSpecialCharacterSelected}
              >
                Special Characters
              </Checkbox>
              <Checkbox
                size="md"
                radius="md"
                color='primary'
                classNames={{ label: "text-white font-SUSE" }}
                isSelected={isNumbersSelected}
                isDisabled={shouldDisable && isNumbersSelected}
                onValueChange={setIsNumbersSelected}
              >
                Numbers
              </Checkbox>
            </div>
          </div>

          <div className="mt-10">
            <Slider
              aria-label
              showTooltip={true}
              step={1}
              maxValue={256}
              minValue={0}
              value={passwordLength}
              onChange={setPasswordLength}
              className="max-w-md"
            />
            <p className="text-default-500 font-medium text-small">Password Length: {passwordLength}</p>
          </div>
        </div>
      </div>
    </main >
  );
}
