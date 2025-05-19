import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ChatInterface from './ChatInterface';
import StudentProfileSidebar from './StudentProfileSidebar';
import ModuleDisplayArea from './ModuleDisplayArea';

const Home = () => {
    const [studentName, setStudentName] = useState("");
    const [studentGrade, setStudentGrade] = useState("");
    const [interests, setInterests] = useState([]);
    const [currentStep, setCurrentStep] = useState("welcome");
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [studentId, setStudentId] = useState("");
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [studentProgress, setStudentProgress] = useState([]);
    const [isCameraActive, setIsCameraActive] = useState(false); // This state is passed to StudentProfileSidebar
    const messagesEndRef = useRef(null);

    const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    const API = `${API_BASE}/api`;

    useEffect(() => {
        if (currentStep === "welcome" && messages.length === 0) {
            setMessages([
                { role: "tutor", content: "Welcome to Synthesis Tutor 2.0!" },
                { role: "tutor", content: "I'm your AI tutor. I can help you learn any subject through personalized, interactive sessions." },
                { role: "tutor", content: "What's your name?" }
            ]);
        }
    }, [currentStep, messages.length]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

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

                    if (response.data.length > 0) {
                        const completedModuleNames = response.data
                            .filter(p => p.completed)
                            .map(p => p.module_name);

                        setModules(prevModules =>
                            prevModules.map(module => ({
                                ...module,
                                locked: module.requirements && !module.requirements.every(req => completedModuleNames.includes(req))
                            }))
                        );
                    }
                } catch (error) {
                    console.error("Failed to fetch progress:", error);
                }
            };

            fetchModules();
            fetchProgress();
        }
    }, [studentId, API]); // Added API to dependency array as it's used in fetch

    const processWelcomeStep = (message) => {
        setStudentName(message);
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                { role: "tutor", content: `${message}, nice to meet you! Which grade are you in?` }
            ]);
            setCurrentStep("grade");
            setIsProcessing(false);
        }, 1000);
    };

    const processGradeStep = (message) => {
        setStudentGrade(message);
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
    };

    const processInterestsStep = async (message) => {
        const interestsList = message.split(/[,.]/).map(i => i.trim()).filter(Boolean);
        setInterests(interestsList);
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
        } catch (error) {
            console.error("Error creating student:", error);
            setMessages(prev => [
                ...prev,
                { role: "tutor", content: "I'm having trouble saving your information. Please try again." }
            ]);
        } finally {
            setIsProcessing(false);
        }
    };

    const processLearningChatStep = async (message) => {
        try {
            const context = messages.map(m => ({ role: m.role, content: m.content }));
            const currentContext = [...context, { role: "student", content: message }];

            const response = await axios.post(`${API}/chat`, {
                student_id: studentId,
                message: message,
                context: currentContext
            });
            setMessages(prev => [
                ...prev,
                { role: "tutor", content: response.data.response }
            ]);
        } catch (error) {
            console.error("Error chatting with tutor:", error);
            setMessages(prev => [
                ...prev,
                { role: "tutor", content: "I'm having trouble processing your message. Please try again." }
            ]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSendMessage = async (userMessage) => {
        setInputValue("");
        setIsProcessing(true);
        setMessages(prev => [...prev, { role: "student", content: userMessage }]);

        if (currentStep === "welcome") {
            processWelcomeStep(userMessage);
        } else if (currentStep === "grade") {
            processGradeStep(userMessage);
        } else if (currentStep === "interests") {
            await processInterestsStep(userMessage);
        } else if (currentStep === "learning" || currentStep === "chat") {
            await processLearningChatStep(userMessage);
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

            if (completed) {
                setModules(prevModules =>
                    prevModules.map(module => {
                        // This logic might need adjustment if requirements can be cross-module name based
                        // and not just relying on selectedModule.name if module names are unique and map to IDs.
                        // For now, assuming module.requirements contains names of other modules that must be completed.
                        const updatedRequirements = module.requirements?.filter(reqName => reqName !== selectedModule.name);

                        let isStillLocked = false;
                        if (updatedRequirements && updatedRequirements.length > 0) {
                            // Check if all *remaining* requirements are met
                            const completedModuleNames = studentProgress
                                .filter(p => p.completed)
                                .map(p => p.module_name)
                                .concat(selectedModule.name); // include the just completed module

                            isStillLocked = !updatedRequirements.every(req => completedModuleNames.includes(req));
                        }


                        if (module.requirements && module.requirements.includes(selectedModule.name)) {
                            // Re-evaluate locking based on all progress
                            const allCompletedNames = studentProgress
                                .filter(p => p.completed)
                                .map(p => p.module_name)
                                .concat(selectedModule.name); // include the just completed module

                            const requirementsMet = module.requirements.every(req => allCompletedNames.includes(req));
                            return { ...module, locked: !requirementsMet };
                        }


                        return module;
                    })
                );


                // Refresh studentProgress to get the most up-to-date list for module unlocking logic
                const progressResponse = await axios.get(`${API}/progress/${studentId}`);
                const freshStudentProgress = progressResponse.data;
                setStudentProgress(freshStudentProgress);

                setModules(prevModules =>
                    prevModules.map(m => {
                        if (!m.requirements || m.requirements.length === 0) {
                            return { ...m, locked: false };
                        }
                        const completedNames = freshStudentProgress
                            .filter(p => p.completed)
                            .map(p => p.module_name);
                        // if selectedModule was just completed, add it to completedNames for this check
                        if (completed && selectedModule && !completedNames.includes(selectedModule.name)) {
                            completedNames.push(selectedModule.name);
                        }

                        const allReqsMet = m.requirements.every(req => completedNames.includes(req));
                        return { ...m, locked: !allReqsMet };
                    })
                );


                setMessages(prev => [
                    ...prev,
                    {
                        role: "tutor",
                        content: `Congratulations on completing "${selectedModule.name}"! ${score ? `You scored ${score}%.` : ''
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

    const handleBackToModules = () => {
        setSelectedModule(null);
        setCurrentStep("learning");
    };

    // const [typingQueue, setTypingQueue] = useState([]); // Not used
    // const [isCurrentlyTyping, setIsCurrentlyTyping] = useState(false); // Not used

    useEffect(() => {
        if (studentId && currentStep === "learning") {
            setIsCameraActive(true);
        } else if (currentStep !== "learning" && currentStep !== "module") { // Turn off camera if not in learning/module
            setIsCameraActive(false);
        }
    }, [studentId, currentStep]);

    return (
        <div className="flex flex-col h-screen bg-gray-100">
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

            <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-1/3 bg-white shadow-md flex flex-col">
                    {/* <StudentProfileSidebar
                        studentName={studentName}
                        studentGrade={studentGrade}
                        isCameraActive={isCameraActive}
                        setIsCameraActive={setIsCameraActive} // Pass setter for StudentVideoComponent to control
                        studentId={studentId}
                    /> */}

                    <ChatInterface
                        messages={messages}
                        isProcessing={isProcessing}
                        inputValue={inputValue}
                        onInputChange={(e) => setInputValue(e.target.value)}
                        onSendMessage={handleSendMessage}
                        messagesEndRef={messagesEndRef}
                        currentStep={currentStep}
                    />
                </div>

                <div className="w-full md:w-2/3 p-6 overflow-y-auto">
                    <ModuleDisplayArea
                        currentStep={currentStep}
                        selectedModule={selectedModule}
                        modules={modules}
                        studentProgress={studentProgress}
                        handleModuleSelect={handleModuleSelect}
                        handleModuleComplete={handleModuleComplete}
                        handleBackToModules={handleBackToModules}
                    />
                </div>
            </main>
        </div>
    );
};

export default Home; 