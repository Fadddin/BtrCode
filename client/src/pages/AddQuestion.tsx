import React, { useState } from 'react';
import axios from 'axios';

const AddQuestionPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficultyLevel: 'Easy',
    tags: '',
    inputDescription: '',
    outputDescription: '',
    constraints: '',
    broilerPlateCodePython: '',
    broilerPlateCodeJavaScript: '',
    broilerPlateCodeJava: '',
    exampleCases: [{ exampleInput: '', exampleOutput: '', explanation: '' }],
    publicTestCases: [{ input: '', expectedOutput: '' }],
    hiddenTestCases: [{ input: '', expectedOutput: '', description: '' }],
    points: 0,
    author: 'Your Name',
    hints: '',
    editorialText: '',
    editorialSolutionCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, index?: number, key?: string, type?: string) => {
    if (type) {
      const updatedArray = [...(formData[type as keyof typeof formData] as any)];
      updatedArray[index!] = { ...updatedArray[index!], [key!]: e.target.value };
      setFormData({ ...formData, [type]: updatedArray });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleAddField = (type: string) => {
    const newField =
      type === 'hiddenTestCases'
        ? { input: '', expectedOutput: '', description: '' }
        : type === 'publicTestCases'
        ? { input: '', expectedOutput: '' }
        : { exampleInput: '', exampleOutput: '', explanation: '' };
    setFormData({ ...formData, [type]: [...(formData[type as keyof typeof formData] as any), newField] });
  };

  const handleRemoveField = (type: string, index: number) => {
    const updatedArray = [...(formData[type as keyof typeof formData] as any)];
    updatedArray.splice(index, 1);
    setFormData({ ...formData, [type]: updatedArray });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        difficultyLevel: formData.difficultyLevel,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        inputDescription: formData.inputDescription,
        outputDescription: formData.outputDescription,
        constraints: formData.constraints.split('\n').map(constraint => constraint.trim()),
        broilerPlateCode: {
          Python: formData.broilerPlateCodePython,
          JavaScript: formData.broilerPlateCodeJavaScript,
          Java: formData.broilerPlateCodeJava,
        },
        exampleCases: formData.exampleCases,
        publicTestCases: formData.publicTestCases,
        hiddenTestCases: formData.hiddenTestCases,
        scoring: { points: formData.points },
        author: formData.author,
        hints: formData.hints.split('\n'),
        editorial: {
          text: formData.editorialText,
          solutionCode: formData.editorialSolutionCode,
        },
      };

      await axios.post('http://localhost:3000/questions', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      alert('Question added successfully!');
      setFormData({
        title: '',
        description: '',
        difficultyLevel: 'Easy',
        tags: '',
        inputDescription: '',
        outputDescription: '',
        constraints: '',
        broilerPlateCodePython: '',
        broilerPlateCodeJavaScript: '',
        broilerPlateCodeJava: '',
        exampleCases: [{ exampleInput: '', exampleOutput: '', explanation: '' }],
        publicTestCases: [{ input: '', expectedOutput: '' }],
        hiddenTestCases: [{ input: '', expectedOutput: '', description: '' }],
        points: 0,
        author: 'Your Name',
        hints: '',
        editorialText: '',
        editorialSolutionCode: ''
      });
    } catch (error) {
      console.error('Error submitting the form:', error);
      alert('Failed to add question.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 w-full">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">Add New Question</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <label>
              <span className="text-lg font-semibold">Title</span>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500" required />
            </label>
            <label>
              <span className="text-lg font-semibold">Description</span>
              <textarea name="description" value={formData.description} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500" rows={4} required />
            </label>
            <label>
              <span className="text-lg font-semibold">Difficulty Level</span>
              <select name="difficultyLevel" value={formData.difficultyLevel} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </label>
            <label>
              <span className="text-lg font-semibold">Tags (comma-separated)</span>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500" />
            </label>
            <label>
              <span className="text-lg font-semibold">Input Description</span>
              <textarea name="inputDescription" value={formData.inputDescription} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500" rows={3} required />
            </label>
            <label>
              <span className="text-lg font-semibold">Output Description</span>
              <textarea name="outputDescription" value={formData.outputDescription} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500" rows={3} required />
            </label>
            <label>
              <span className="text-lg font-semibold">Constraints (one per line)</span>
              <textarea name="constraints" value={formData.constraints} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500" rows={3} required />
            </label>

            <h2 className="text-2xl font-bold mt-8 text-blue-600">Boilerplate Code</h2>
            <label>
              <span className="text-lg font-semibold">Python</span>
              <textarea name="broilerPlateCodePython" value={formData.broilerPlateCodePython} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500" rows={4} />
            </label>
            <label>
              <span className="text-lg font-semibold">JavaScript</span>
              <textarea name="broilerPlateCodeJavaScript" value={formData.broilerPlateCodeJavaScript} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500" rows={4} />
            </label>
            <label>
              <span className="text-lg font-semibold">Java</span>
              <textarea name="broilerPlateCodeJava" value={formData.broilerPlateCodeJava} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500" rows={4} />
            </label>

            <h2 className="text-2xl font-bold mt-8 text-blue-600">Editorial</h2>
            <label>
              <span className="text-lg font-semibold">Explanation</span>
              <textarea name="editorialText" value={formData.editorialText} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500" rows={4} />
            </label>
            <label>
              <span className="text-lg font-semibold">Solution Code</span>
              <textarea name="editorialSolutionCode" value={formData.editorialSolutionCode} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500" rows={4} />
            </label>

            <label>
              <span className="text-lg font-semibold">Points</span>
              <input type="number" name="points" value={formData.points} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500" required />
            </label>
          </div>

          <button type="submit" className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 text-lg font-semibold">
            Submit Question
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionPage;
