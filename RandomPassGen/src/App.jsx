import React, { useState } from "react";

function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [includeAlphabets, setIncludeAlphabets] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [passwordLength, setPasswordLength] = useState(12);

  const numbers = "0123456789";
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?/";

  const generatePassword = () => {
    const characters = [];
    if (includeAlphabets) characters.push(...alphabets);
    if (includeNumbers) characters.push(...numbers);
    if (includeSymbols) characters.push(...symbols);

    if (characters.length === 0) {
      alert("Please select at least one character type");
      return;
    }

    let password = "";
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters[randomIndex];
    }

    setPassword(password);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 shadow-md rounded">
      <div className="flex space-x-4 items-center">
        <label className="text-gray-700 font-medium">
          <input
            type="checkbox"
            checked={includeAlphabets}
            onChange={(e) => setIncludeAlphabets(e.target.checked)}
            className="mr-2"
          />{" "}
          Alphabets
        </label>
        <label className="text-gray-700 font-medium">
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={(e) => setIncludeNumbers(e.target.checked)}
            className="mr-2"
          />{" "}
          Numbers
        </label>
        <label className="text-gray-700 font-medium">
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={(e) => setIncludeSymbols(e.target.checked)}
            className="mr-2"
          />{" "}
          Symbols
        </label>
      </div>
      <div className="mt-2 flex items-center">
        <label
          htmlFor="passwordLength"
          className="text-gray-700 font-medium mr-2"
        >
          Password Length:
        </label>
        <input
          type="number"
          id="passwordLength"
          value={passwordLength}
          onChange={(e) => setPasswordLength(Number(e.target.value))}
          min="1"
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>
      <button
        onClick={generatePassword}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
      >
        Generate Password
      </button>
      <div className="mt-4">
        <textarea
          value={password}
          rows={3}
          readOnly
          className="w-full border border-gray-300 p-2 resize-none"
        />
      </div>
      <button
        onClick={handleCopy}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
      >
        {isCopied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export default PasswordGenerator;
