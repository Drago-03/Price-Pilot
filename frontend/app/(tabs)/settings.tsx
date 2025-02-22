import React from 'react';
import { StyleSheet, Switch, TouchableOpacity, Linking } from 'react-native';
import { Text, View } from '../../components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const [locationEnabled, setLocationEnabled] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(colorScheme === 'dark');

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notifications = await AsyncStorage.getItem('notificationsEnabled');
      const location = await AsyncStorage.getItem('locationEnabled');
      
      setNotificationsEnabled(notifications === 'true');
      setLocationEnabled(location === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', value.toString());
      setNotificationsEnabled(value);
    } catch (error) {
      console.error('Error saving notification setting:', error);
    }
  };

  const handleLocationToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('locationEnabled', value.toString());
      setLocationEnabled(value);
    } catch (error) {
      console.error('Error saving location setting:', error);
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    // Note: In a real app, you would use a theme provider to handle dark mode
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://pricepilot.com/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://pricepilot.com/terms');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@pricepilot.com');
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <FontAwesome name="bell" size={20} color={Colors.light.tint} />
            <Text style={styles.settingText}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: '#767577', true: Colors.light.tint }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <FontAwesome name="location-arrow" size={20} color={Colors.light.tint} />
            <Text style={styles.settingText}>Location Services</Text>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={handleLocationToggle}
            trackColor={{ false: '#767577', true: Colors.light.tint }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <FontAwesome name="moon-o" size={20} color={Colors.light.tint} />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: '#767577', true: Colors.light.tint }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.linkItem} onPress={handlePrivacyPolicy}>
          <View style={styles.settingInfo}>
            <FontAwesome name="shield" size={20} color={Colors.light.tint} />
            <Text style={styles.settingText}>Privacy Policy</Text>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkItem} onPress={handleTermsOfService}>
          <View style={styles.settingInfo}>
            <FontAwesome name="file-text-o" size={20} color={Colors.light.tint} />
            <Text style={styles.settingText}>Terms of Service</Text>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkItem} onPress={handleContactSupport}>
          <View style={styles.settingInfo}>
            <FontAwesome name="question-circle" size={20} color={Colors.light.tint} />
            <Text style={styles.settingText}>Contact Support</Text>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  version: {
    textAlign: 'center',
    color: '#666',
    marginTop: 'auto',
    paddingBottom: 20,
  },
}); 