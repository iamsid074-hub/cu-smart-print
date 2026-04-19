import { memo } from "react";

interface FoodSectionsProps {
  activeCat: string;
  onCatChange: (cat: string) => void;
}

// Cleared for the next 'crazy' redesign step
const HomeSpecialSections = ({
  activeCat,
  onCatChange,
}: FoodSectionsProps) => {
  return null;
}

export default memo(HomeSpecialSections);
