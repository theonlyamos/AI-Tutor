import React from 'react';
import StudentAvatar from './StudentAvatar';

const StudentMessage = ({ message }) => (
    <div className="flex items-start justify-end mb-4">
        <div className="mr-3 p-4 rounded-lg bg-purple-100 max-w-[80%]">
            <p className="text-gray-800">{message}</p>
        </div>
        <StudentAvatar />
    </div>
);

export default StudentMessage; 