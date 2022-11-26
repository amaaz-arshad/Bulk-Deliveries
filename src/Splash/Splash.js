import React, { Component } from 'react';
import { StyleSheet, View, StatusBar, Image, ImageBackground, SafeAreaView } from 'react-native';
import { colors } from '../config'
import AsyncStorage from '@react-native-community/async-storage';


export default class Splash extends Component {

  componentDidMount() {

    let data = {}
    let response = {}

    data = this.getUser()

    setTimeout(() => {

      response = JSON.parse(data._W)

      if (response != null) {
        { this.props.navigation.replace('DrawerComp', { userData: JSON.parse(response), screen: 1 }) }
      } else {
        this.props.navigation.replace('Login')
      }

    }, 2500);
  }

  getUser = async () => {
    try {
      const value = await AsyncStorage.getItem('userData');
      if (value !== null) {
        //console.log('getListingData: ', value);
      }
      return value;
    } catch (error) {
      console.log("Something went wrong", error);
    }
  };


  render() {

    return (

      <SafeAreaView style={styles.container}>

        <StatusBar backgroundColor={colors.primary} />

        <ImageBackground resizeMode={'stretch'} source={require('../assets/splash_bg.jpg')}
          style={styles.bgImg}>

          <Image style={{ width: 150, height: 110, marginTop: 150 }} source={require('../assets/logo.png')} ></Image>

        </ImageBackground>


      </SafeAreaView>


    );

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#b2b2b2",
  },

  textStyle: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    fontSize: 20,
    height: 50,
    padding: 10,
    textShadowColor: "black",
    marginTop: 30,
    color: "black",
  },

  button: {
    marginTop: 30,
    width: "30%",
    borderColor: "blue",
    borderWidth: 1,
    borderRadius: 8,
    elevation: 1
  },

  scroll: {
    flex: 1,
    height: "100%",
    width: "100%",
  },

  tocenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bgImg: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    flex: 1,

  }
});