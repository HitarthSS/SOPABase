// components/ChatMessage.tsx
import { motion } from "framer-motion";
import { Message } from "@/types";

const getMessageStyle = (role: string) => {
  switch (role) {
    case 'user':
      return 'bg-blue-500 text-white justify-end';
    case 'adversary':
      return 'bg-red-500 text-white justify-start';
    case 'judge':
      return 'bg-white border border-gray-200 text-gray-900 justify-start';
    default:
      return 'bg-blue-100 text-blue-900 justify-start';
  }
};

const getSenderName = (role: string) => {
  switch (role) {
    case 'user':
      return 'You';
    case 'adversary':
      return 'Adversary';
    case 'judge':
      return 'Judge';
    default:
      return 'Course of Action Assistant';
  }
};

const getNameColor = (role: string) => {
  switch (role) {
    case 'user':
      return 'text-blue-600';
    case 'adversary':
      return 'text-red-600';
    case 'judge':
      return 'text-gray-600';
    default:
      return 'text-blue-600';
  }
};

const messageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => (
  <motion.div
    layout
    variants={messageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
  >
    <motion.span
      layoutId={`name-${message.id}`}
      className={`text-sm font-medium mb-1 ${getNameColor(message.role)}`}
    >
      {getSenderName(message.role)}
    </motion.span>
    <motion.div
      layoutId={`message-${message.id}`}
      className={`max-w-[80%] rounded-lg p-4 whitespace-pre-wrap ${getMessageStyle(message.role)}`}
    >
      {message.content}
    </motion.div>
  </motion.div>
);