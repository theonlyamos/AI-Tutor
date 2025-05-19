import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

// Define API endpoint prefix, mirrors what was in App.js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'; // Fallback for safety
const API = `${BACKEND_URL}/api`;

const StudentVideoComponent = ({ isCameraActive, studentId }) => {
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [processingData, setProcessingData] = useState(false);

    const processingRef = useRef(false);

    const sendDataChunk = useCallback(async (dataChunk) => {
        if (processingRef.current || !dataChunk || dataChunk.size === 0) return;

        processingRef.current = true;
        setProcessingData(true);

        const reader = new FileReader();
        reader.readAsDataURL(dataChunk);
        reader.onloadend = async () => {
            const base64data = reader.result;
            try {
                await axios.post(`${API}/process-video-frame`, {
                    student_id: studentId,
                    frame_data: base64data,
                    mime_type: dataChunk.type || "video/webm"
                });
            } catch (error) {
                console.error("Failed to send data chunk:", error);
            } finally {
                processingRef.current = false;
                setProcessingData(false);
            }
        };
        reader.onerror = (error) => {
            console.error("Error converting blob to base64:", error);
            processingRef.current = false;
            setProcessingData(false);
        };
    }, [studentId]); // API dependency removed as it's now in-scope

    useEffect(() => {
        if (isCameraActive && webcamRef.current && studentId) {
            if (webcamRef.current.stream) {
                const options = { mimeType: "video/webm; codecs=vp8,opus" };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.warn(`${options.mimeType} is not supported, trying default.`);
                    delete options.mimeType;
                }

                mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, options);

                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data && event.data.size > 0) {
                        sendDataChunk(event.data);
                    }
                };

                mediaRecorderRef.current.onstart = () => {
                    setIsRecording(true);
                };

                mediaRecorderRef.current.onstop = () => {
                    setIsRecording(false);
                };

                mediaRecorderRef.current.onerror = (event) => {
                    console.error("MediaRecorder error:", event.error);
                };

                mediaRecorderRef.current.start(2000); // Send data every 2 seconds

            } else {
                console.warn("Webcam stream not available yet for MediaRecorder.");
            }
        } else {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
        }

        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
            mediaRecorderRef.current = null; // Clean up MediaRecorder instance
            setIsRecording(false);       // Reset recording state
            setProcessingData(false);    // Reset processing state
        };
    }, [isCameraActive, studentId, sendDataChunk]);

    return (
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-200">
            {isCameraActive ? (
                <Webcam
                    audio={true} // Ensure audio is captured
                    ref={webcamRef}
                    className="w-full h-full object-cover"
                    videoConstraints={{
                        width: 320,
                        height: 240,
                        facingMode: "user"
                    }}
                // mirrored={true} // Optional: if you want to mirror the video
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Camera inactive</p>
                </div>
            )}

            {(processingData || isRecording) && (
                <div className={`absolute bottom-2 right-2 bg-black bg-opacity-50 rounded-full p-1 flex items-center space-x-2 text-white text-xs px-2`}>
                    {isRecording && <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>}
                    {isRecording && !processingData && <span>REC</span>}
                    {processingData && <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>}
                    {processingData && <span>SEND</span>}
                </div>
            )}
        </div>
    );
};

export default StudentVideoComponent; 