import React, { useState } from 'react';
import { TopicSelectionScreen } from './components/TopicSelectionScreen';
import { GuidedWritingScreen } from './components/GuidedWritingScreen';
import { ChineseDingzuExperience } from '../chinese-dingzu/ChineseDingzuExperience';
import { sound } from './utils/audio';

interface ChinesePartDExperienceProps {
  onExit: () => void;
}

export function ChinesePartDExperience({ onExit }: ChinesePartDExperienceProps) {
  const [selectedTopic, setSelectedTopic] = useState<'discovery' | 'success' | null>(null);

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#FFFBEB]">
      {selectedTopic === null ? (
        <TopicSelectionScreen
          onSelectTopic={(topicId) => {
            setSelectedTopic(topicId);
          }}
          onExit={onExit}
        />
      ) : selectedTopic === 'discovery' ? (
        <ChineseDingzuExperience
          onExit={() => {
            sound.playPop();
            setSelectedTopic(null);
          }}
        />
      ) : (
        <GuidedWritingScreen
          topicId={selectedTopic}
          onBack={() => {
            sound.playPop();
            setSelectedTopic(null);
          }}
        />
      )}
    </div>
  );
}
