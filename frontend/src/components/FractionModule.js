import React, { useState } from 'react';

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
                        className={`p-4 rounded-lg text-lg font-medium transition-all ${selectedAnswer === option
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
                <div className={`p-4 rounded-lg ${selectedAnswer === correctAnswer ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                    {selectedAnswer === correctAnswer
                        ? "Correct! The highlighted part is 1/4 of the whole shape."
                        : `Incorrect. The highlighted part is actually 1/4 of the whole shape.`}
                </div>
            )}
        </div>
    );
};

export default FractionModule; 