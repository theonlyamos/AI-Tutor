import React, { useState } from 'react';

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
                    className={`w-20 h-20 text-4xl text-center border-2 rounded-lg ${feedback === "correct" ? "border-green-500" :
                        feedback === "incorrect" ? "border-red-500" : "border-gray-300"
                        }`}
                    placeholder="?"
                />
            </div>

            {feedback && (
                <div className={`p-4 rounded-lg mb-6 ${feedback === "correct" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                    {feedback === "correct"
                        ? "Correct! Great job!"
                        : `Incorrect. The answer is ${problems[currentProblem].answer}.`}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={!answers[currentProblem]}
                className={`w-full py-4 px-6 rounded-lg text-white font-medium ${answers[currentProblem] ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
                    } transition-colors`}
            >
                Check Answer
            </button>
        </div>
    );
};

export default MathModule; 