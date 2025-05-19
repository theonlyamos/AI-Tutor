import React from 'react';
import ModuleCard from './ModuleCard';
import FractionModule from './FractionModule';
import MathModule from './MathModule';
import EnglishModule from './EnglishModule';
import ScienceModule from './ScienceModule';

const ModuleDisplayArea = ({
    currentStep,
    selectedModule,
    modules,
    studentProgress,
    handleModuleSelect,
    handleModuleComplete,
    handleBackToModules
}) => {

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
                // Assuming FractionModule is the default or a placeholder
                return <FractionModule onComplete={handleModuleComplete} />;
        }
    };

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

    // Fallback or initial state view (e.g., chat welcome message)
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

export default ModuleDisplayArea; 