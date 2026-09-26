import React from 'react';
import { CreateContentModal } from './CreateContentModal';

export const CreateContent: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  return <CreateContentModal isOpen={open} onClose={onClose} onSuccess={() => {}} />;
};
