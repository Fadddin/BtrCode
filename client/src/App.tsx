import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CodePage from './pages/Code'
import QuestionsPage from './pages/Questions';
import AddQuestionPage from './pages/AddQuestion';
function App() {

  return (
    <>
      <div className='bg-slate-700 text-white font-bold text-2xl'>
        Hello World
      </div>
      <Router>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Routes>
          <Route path="/" element={<QuestionsPage />} />
          <Route path="/newQuestion" element={<AddQuestionPage />} />
          <Route path="/code/:contestId/:questionId" element={<CodePage/>} />

        </Routes>
      </div>
    </Router>
    </>
  )
}

export default App
