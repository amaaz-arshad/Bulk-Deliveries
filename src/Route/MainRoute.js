import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';

// import {createAppContainer} from 'react-navigation';
// import { NavigationContainer } from '@react-navigation/native';

import { Image, TouchableOpacity, ToastAndroid } from 'react-native'


import Splash from '../Splash/Splash'
import Login from '../Login/Login'
import TDLSListing from '../TDLSListing/TDLSListing'
import Notification from '../Notification/Notification'
import TDLSForm from '../TDLSForm/TDLSForm'
import IP from '../TDLSForm/ImagePicker'
import TDLSListingDecentre from '../TDLSListing/TDLSListingDecentre';
import TDLSFormDecentre from '../TDLSForm/TDLSFormDecentre';

import DrawerComp from './Drawer/DrawerStack';

const Stack = createStackNavigator();

const MainNavigation = (navigation) => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={
                    {
                        headerShown: true,
                        animationEnabled: true,
                        headerTitleAlign: 'center',
                    }
                }
                initialRouteName="Splash" >

                <Stack.Screen name="Splash" component={Splash}

                    options={
                        {
                            headerShown: false,
                            animationEnabled: true
                        }
                    }

                />
                <Stack.Screen name="Login" component={Login}
                    options={
                        {
                            headerShown: false,
                            animationEnabled: true
                        }
                    }
                />
                <Stack.Screen name="DrawerComp" component={DrawerComp}
                    options={
                        {
                            headerShown: false,
                            animationEnabled: true,
                        }
                    } />

                <Stack.Screen name="IP" component={IP} options={
                    {
                        headerShown: true,
                        animationEnabled: true,
                        headerTitle: 'Signature'
                    }
                } />

                <Stack.Screen name="TDLSForm" component={TDLSForm}
                    options={
                        {
                            headerShown: false,
                            animationEnabled: true,
                            headerTitle: 'Delivery Form (TDLS)',

                            headerRight: () =>
                                <TouchableOpacity>
                                    <Image
                                        source={require('../assets/print.png')
                                        } resizeMode="contain"
                                        style={{
                                            width: 25,
                                            height: 25,
                                            marginRight: 15
                                        }}

                                    /></TouchableOpacity>,
                        }
                    }
                />


                <Stack.Screen name="TDLSListingDecentre" component={TDLSListingDecentre}
                    options={
                        {
                            headerShown: true,
                            animationEnabled: true,
                            headerTitle: 'Delivery List (TDLS)',


                        }}
                />

                <Stack.Screen name="TDLSFormDecentre" component={TDLSFormDecentre}
                    options={
                        {
                            headerShown: false,
                            animationEnabled: true,
                            headerTitle: 'Delivery Form (TDLS)',

                            headerRight: () =>
                                <TouchableOpacity
                                    onPress={() => ToastAndroid.show("under development", ToastAndroid.SHORT)}
                                >
                                    <Image
                                        source={require('../assets/print.png')
                                        } resizeMode="contain"
                                        style={{
                                            width: 25,
                                            height: 25,
                                            marginRight: 15
                                        }}

                                    /></TouchableOpacity>,


                        }}
                />
                <Stack.Screen name="Notification" component={Notification} />


            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default MainNavigation;