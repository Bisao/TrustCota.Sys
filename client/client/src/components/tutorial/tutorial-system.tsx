import ComprehensiveTutorial from "./comprehensive-tutorial";

interface TutorialSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialSystem({ isOpen, onClose }: TutorialSystemProps) {
  return <ComprehensiveTutorial isOpen={isOpen} onClose={onClose} />;
}