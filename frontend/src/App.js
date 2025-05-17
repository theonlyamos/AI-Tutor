import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Avatar = () => (
  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold border-4 border-blue-300">
    AI
  </div>
);

const StudentAvatar = () => (
  <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold border-4 border-purple-300">
    S
  </div>
);

const LoadingDots = () => {
  return (
    <div className="flex space-x-2 mt-2">
      <motion.div
        className="w-3 h-3 rounded-full bg-blue-400"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-3 h-3 rounded-full bg-blue-400"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-3 h-3 rounded-full bg-blue-400"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );
};

const TutorMessage = ({ message, isTyping, onComplete }) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const fullText = message;
  const typingSpeed = 20; // milliseconds per character

  useEffect(() => {
    if (isTyping && !isComplete) {
      let i = 0;
      const timer = setInterval(() => {
        if (i < fullText.length) {
          setDisplayText(fullText.substring(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
          setIsComplete(true);
          onComplete && onComplete();
        }
      }, typingSpeed);

      return () => clearInterval(timer);
    } else if (!isTyping) {
      setDisplayText(fullText);
      setIsComplete(true);
      onComplete && onComplete();
    }
  }, [fullText, isTyping, isComplete, onComplete]);

  return (
    <div className="flex items-start mb-4">
      <Avatar />
      <div className="ml-3 p-4 rounded-lg bg-blue-100 max-w-[80%]">
        <p className="text-gray-800">{displayText}</p>
        {isTyping && !isComplete && <LoadingDots />}
      </div>
    </div>
  );
};

const StudentMessage = ({ message }) => (
  <div className="flex items-start justify-end mb-4">
    <div className="mr-3 p-4 rounded-lg bg-purple-100 max-w-[80%]">
      <p className="text-gray-800">{message}</p>
    </div>
    <StudentAvatar />
  </div>
);

const ModuleCard = ({ module, onSelect, progress }) => {
  const isCompleted = progress?.some(p => p.module_id === module.id && p.completed);
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative p-6 rounded-xl shadow-lg ${
        module.locked ? "bg-gray-200" : "bg-white"
      } cursor-pointer transition-all duration-300 ease-in-out`}
      onClick={() => !module.locked && onSelect(module)}
    >
      {module.locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 100-6 3 3 0 000 6z"
            />
          </svg>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div 
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            module.subject === "Math" ? "bg-blue-600" :
            module.subject === "English" ? "bg-green-600" :
            module.subject === "Science" ? "bg-yellow-600" : "bg-indigo-600"
          } text-white text-xl`}
        >
          {module.subject === "Math" ? "M" :
           module.subject === "English" ? "E" :
           module.subject === "Science" ? "S" : "?"}
        </div>
        
        {isCompleted && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Completed
          </span>
        )}
      </div>

      <h3 className={`mt-4 font-bold text-lg ${module.locked ? "text-gray-500" : "text-gray-800"}`}>
        {module.name}
      </h3>
      
      <p className={`mt-2 text-sm ${module.locked ? "text-gray-400" : "text-gray-600"}`}>
        {module.description}
      </p>
      
      <div className="mt-4 flex justify-between items-center">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          module.difficulty === 1 ? "bg-green-100 text-green-800" :
          module.difficulty === 2 ? "bg-yellow-100 text-yellow-800" :
          "bg-red-100 text-red-800"
        }`}>
          {module.difficulty === 1 ? "Beginner" :
           module.difficulty === 2 ? "Intermediate" : "Advanced"}
        </span>
      </div>
    </motion.div>
  );
};

const FractionModule = ({ onComplete }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const correctAnswer = "1/4";

  const handleSelect = (answer) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    if (answer === correctAnswer) {
      setTimeout(() => {
        onComplete && onComplete(true, 100);
      }, 2000);
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Understanding Fractions</h2>
      
      <div className="mb-6">
        <div className="w-full max-w-[300px] mx-auto aspect-square bg-purple-200 rounded-lg grid grid-cols-2 grid-rows-2 gap-2 p-2">
          <div className="bg-purple-500 rounded"></div>
          <div className="bg-purple-200 rounded border-2 border-purple-300"></div>
          <div className="bg-purple-200 rounded border-2 border-purple-300"></div>
          <div className="bg-purple-200 rounded border-2 border-purple-300"></div>
        </div>
      </div>
      
      <p className="text-lg text-gray-700 mb-6">
        If this whole shape is 1, what fraction does the highlighted part represent?
      </p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {["1/2", "1/4", "1/3", "2/3"].map((option) => (
          <button
            key={option}
            className={`p-4 rounded-lg text-lg font-medium transition-all ${
              selectedAnswer === option
                ? option === correctAnswer
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            } ${showFeedback ? "cursor-default" : "cursor-pointer"}`}
            onClick={() => !showFeedback && handleSelect(option)}
            disabled={showFeedback}
          >
            {option}
          </button>
        ))}
      </div>
      
      {showFeedback && (
        <div className={`p-4 rounded-lg ${
          selectedAnswer === correctAnswer ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {selectedAnswer === correctAnswer
            ? "Correct! The highlighted part is 1/4 of the whole shape."
            : `Incorrect. The highlighted part is actually 1/4 of the whole shape.`}
        </div>
      )}
    </div>
  );
};

const MathModule = ({ onComplete }) => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [answers, setAnswers] = useState(Array(5).fill(""));
  const [feedback, setFeedback] = useState(null);

  const problems = [
    { problem: "5 + 3", answer: "8" },
    { problem: "12 - 7", answer: "5" },
    { problem: "4 × 6", answer: "24" },
    { problem: "20 ÷ 4", answer: "5" },
    { problem: "9 + 6", answer: "15" }
  ];

  const handleInputChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[currentProblem] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const isCorrect = answers[currentProblem] === problems[currentProblem].answer;
    setFeedback(isCorrect ? "correct" : "incorrect");
    
    setTimeout(() => {
      setFeedback(null);
      if (isCorrect) {
        if (currentProblem < problems.length - 1) {
          setCurrentProblem(currentProblem + 1);
        } else {
          // All problems completed
          const correctCount = answers.filter((ans, idx) => ans === problems[idx].answer).length;
          const score = (correctCount / problems.length) * 100;
          onComplete && onComplete(true, score);
        }
      }
    }, 1500);
  };

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Basic Math Problems</h2>
      
      <div className="mb-6">
        <div className="text-center">
          <span className="text-sm text-gray-600">Problem {currentProblem + 1} of {problems.length}</span>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${((currentProblem) / problems.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-xl mb-6">
        <div className="text-4xl font-bold text-gray-800 mb-6">
          {problems[currentProblem].problem} = ?
        </div>
        
        <input
          type="text"
          value={answers[currentProblem]}
          onChange={handleInputChange}
          className={`w-20 h-20 text-4xl text-center border-2 rounded-lg ${
            feedback === "correct" ? "border-green-500" :
            feedback === "incorrect" ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="?"
        />
      </div>
      
      {feedback && (
        <div className={`p-4 rounded-lg mb-6 ${
          feedback === "correct" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {feedback === "correct"
            ? "Correct! Great job!"
            : `Incorrect. The answer is ${problems[currentProblem].answer}.`}
        </div>
      )}
      
      <button
        onClick={handleSubmit}
        disabled={!answers[currentProblem]}
        className={`w-full py-4 px-6 rounded-lg text-white font-medium ${
          answers[currentProblem] ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
        } transition-colors`}
      >
        Check Answer
      </button>
    </div>
  );
};

const EnglishModule = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);

  const passage = "The small brown dog ran quickly across the green field. He was chasing a red ball that his owner had thrown. The sun was shining brightly in the blue sky.";
  
  const questions = [
    {
      id: 1,
      question: "What color was the dog?",
      options: ["Black", "Brown", "White", "Grey"],
      answer: "Brown"
    },
    {
      id: 2,
      question: "What was the dog chasing?",
      options: ["A cat", "A frisbee", "A red ball", "A squirrel"],
      answer: "A red ball"
    },
    {
      id: 3,
      question: "Where did the dog run?",
      options: ["On the beach", "In the house", "Across the green field", "Through the park"],
      answer: "Across the green field"
    }
  ];

  const handleAnswerSelect = (option) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion]: option
    });
  };

  const handleNext = () => {
    if (showFeedback) {
      setShowFeedback(false);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // All questions answered
        const correctCount = Object.keys(userAnswers).filter(
          qIdx => userAnswers[qIdx] === questions[qIdx].answer
        ).length;
        const score = (correctCount / questions.length) * 100;
        onComplete && onComplete(true, score);
      }
    } else {
      setShowFeedback(true);
    }
  };

  const currentQuestionObj = questions[currentQuestion];
  const isCorrect = userAnswers[currentQuestion] === currentQuestionObj.answer;

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Reading Comprehension</h2>
      
      <div className="mb-6">
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-800">{passage}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-center mb-4">
          <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</span>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
              style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-800 mb-4">{currentQuestionObj.question}</h3>
        
        <div className="space-y-3">
          {currentQuestionObj.options.map((option) => (
            <div 
              key={option}
              className={`p-3 rounded-lg border-2 cursor-pointer ${
                userAnswers[currentQuestion] === option 
                  ? showFeedback
                    ? option === currentQuestionObj.answer
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                    : "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => !showFeedback && handleAnswerSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
      
      {showFeedback && (
        <div className={`p-4 rounded-lg mb-6 ${
          isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {isCorrect
            ? "Correct! Great job!"
            : `Incorrect. The correct answer is "${currentQuestionObj.answer}".`}
        </div>
      )}
      
      <button
        onClick={handleNext}
        disabled={!userAnswers[currentQuestion]}
        className={`w-full py-4 px-6 rounded-lg text-white font-medium ${
          userAnswers[currentQuestion] ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
        } transition-colors`}
      >
        {showFeedback 
          ? currentQuestion < questions.length - 1 
            ? "Next Question" 
            : "Finish" 
          : "Check Answer"}
      </button>
    </div>
  );
};

const ScienceModule = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState([false, false, false]);
  
  const handleStepComplete = (stepIndex) => {
    const newCompleted = [...completed];
    newCompleted[stepIndex] = true;
    setCompleted(newCompleted);
    
    if (newCompleted.every(Boolean)) {
      setTimeout(() => {
        onComplete && onComplete(true, 100);
      }, 1000);
    }
  };
  
  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Basic Science Concepts</h2>
      
      <div className="mb-6">
        <div className="flex space-x-2 mb-4">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={`px-4 py-2 rounded-lg ${
                step === index
                  ? "bg-yellow-500 text-white"
                  : completed[index]
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Step {index + 1}
              {completed[index] && (
                <span className="ml-2">✓</span>
              )}
            </button>
          ))}
        </div>
        
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">States of Matter</h3>
            <p>Matter exists in three main states:</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-blue-100 rounded-lg text-center">
                <div className="w-20 h-20 mx-auto bg-blue-500 rounded-lg mb-2"></div>
                <span>Solid</span>
              </div>
              <div className="p-4 bg-blue-100 rounded-lg text-center">
                <div className="w-20 h-20 mx-auto bg-blue-400 rounded-full mb-2"></div>
                <span>Liquid</span>
              </div>
              <div className="p-4 bg-blue-100 rounded-lg text-center">
                <div className="w-20 h-20 mx-auto flex justify-center items-center mb-2">
                  <div className="w-4 h-4 bg-blue-300 rounded-full m-1"></div>
                  <div className="w-4 h-4 bg-blue-300 rounded-full m-1"></div>
                  <div className="w-4 h-4 bg-blue-300 rounded-full m-1"></div>
                  <div className="w-4 h-4 bg-blue-300 rounded-full m-1"></div>
                </div>
                <span>Gas</span>
              </div>
            </div>
            <p>Water can exist in all three states: ice (solid), water (liquid), and steam (gas).</p>
            <button
              onClick={() => handleStepComplete(0)}
              className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg"
            >
              I understand
            </button>
          </div>
        )}
        
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">The Solar System</h3>
            <p>Our solar system consists of:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Sun (a star at the center)</li>
              <li>Eight planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune)</li>
              <li>Dwarf planets (like Pluto)</li>
              <li>Moons, asteroids, and comets</li>
            </ul>
            <div className="flex justify-center my-4">
              <div className="relative w-full max-w-sm h-20">
                <div className="absolute left-1/2 top-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 rounded-full"></div>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((planet) => (
                  <div 
                    key={planet}
                    className="absolute"
                    style={{
                      width: `${6 + planet * 2}px`,
                      height: `${6 + planet * 2}px`,
                      borderRadius: '50%',
                      backgroundColor: ['#999', '#e6b980', '#6eaa5e', '#c45850', '#8884d8', '#b0a565', '#5e97aa', '#6e5eaa'][planet-1],
                      left: `${50 + (planet * 18)}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  ></div>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleStepComplete(1)}
              className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg"
            >
              I understand
            </button>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Living Things</h3>
            <p>All living things share these characteristics:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>They need food and water</li>
              <li>They grow and develop</li>
              <li>They reproduce</li>
              <li>They respond to their environment</li>
              <li>They use energy</li>
            </ul>
            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="p-3 bg-green-100 rounded-lg text-center">
                <div className="text-3xl mb-2">🌱</div>
                <span>Plants</span>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg text-center">
                <div className="text-3xl mb-2">🐕</div>
                <span>Animals</span>
              </div>
            </div>
            <button
              onClick={() => handleStepComplete(2)}
              className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg"
            >
              I understand
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StudentVideoComponent = ({ isCameraActive, studentId }) => {
  const webcamRef = useRef(null);
  const [captureInterval, setCaptureInterval] = useState(null);
  const [lastImageData, setLastImageData] = useState(null);
  const [processingFrame, setProcessingFrame] = useState(false);

  useEffect(() => {
    if (isCameraActive && webcamRef.current && studentId) {
      // Set up a capture interval to periodically send frames to the backend
      const interval = setInterval(async () => {
        if (processingFrame) return; // Skip if already processing a frame
        
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
          setLastImageData(imageSrc);
          
          // Send the frame to the backend
          try {
            setProcessingFrame(true);
            await axios.post(`${API}/process-video-frame`, {
              student_id: studentId,
              frame_data: imageSrc
            });
            setProcessingFrame(false);
          } catch (error) {
            console.error("Failed to send video frame:", error);
            setProcessingFrame(false);
          }
        }
      }, 3000); // Capture every 3 seconds
      
      setCaptureInterval(interval);
      return () => clearInterval(interval);
    } else if (!isCameraActive && captureInterval) {
      clearInterval(captureInterval);
      setCaptureInterval(null);
    }
  }, [isCameraActive, captureInterval, studentId, processingFrame]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-200">
      {isCameraActive ? (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-full object-cover"
          videoConstraints={{
            width: 320,
            height: 240,
            facingMode: "user"
          }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Camera inactive</p>
        </div>
      )}
      
      {processingFrame && (
        <div className="absolute bottom-2 right-2">
          <div className="animate-pulse h-3 w-3 bg-green-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const [studentName, setStudentName] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [interests, setInterests] = useState([]);
  const [interestInput, setInterestInput] = useState("");
  const [currentStep, setCurrentStep] = useState("welcome");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [studentProgress, setStudentProgress] = useState([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    if (currentStep === "welcome" && messages.length === 0) {
      setMessages([
        { role: "tutor", content: "Welcome to Synthesis Tutor 2.0!" },
        { role: "tutor", content: "I'm your AI tutor. I can help you learn any subject through personalized, interactive sessions." },
        { role: "tutor", content: "What's your name?" }
      ]);
    }
  }, [currentStep, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fetch modules
  useEffect(() => {
    if (studentId) {
      const fetchModules = async () => {
        try {
          const response = await axios.get(`${API}/modules`);
          setModules(response.data);
        } catch (error) {
          console.error("Failed to fetch modules:", error);
        }
      };

      const fetchProgress = async () => {
        try {
          const response = await axios.get(`${API}/progress/${studentId}`);
          setStudentProgress(response.data);

          // Unlock modules based on progress
          if (response.data.length > 0) {
            // This would be more complex in a real app
            const completedModuleNames = response.data
              .filter(p => p.completed)
              .map(p => p.module_name);

            setModules(prevModules => 
              prevModules.map(module => {
                if (module.requirements && 
                    module.requirements.every(req => completedModuleNames.includes(req))) {
                  return { ...module, locked: false };
                }
                return module;
              })
            );
          }
        } catch (error) {
          console.error("Failed to fetch progress:", error);
        }
      };

      fetchModules();
      fetchProgress();
    }
  }, [studentId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsProcessing(true);

    // Add user message to chat
    setMessages(prev => [...prev, { role: "student", content: userMessage }]);

    if (currentStep === "welcome") {
      // Handle name input
      setStudentName(userMessage);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { role: "tutor", content: `${userMessage}, nice to meet you! Which grade are you in?` }
        ]);
        setCurrentStep("grade");
        setIsProcessing(false);
      }, 1000);
    } else if (currentStep === "grade") {
      // Handle grade input
      setStudentGrade(userMessage);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { 
            role: "tutor", 
            content: `Great! What are you interested in learning? You can tell me a few topics (like math, space, animals, etc.).` 
          }
        ]);
        setCurrentStep("interests");
        setIsProcessing(false);
      }, 1000);
    } else if (currentStep === "interests") {
      // Handle interests input
      const interestsList = userMessage.split(/[,.]/).map(i => i.trim()).filter(Boolean);
      setInterests(interestsList);

      // Create student in the backend
      try {
        const response = await axios.post(`${API}/students`, {
          name: studentName,
          grade: studentGrade,
          interests: interestsList
        });

        setStudentId(response.data.id);

        setMessages(prev => [
          ...prev,
          { 
            role: "tutor", 
            content: `Thanks for sharing! I'll customize your learning experience based on your interests in ${interestsList.join(", ")}.`
          },
          {
            role: "tutor",
            content: "Let's get started! What would you like to learn today? You can choose from different modules or just chat with me about any topic."
          }
        ]);
        setCurrentStep("learning");
        setIsProcessing(false);

      } catch (error) {
        console.error("Error creating student:", error);
        setMessages(prev => [
          ...prev,
          { role: "tutor", content: "I'm having trouble saving your information. Please try again." }
        ]);
        setIsProcessing(false);
      }
    } else if (currentStep === "learning" || currentStep === "chat") {
      // Chat with the AI tutor
      try {
        // Format previous conversation for context
        const context = messages.map(m => ({
          role: m.role,
          content: m.content
        }));

        const response = await axios.post(`${API}/chat`, {
          student_id: studentId,
          message: userMessage,
          context: context
        });

        setMessages(prev => [
          ...prev,
          { role: "tutor", content: response.data.response }
        ]);
        setIsProcessing(false);
      } catch (error) {
        console.error("Error chatting with tutor:", error);
        setMessages(prev => [
          ...prev,
          { role: "tutor", content: "I'm having trouble processing your message. Please try again." }
        ]);
        setIsProcessing(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setCurrentStep("module");
    setMessages(prev => [
      ...prev,
      { 
        role: "tutor", 
        content: `Great choice! Let's work on "${module.name}". I'll guide you through this module.` 
      }
    ]);
  };

  const handleModuleComplete = async (completed, score) => {
    if (!selectedModule || !studentId) return;
    
    try {
      await axios.post(`${API}/progress`, {
        student_id: studentId,
        module_id: selectedModule.id,
        module_name: selectedModule.name,
        completed: completed,
        score: score
      });
      
      // Update local progress tracking
      setStudentProgress(prev => {
        const existing = prev.find(p => p.module_id === selectedModule.id);
        if (existing) {
          return prev.map(p => 
            p.module_id === selectedModule.id 
              ? { ...p, completed, score } 
              : p
          );
        } else {
          return [...prev, {
            module_id: selectedModule.id,
            module_name: selectedModule.name,
            completed,
            score
          }];
        }
      });
      
      // Check if any locked modules should be unlocked
      if (completed) {
        setModules(prevModules => 
          prevModules.map(module => {
            if (module.requirements && 
                module.requirements.includes(selectedModule.name)) {
              return { ...module, locked: false };
            }
            return module;
          })
        );
        
        setMessages(prev => [
          ...prev,
          { 
            role: "tutor", 
            content: `Congratulations on completing "${selectedModule.name}"! ${
              score ? `You scored ${score}%.` : ''
            } You're making great progress!` 
          }
        ]);
        
        setSelectedModule(null);
        setCurrentStep("learning");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const renderModule = () => {
    if (!selectedModule) return null;
    
    switch (selectedModule.name) {
      case "Introduction to Numbers":
        return <MathModule onComplete={handleModuleComplete} />;
      case "Reading Comprehension":
        return <EnglishModule onComplete={handleModuleComplete} />;
      case "Basic Science Concepts":
        return <ScienceModule onComplete={handleModuleComplete} />;
      default:
        return <FractionModule onComplete={handleModuleComplete} />;
    }
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
    setCurrentStep("learning");
  };

  const [typingQueue, setTypingQueue] = useState([]);
  const [isCurrentlyTyping, setIsCurrentlyTyping] = useState(false);

  // Process typing queue
  useEffect(() => {
    if (typingQueue.length > 0 && !isCurrentlyTyping) {
      setIsCurrentlyTyping(true);
    }
  }, [typingQueue, isCurrentlyTyping]);

  // Additional useEffect to handle camera activation when student is registered
  useEffect(() => {
    if (studentId && currentStep === "learning") {
      // Activate camera after student is registered and we're in the learning phase
      setIsCameraActive(true);
    }
  }, [studentId, currentStep]);

  // Render the main content based on current step
  const renderMainContent = () => {
    if (currentStep === "module" && selectedModule) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleBackToModules}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-11.707a1 1 0 00-1.414 0L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              Back to Modules
            </button>
            <h2 className="text-xl font-bold text-gray-800">{selectedModule.name}</h2>
          </div>
          {renderModule()}
        </div>
      );
    }
    
    if (currentStep === "learning") {
      return (
        <div className="h-full flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Learning Modules</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module) => (
              <ModuleCard 
                key={module.id} 
                module={module} 
                onSelect={handleModuleSelect}
                progress={studentProgress}
              />
            ))}
          </div>
        </div>
      );
    }
    
    // Default is an empty state prompting the user to interact with the tutor
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 mb-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <h3 className="text-xl font-medium text-gray-700 mb-2">
          Chat with your AI tutor
        </h3>
        <p className="text-gray-500 max-w-md">
          Start a conversation with your AI tutor to get help with any subject. 
          Once you're ready, you can choose a learning module to begin.
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center space-x-1">
              <div className="h-6 w-6 bg-yellow-400 transform rotate-45"></div>
              <div className="h-6 w-6 bg-blue-400 transform -rotate-45"></div>
            </div>
            <h1 className="text-white text-xl font-bold ml-3">Synthesis Tutor 2.0</h1>
          </div>
          
          {studentId && (
            <div className="text-white flex items-center">
              <span className="mr-2">{studentName}</span>
              <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center">
                {studentName.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Left Column - Chat with AI tutor */}
        <div className="w-full md:w-1/3 bg-white shadow-md flex flex-col">
          <div className="p-4 border-b border-gray-200 flex flex-col gap-4">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-800">
                {studentName || "Student"}
              </h2>
              {studentGrade && (
                <p className="text-sm text-gray-500">Grade {studentGrade}</p>
              )}
            </div>
            
            {/* Student Video Component */}
            <div className="h-48 w-full">
              <StudentVideoComponent isCameraActive={isCameraActive} />
            </div>
            
            {/* Camera toggle button - only shown when student is registered */}
            {studentId && (
              <button
                onClick={() => setIsCameraActive(!isCameraActive)}
                className={`flex items-center justify-center px-4 py-2 rounded-lg text-white ${
                  isCameraActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                }`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={isCameraActive 
                      ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" 
                      : "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    } 
                  />
                </svg>
                {isCameraActive ? "Turn Camera Off" : "Turn Camera On"}
              </button>
            )}
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                msg.role === "tutor" ? (
                  <TutorMessage 
                    key={index} 
                    message={msg.content}
                    isTyping={false}
                  />
                ) : (
                  <StudentMessage key={index} message={msg.content} />
                )
              ))}
              {isProcessing && (
                <TutorMessage 
                  message="" 
                  isTyping={true} 
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <textarea
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
                rows="2"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
              ></textarea>
              <button
                className={`ml-3 p-3 rounded-full ${
                  isProcessing || !inputValue.trim()
                    ? "bg-gray-300 text-gray-500"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                onClick={handleSendMessage}
                disabled={isProcessing || !inputValue.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Column - Interactive learning modules */}
        <div className="w-full md:w-2/3 p-6 overflow-y-auto">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <div className="App bg-gray-100 min-h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
