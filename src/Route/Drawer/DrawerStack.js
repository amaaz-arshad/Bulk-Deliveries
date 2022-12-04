import * as React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import TDLSListing from '../../TDLSListing/TDLSListing';
import TDLSListingDecentre from '../../TDLSListing/TDLSListingDecentre';
import {DrawerContent} from './DrawerContent';
import Notification from '../../Notification/Notification';
import Search from '../../Search/Search';
import SearchDecentre from '../../Search/SearchDecentre';

const Drawer = createDrawerNavigator();

const DrawerNavigation = ({route}) => {
  //role for dec and sched
  const role = route.params.userData.LoginCategoryID;

  return (
    <Drawer.Navigator
      drawerStyle={{width: '80%'}}
      initialRouteName="TDLSListing"
      drawerContent={props => (
        <DrawerContent
          {...props}
          username={route.params.userData.UserName}
          role={role}
        />
      )}
      screenOptions={{
        swipeEnabled: true,
        headerShown: true,
        headerTitleAlign: 'center',
      }}>
      {role == 1 ? (
        <>
          <Drawer.Screen
            initialParams={route.params}
            name="TDLSListing"
            component={TDLSListing}
            options={{
              swipeEnabled: true,
              headerShown: true,
              headerTitle: 'Delivery List (TDLS)',
              headerTitleAlign: 'center',
            }}
          />

          <Drawer.Screen
            initialParams={route.params}
            name="Search"
            component={Search}
            options={{
              swipeEnabled: true,
              headerShown: true,
              headerTitle: 'Search TDLS',
              headerTitleAlign: 'center',
              headerStyle: {
                borderBottomWidth: 0.6,
                borderBottomColor: 'black',
              },
            }}
          />
        </>
      ) : (
        <>
          <Drawer.Screen
            initialParams={route.params}
            name="TDLSListingDecentre"
            component={TDLSListingDecentre}
            options={{
              swipeEnabled: true,
              headerShown: true,
              headerTitle: 'Delivery List (TDLS)',
              headerTitleAlign: 'center',
            }}
          />

          <Drawer.Screen
            initialParams={route.params}
            name="SearchDecentre"
            component={SearchDecentre}
            options={{
              swipeEnabled: true,
              headerShown: true,
              headerTitle: 'Search TDLS',
              headerTitleAlign: 'center',
              headerStyle: {
                borderBottomWidth: 0.6,
                borderBottomColor: 'black',
              },
            }}
          />
        </>
      )}
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;
