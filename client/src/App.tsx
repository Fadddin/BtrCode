import React from 'react';
import FunctionWrapper from './pages/TestPage';

const App: React.FC = () => {
  // 1. Example Function: Sum of Array
  const sumArray = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0);

  const sumArrayTestCases = [
    { input: [1, 2, 3, 4], expectedOutput: 10 },  // 1 + 2 + 3 + 4 = 10
    { input: [0, 0, 0], expectedOutput: 0 },      // Sum of zeros
    { input: [-1, -2, -3], expectedOutput: -6 },  // Sum of negatives
    { input: [100, 200, 300], expectedOutput: 600 },  // Large numbers
  ];

  // 2. Example Function: Concatenate String Array
  const concatArray = (arr: string[]) => arr.join(' ');

  const concatArrayTestCases = [
    { input: ['Hello', 'World'], expectedOutput: 'Hello World' },
    { input: ['React', 'is', 'awesome'], expectedOutput: 'React is awesome' },
    { input: ['TypeScript', 'rocks'], expectedOutput: 'TypeScript rocks' },
    { input: [], expectedOutput: '' },  // Empty array should return an empty string
  ];

  // 3. Example Function: Find Maximum in Array
  const findMax = (arr: number[]) => Math.max(...arr);

  const maxArrayTestCases = [
    { input: [1, 2, 3, 4, 5], expectedOutput: 5 },
    { input: [-10, -20, -3], expectedOutput: -3 },
    { input: [100, 50, 200], expectedOutput: 200 },
    { input: [7], expectedOutput: 7 },  // Single-element array
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Function Wrapper Test Page</h1>

      <h2>1. Sum of Array Function</h2>
      <FunctionWrapper userFunction={sumArray} testCases={sumArrayTestCases} />

      <h2>2. Concatenate String Array Function</h2>
      <FunctionWrapper userFunction={concatArray} testCases={concatArrayTestCases} />

      <h2>3. Find Maximum in Array Function</h2>
      <FunctionWrapper userFunction={findMax} testCases={maxArrayTestCases} />
    </div>
  );
};

export default App;
