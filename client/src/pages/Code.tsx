import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';

interface ITestCase {
  input: any[];
  output: any;
}

interface IQuestion {
  _id: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints?: string;
  hiddenTestCases: ITestCase[];
  testCases: ITestCase[];
  points: number;
}

const Code: React.FC = () => {
  const { contestId, questionId } = useParams<{ contestId: string; questionId: string }>();
  const [code, setCode] = useState<string>('function userFunction(arr) { return arr.map(x => x * 2); }');
  const [output, setOutput] = useState<string>('Waiting for output...');
  const [language, setLanguage] = useState<string>('javascript');
  const [question, setQuestion] = useState<IQuestion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const websocketRef = useRef<WebSocket | null>(null); // WebSocket reference
  const userId = "user123"; // Hardcoded user ID

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };

  // Fetch question on component mount
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/questions/${questionId}`);
        setQuestion(response.data);
        console.log(response.data.broilerPlateCode.JavaScript);
        setCode(response.data.broilerPlateCode.JavaScript);

        
        // setCode(response.data.broilerPlateCode)
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch the question');
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  // Establish WebSocket connection for receiving output
  useEffect(() => {
    const wsUrl = `ws://localhost:8080/?userId=${userId}&contestId=${contestId}`;
    websocketRef.current = new WebSocket(wsUrl);

    websocketRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    websocketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket Message:', data);
      if (data.result) {
        setOutput(data.result); // Update output box with WebSocket response
      } else {
        setOutput('Received unknown message format.');
      }
    };

    websocketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setOutput('Error with WebSocket connection.');
    };

    websocketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      websocketRef.current?.close(); // Cleanup WebSocket on unmount
    };
  }, [contestId, userId]);

  // Submit the payload via HTTP POST
  const runCode = async () => {
    if (!question) {
      setOutput('Error: Question not loaded.');
      return;
    }

    const payload = {
      userId,
      contestId: contestId || 'defaultContest',
      language,
      code,
      testCases: question.hiddenTestCases, // Use the test cases from the question
    };

    try {
      setOutput('Submitting code...');
      const response = await axios.post('http://localhost:3003/submit', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('HTTP POST response:', response.data);
      setOutput('Code submitted. Waiting for WebSocket result...');
    } catch (err) {
      console.error('HTTP POST error:', err);
      setOutput('Error submitting the code.');
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!question) {
    return <div className="text-center mt-10">Question not found.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
      <p className="text-gray-700 mb-4">{question.description}</p>
      <p className="text-sm text-gray-500 mb-2">Input Format: {question.inputFormat}</p>
      <p className="text-sm text-gray-500 mb-2">Output Format: {question.outputFormat}</p>
      {question.constraints && (
        <p className="text-sm text-gray-500 mb-2">Constraints: {question.constraints}</p>
      )}
      <p className="text-sm text-gray-500 mb-2">Points: {question.points}</p>

      {/* Language Selector */}
      <div className="mb-4">
        <label htmlFor="language" className="mr-2 text-lg">Select Language:</label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <div className="w-full max-w-4xl shadow-lg rounded-md overflow-hidden">
        <Editor
          height="50vh"
          width="80vw"
          theme="vs-dark"
          language={language === 'cpp' ? 'cpp' : language}
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
          }}
        />
      </div>

      <button
        onClick={runCode}
        className="mt-4 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        Run Code
      </button>

      <div className="w-full max-w-4xl mt-6 p-4 bg-white shadow-md rounded-md">
        <h2 className="text-xl font-semibold">Output:</h2>
        <pre className="mt-2 p-2 bg-gray-100 rounded">{output}</pre>
      </div>
    </div>
  );
};

export default Code;
