import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Question {
  _id: string;
  title: string;
  description: string;
  difficultyLevel: string;
  tags: string[];
  author: string;
}

const QuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:3000/questions');
        setQuestions(response.data); // Set fetched questions
        setLoading(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to fetch questions');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Navigate to the code page
  const handleQuestionClick = (questionId: string) => {
    navigate(`/code/user123/${questionId}`);
  };

  if (loading) {
    return <div className="text-center mt-10">Loading questions...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">Available Questions</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
        {questions.map((question) => (
          <div
            key={question._id}
            className="p-4 bg-white shadow-md rounded-lg hover:bg-blue-50 cursor-pointer border hover:border-blue-400"
            onClick={() => handleQuestionClick(question._id)}
          >
            <h2 className="text-xl font-semibold">{question.title}</h2>
            <p className="text-gray-600 mt-2">{question.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Difficulty: <span className="font-medium">{question.difficultyLevel}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Tags: {question.tags.join(', ')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Author: <span className="font-medium">{question.author}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionsPage;
