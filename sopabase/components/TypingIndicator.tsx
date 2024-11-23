// components/TypingIndicator.tsx
import { motion } from "framer-motion";
import { TypingIndicatorProps } from "@/types";

const getRoleColor = (role: string) => {
  switch (role) {
    case 'adversary':
      return 'bg-red-100';
    case 'judge':
      return 'bg-gray-100';
    default:
      return 'bg-blue-100';
  }
};

const getDotColor = (role: string) => {
  switch (role) {
    case 'adversary':
      return 'bg-red-400';
    case 'judge':
      return 'bg-gray-400';
    default:
      return 'bg-blue-400';
  }
};

export const TypingIndicator = ({ role }: TypingIndicatorProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className={`flex space-x-2 p-3 rounded-lg w-fit ${getRoleColor(role)}`}
  >
    <motion.div
      className={`w-2 h-2 rounded-full ${getDotColor(role)}`}
      animate={{ y: ["0%", "-50%", "0%"] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className={`w-2 h-2 rounded-full ${getDotColor(role)}`}
      animate={{ y: ["0%", "-50%", "0%"] }}
      transition={{ duration: 0.8, delay: 0.15, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className={`w-2 h-2 rounded-full ${getDotColor(role)}`}
      animate={{ y: ["0%", "-50%", "0%"] }}
      transition={{ duration: 0.8, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
    />
  </motion.div>
);