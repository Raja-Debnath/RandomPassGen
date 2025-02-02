"use client";
import React, { useState, useEffect, useCallback } from "react";
import { LuRefreshCw } from "react-icons/lu";
import { Checkbox, Slider, VisuallyHidden, useSwitch } from "@nextui-org/react";

const secureRandom = (max) => {
  const randomBuffer = new Uint32Array(1);
  window.crypto.getRandomValues(randomBuffer);
  return randomBuffer[0] % max;
};

export default function GeneratePassword() {
  const [password, setPassword] = useState("");
  const [isClicked, setIsClicked] = useState(false);
  const [buttonText, setButtonText] = useState("Copy");
  const [isAlphaSelected, setIsAlphaSelected] = useState(true);
  const [isSmallAlphSelected, setIsSmallAlphSelected] = useState(true);
  const [isSpecialCharacterSelected, setIsSpecialCharacterSelected] =
    useState(true);
  const [isNumbersSelected, setIsNumbersSelected] = useState(true);
  const [passwordLength, setPasswordLength] = useState(12);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const selectedCount = [
    isAlphaSelected,
    isSmallAlphSelected,
    isSpecialCharacterSelected,
    isNumbersSelected,
  ].filter(Boolean).length;
  const shouldDisable = selectedCount <= 1;

  const characterPools = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?/",
  };

  const checkForWeakConfigurations = () => {
    let warningMessage = "";

    // Check if password length is too short
    if (passwordLength < 12) {
      warningMessage += "Password length is too short. ";
    }

    // Check if too few character types are selected
    if (selectedCount <= 2) {
      warningMessage += "Fewer character types reduce password strength. ";
    }

    // Update the warning state
    setWarning(warningMessage.trim());
  };

  const generatePassword = useCallback(async () => {
    try {
      setError("");
      const enabledPools = [
        ...(isAlphaSelected ? [characterPools.uppercase] : []),
        ...(isSmallAlphSelected ? [characterPools.lowercase] : []),
        ...(isNumbersSelected ? [characterPools.numbers] : []),
        ...(isSpecialCharacterSelected ? [characterPools.symbols] : []),
      ];

      if (enabledPools.length === 0) {
        throw new Error("Enable at least one character type");
      }

      // Generate base password using cryptographically secure random values
      let passwordArray = Array.from({ length: passwordLength }, () => {
        const pool = enabledPools[secureRandom(enabledPools.length)];
        return pool[secureRandom(pool.length)];
      });

      // Secure Fisher-Yates shuffle with crypto RNG
      for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = secureRandom(i + 1);
        [passwordArray[i], passwordArray[j]] = [
          passwordArray[j],
          passwordArray[i],
        ];
      }

      setPassword(passwordArray.join(""));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Password generation failed"
      );
      setPassword("");
    }
  }, [
    isAlphaSelected,
    isSmallAlphSelected,
    isNumbersSelected,
    isSpecialCharacterSelected,
    passwordLength,
  ]);

  const HandleRegeneratePassword = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 2000);
    generatePassword();
  };

  // Regenerate when dependencies change
  useEffect(() => {
    generatePassword();
    checkForWeakConfigurations();
  }, [
    isAlphaSelected,
    isSmallAlphSelected,
    isNumbersSelected,
    isSpecialCharacterSelected,
    passwordLength,
    generatePassword,
  ]);

  const copyToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setButtonText("Copied!");
      setTimeout(() => setButtonText("Copy"), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  return (
    <main className="h-screen bg-slate-950 cursor-default">
      <div className="w-fit mx-auto pt-20">
        <h1 className="text-white text-[3.3rem] text-center">
          Random Password Generator.
          <VisuallyHidden>
            Accessible heading for password generator
          </VisuallyHidden>
        </h1>
        <h2 className="text-white text-2xl text-center">
          Ensure your online safety with strong, secure passwords—generate them
          effortlessly.
        </h2>

        <div className="w-9/12 mx-auto mt-12">
          <div className="flex items-center">
            <input
              type="text"
              value={password || "Generating..."}
              readOnly
              aria-label="Generated password"
              className="w-full h-14 py-2.5 pl-[30px] bg-slate-900 text-white rounded-l-full focus:outline-none"
            />
            <button
              onClick={HandleRegeneratePassword}
              aria-label="Regenerate password"
              className="h-14 px-4 bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
            >
              <LuRefreshCw
                className={`text-[1.7rem]  ${
                  isClicked ? "animate-wiggle" : ""
                }`}
              />
            </button>
            <button
              onClick={copyToClipboard}
              aria-label={buttonText}
              className="h-14 px-8 bg-pink-800 text-white rounded-e-full hover:bg-pink-700 transition-colors"
            >
              <span className="font-medium text-[1.5rem]">{buttonText}</span>
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="w-2/4 mx-auto mt-4 bg-red-700 text-white p-2 text-center rounded-lg"
          >
            {error}
          </div>
        )}
        {warning && (
          <div
            role="alert"
            className="w-2/4 mx-auto mt-4 bg-yellow-500 text-black p-2 text-center rounded-lg"
          >
            Warning: {warning}
          </div>
        )}

        <div className="w-8/12 mx-auto py-6 px-8 mt-8 bg-slate-900 rounded-lg">
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <Checkbox
                isSelected={isAlphaSelected}
                onValueChange={(value) => {
                  setIsAlphaSelected(value);
                  checkForWeakConfigurations();
                }}
                aria-label="Include uppercase letters"
                isDisabled={shouldDisable && isAlphaSelected}
                color="primary"
              >
                <span className="text-white font-SUSE">Uppercase Letters</span>
              </Checkbox>
              <Checkbox
                isSelected={isSmallAlphSelected}
                onValueChange={(value) => {
                  setIsSmallAlphSelected(value);
                  checkForWeakConfigurations();
                }}
                isDisabled={shouldDisable && isSmallAlphSelected}
                aria-label="Include lowercase letters"
                color="primary"
              >
                <span className="text-white font-SUSE">Lowercase Letters</span>
              </Checkbox>
            </div>

            <div className="flex flex-col gap-4">
              <Checkbox
                isSelected={isSpecialCharacterSelected}
                onValueChange={(value) => {
                  setIsSpecialCharacterSelected(value);
                  checkForWeakConfigurations();
                }}
                aria-label="Include special characters"
                color="primary"
                isDisabled={shouldDisable && isSpecialCharacterSelected}
              >
                <span className="text-white font-SUSE">Special Characters</span>
              </Checkbox>
              <Checkbox
                isSelected={isNumbersSelected}
                onValueChange={(value) => {
                  setIsNumbersSelected(value);
                  checkForWeakConfigurations();
                }}
                aria-label="Include numbers"
                color="primary"
                isDisabled={shouldDisable && isNumbersSelected}
              >
                <span className="text-white font-SUSE">Numbers</span>
              </Checkbox>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <Slider
              aria-label="Password length"
              value={passwordLength}
              onChange={(v) => setPasswordLength(Number(v))}
              minValue={6}
              showTooltip={true}
              maxValue={256}
              defaultValue={12}
              className="max-w-md"
              color="primary"
            />
            <p className="text-white font-medium">
              Password Length: <output>{passwordLength}</output>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
