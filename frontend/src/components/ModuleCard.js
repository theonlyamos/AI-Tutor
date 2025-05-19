import React from 'react';
import { motion } from 'framer-motion';

const ModuleCard = ({ module, onSelect, progress }) => {
    const isCompleted = progress?.some(p => p.module_id === module.id && p.completed);

    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`relative p-6 rounded-xl shadow-lg ${module.locked ? "bg-gray-200" : "bg-white"
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
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${module.subject === "Math" ? "bg-blue-600" :
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
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${module.difficulty === 1 ? "bg-green-100 text-green-800" :
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

export default ModuleCard; 