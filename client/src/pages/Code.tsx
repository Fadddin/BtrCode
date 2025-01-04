import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';

interface ITestCase {
    input: string;
    output: string;
}

interface IQuestion {
    _id: string;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints?: string;
    testCases: ITestCase[];
    points: number;
}

const Code: React.FC = () => {
  const { contestId, questionId } = useParams<{ contestId: string; questionId: string }>();
  const [code, setCode] = useState<string>('console.log("Hello, world!");');
  const [output, setOutput] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const userId = "6713630edf8f30b3f49a837b";

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };

  // Fetch questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log(questionId);
        
        const response = await axios.get(`http://localhost:3000/questions/${questionId}`);
        setQuestions(response.data);
        console.log(response.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch questions');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [contestId]);

  const question = questions

  // Run code with the selected language and payload format
  const runCode = async () => {
    const payload = {
      user: userId,
      contest: contestId,
      question: questionId,
      code,
      language,
    };

    try {
      const response = await axios.post('http://localhost:7070/api/submissions', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setOutput(response.data.result || 'No output');
    } catch (err) {
      setOutput('Error running the code.');
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