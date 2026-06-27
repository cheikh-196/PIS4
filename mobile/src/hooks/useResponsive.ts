import { useWindowDimensions } from 'react-native';

const TABLET_BREAKPOINT = 768;

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= TABLET_BREAKPOINT;

  // For FlatLists (e.g. report cards)
  const numColumns = isTablet ? 2 : 1;

  // For forms, profile, or any content that shouldn't stretch infinitely
  const contentMaxWidth = 600;
  
  // For wider content like map or chat containers
  const containerMaxWidth = 800;

  return {
    width,
    height,
    isTablet,
    numColumns,
    contentMaxWidth,
    containerMaxWidth,
  };
}
