// frontend/src/components/Chat/index.ts
export { default as ChatApp } from './ChatApp';
export { default as ChatWindow } from './ChatWindow';
export { default as ConversationsList } from './ConversationsList';
export { default as ChatFloatingButton } from './ChatFloatingButton';

// Re-export types from hooks
export type { Message, Conversation } from '../../hooks/mvp3/useChat';