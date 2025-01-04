import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CodePage from './pages/Code'
import FunctionWrapper from './pages/TestPage';
function App() {

  return (
    <>
      <div className='bg-slate-700 text-white font-bold text-2xl'>
        Hello World
      </div>
      <Router>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Routes>
          {/* <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contest/:contestId" element={<ContestPage />} /> */}
          <Route path="/code/:contestId/:questionId" element={<CodePage/>} />
          {/* <Route path="/test" element={<FunctionWrapper/>} /> */}

        </Routes>
      </div>
    </Router>
    </>
  )
}

export default App
