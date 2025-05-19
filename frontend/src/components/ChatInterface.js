import React from 'react';
import TutorMessage from './TutorMessage';
import StudentMessage from './StudentMessage';

const ChatInterface = ({
    messages,
    isProcessing,
    inputValue,
    onInputChange,
    onSendMessage,
    messagesEndRef,
    currentStep // Added to disable input during welcome sequence if needed
}) => {

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim()) {
                onSendMessage(inputValue.trim());
            }
        }
    };

    const isInputDisabled = isProcessing ||
        currentStep === 'welcome' ||
        currentStep === 'grade' ||
        currentStep === 'interests';

    return (
        <>
            <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        msg.role === "tutor" ? (
                            <TutorMessage
                                key={index}
                                message={msg.content}
                                isTyping={false} // isTyping for individual messages controlled by TutorMessage itself
                            />
                        ) : (
                            <StudentMessage key={index} message={msg.content} />
                        )
                    ))}
                    {isProcessing && currentStep !== 'welcome' && currentStep !== 'grade' && currentStep !== 'interests' && (
                        <TutorMessage
                            message=""
                            isTyping={true} // This is the overall loading indicator
                        />
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="border-t border-gray-200 p-4">
                <div className="flex items-center">
                    <textarea
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={isInputDisabled ? "Waiting for your response..." : "Type your message..."}
                        rows="2"
                        value={inputValue}
                        onChange={onInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={isInputDisabled}
                    ></textarea>
                    <button
                        className={`ml-3 p-3 rounded-full ${isInputDisabled || !inputValue.trim()
                            ? "bg-gray-300 text-gray-500"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        onClick={() => {
                            if (inputValue.trim()) {
                                onSendMessage(inputValue.trim());
                            }
                        }}
                        disabled={isInputDisabled || !inputValue.trim()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatInterface; 