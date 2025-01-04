import React from 'react';

type TestCase<T, R> = {
  input: T;
  expectedOutput?: R;
};

type FunctionWrapperProps<T, R> = {
  userFunction: (input: T) => R;
  testCases: TestCase<T, R>[];
};

const FunctionWrapper = <T, R>({ userFunction, testCases }: FunctionWrapperProps<T, R>) => {
  return (
    <div>
      <h2>Function Test Results</h2>
      {testCases.map((testCase, index) => {
        let result;
        let passed = false;

        try {
          result = userFunction(testCase.input);
          passed =
            testCase.expectedOutput !== undefined
              ? JSON.stringify(result) === JSON.stringify(testCase.expectedOutput)
              : true;
        } catch (error) {
          return (
            <div key={index} style={{ color: 'red' }}>
              <h4>Test Case #{index + 1} Failed</h4>
              <p>Error: {error.toString()}</p>
            </div>
          );
        }

        return (
          <div key={index} style={{ marginBottom: '10px' }}>
            <h4>Test Case #{index + 1}</h4>
            <p>
              <strong>Input:</strong> {JSON.stringify(testCase.input)}
            </p>
            <p>
              <strong>Output:</strong> {JSON.stringify(result)}
            </p>
            {testCase.expectedOutput !== undefined && (
              <p>
                <strong>Expected Output:</strong> {JSON.stringify(testCase.expectedOutput)}
              </p>
            )}
            <p style={{ color: passed ? 'green' : 'red' }}>
              <strong>{passed ? 'Passed ✅' : 'Failed ❌'}</strong>
            </p>
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default FunctionWrapper;