import React from 'react';
import StudentVideoComponent from './StudentVideoComponent';

const StudentProfileSidebar = ({
    studentName,
    studentGrade,
    isCameraActive,
    setIsCameraActive,
    studentId
}) => {
    return (
        <div className="p-4 border-b border-gray-200 flex flex-col gap-4">
            <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mb-2">
                    {/* Placeholder for a more dynamic student avatar if desired */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h2 className="text-lg font-medium text-gray-800">
                    {studentName || "Student"}
                </h2>
                {studentGrade && (
                    <p className="text-sm text-gray-500">Grade {studentGrade}</p>
                )}
            </div>

            <div className="h-48 w-full">
                <StudentVideoComponent isCameraActive={isCameraActive} studentId={studentId} />
            </div>

            {studentId && (
                <button
                    onClick={() => setIsCameraActive(!isCameraActive)}
                    className={`flex items-center justify-center w-full px-4 py-2 rounded-lg text-white ${isCameraActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                        }`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={isCameraActive
                                ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                : "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            }
                        />
                    </svg>
                    {isCameraActive ? "Turn Camera Off" : "Turn Camera On"}
                </button>
            )}
        </div>
    );
};

export default StudentProfileSidebar; 