import React, { useState } from 'react';

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
                            className={`p-3 rounded-lg border-2 cursor-pointer ${userAnswers[currentQuestion] === option
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
                <div className={`p-4 rounded-lg mb-6 ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                    {isCorrect
                        ? "Correct! Great job!"
                        : `Incorrect. The correct answer is "${currentQuestionObj.answer}".`}
                </div>
            )}

            <button
                onClick={handleNext}
                disabled={!userAnswers[currentQuestion]}
                className={`w-full py-4 px-6 rounded-lg text-white font-medium ${userAnswers[currentQuestion] ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
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

export default EnglishModule; 