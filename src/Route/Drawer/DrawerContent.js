import React from 'react';
import {View, StyleSheet, Image, ImageBackground} from 'react-native';
import {DrawerItem, DrawerContentScrollView} from '@react-navigation/drawer';
import {Title, Caption, Drawer} from 'react-native-paper';
// import Notification from "../../Notification/Notification";
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import Icon1 from 'react-native-vector-icons/Fontisto';

export function DrawerContent(props) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{paddingTop: 0, marginTop: 0, flex: 1}}>
      <View style={styles.drawerContent}>
        <ImageBackground
          source={require('../../assets/menubg.png')}
          style={styles.image}>
          <View style={styles.userInfoSection}>
            <View
              style={{
                height: 100,
                width: 100,
                borderColor: 'white',
                borderWidth: 2,
                borderRadius: 100,
                padding: 2,
                alignItems: 'center',
              }}>
              <Image
                style={{
                  height: 80,
                  width: 80,
                  borderRadius: 100,
                  tintColor: '#b2b2b2',
                }}
                source={require('../../assets/user.png')}
                resizeMode="contain"
              />
            </View>
            <Title style={styles.title}>{props.username}</Title>
          </View>
        </ImageBackground>

        <Drawer.Section style={styles.drawerSection}>
          <DrawerItem
            icon={({color, size}) => (
              <Icon name="clipboard-list-outline" color={color} size={size} />
            )}
            label="Delivery List (TDLS)"
            onPress={() => {
              if (props.role == 1) {
                props.navigation.navigate('TDLSListing');
              } else {
                props.navigation.navigate('TDLSListingDecentre');
              }
            }}
          />

          <DrawerItem
            icon={({color, size}) => (
              <Icon name="text-box-search-outline" color={color} size={size} />
            )}
            label="Search TDLS"
            onPress={() => {
              if (props.role == 1) {
                props.navigation.navigate('Search');
              } else {
                props.navigation.navigate('SearchDecentre');
              }
            }}
          />

          <DrawerItem
            icon={({color, size}) => (
              <Image
                source={require('../../assets/sync.png')}
                style={{height: size, width: size}}
                resizeMode="contain"
              />
            )}
            label="Sync with GOLD"
            onPress={() => {
              if (props.role == 1) {
                props.navigation.navigate('TDLSListing', {sync: true});
              } else {
                props.navigation.navigate('TDLSListingDecentre', {sync: true});
              }
            }}
          />
        </Drawer.Section>
      </View>

      {/* Logout */}
      <DrawerItem
        icon={({color, size}) => (
          <Image
            source={require('../../assets/logout.png')}
            style={{height: size, width: size}}
            resizeMode="contain"
          />
        )}
        label="Logout"
        onPress={() => {
          try {
            AsyncStorage.removeItem('userData');
            props.navigation.navigate('Login');
          } catch (exception) {
            return false;
          }
        }}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  image: {
    // flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  userInfoSection: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingLeft: 20,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
    marginStart: 5,
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 14,
    paddingBottom: 20,
  },
  row: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
