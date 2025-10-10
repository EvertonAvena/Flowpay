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
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    paddingBottom: 10,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  scanButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -25,
  },
  scanButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#01946aff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 4,
    borderColor: 'white',
  },
  navIcon: {
    fontSize: 22,
    color: '#999',
  },
  navText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    marginTop: 2,
  },
  activeNavIcon: {
    color: '#179C7D',
  },
  activeNavText: {
    color: '#179C7D',
    fontWeight: '600',
  },
  scanIcon: {
    fontSize: 28,
    color: '#fff',
  },
});

export default MainLayout;