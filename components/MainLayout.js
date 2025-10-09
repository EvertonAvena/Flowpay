import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MainLayout = ({ children, navigation, activeScreen }) => {
  return (
    <View style={styles.container}>
      {children}
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={[styles.navIcon, activeScreen === 'Home' && styles.activeNavIcon]}>🏠</Text>
          <Text style={[styles.navText, activeScreen === 'Home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Notification')}
        >
          <Text style={[styles.navIcon, activeScreen === 'Notification' && styles.activeNavIcon]}>📧</Text>
          <Text style={[styles.navText, activeScreen === 'Notification' && styles.activeNavText]}>Notification</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => navigation.navigate('QR')}
        >
          <View style={styles.scanButtonInner}>
            <Text style={styles.scanIcon}>📷</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Transaction')}
        >
          <Text style={[styles.navIcon, activeScreen === 'Transaction' && styles.activeNavIcon]}>📝</Text>
          <Text style={[styles.navText, activeScreen === 'Transaction' && styles.activeNavText]}>Transactions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={[styles.navIcon, activeScreen === 'Profile' && styles.activeNavIcon]}>👤</Text>
          <Text style={[styles.navText, activeScreen === 'Profile' && styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonInner: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#179C7D',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 15,
  },
  navIcon: {
    fontSize: 22,
    color: '#999',
  },
  navText: {
    fontSize: 10,
    color: '#999',
  },
  activeNavIcon: {
    color: '#179C7D',
  },
  activeNavText: {
    color: '#179C7D',
  },
  scanIcon: {
    fontSize: 24,
    color: '#fff',
  },
});

export default MainLayout;