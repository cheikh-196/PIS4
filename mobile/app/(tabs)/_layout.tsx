import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Shadow } from '../../src/constants/colors';

const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  index: { focused: 'home', unfocused: 'home-outline' },
  map: { focused: 'map', unfocused: 'map-outline' },
  messages: { focused: 'chatbubble-ellipses', unfocused: 'chatbubble-ellipses-outline' },
  profile: { focused: 'person', unfocused: 'person-outline' },
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          if (!icons) return null;
          return (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Ionicons
                name={focused ? icons.focused : icons.unfocused}
                size={22}
                color={color}
              />
            </View>
          );
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="map" options={{ title: 'Carte' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingBottom: 6,
    paddingTop: 6,
    height: 60,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  activeIconWrap: {
    marginTop: -2,
  },
});