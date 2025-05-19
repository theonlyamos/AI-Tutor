import React from 'react';
import { motion } from 'framer-motion';

const LoadingDots = () => {
    return (
        <div className="flex space-x-2 mt-2">
            <motion.div
                className="w-3 h-3 rounded-full bg-blue-400"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
                className="w-3 h-3 rounded-full bg-blue-400"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
                className="w-3 h-3 rounded-full bg-blue-400"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
        </div>
    );
};

export default LoadingDots; 