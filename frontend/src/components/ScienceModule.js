import React, { useState } from 'react';

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
                            className={`px-4 py-2 rounded-lg ${step === index
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
                                            backgroundColor: ['#999', '#e6b980', '#6eaa5e', '#c45850', '#8884d8', '#b0a565', '#5e97aa', '#6e5eaa'][planet - 1],
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

export default ScienceModule; 