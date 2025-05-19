import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import LoadingDots from './LoadingDots';

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

export default TutorMessage; 