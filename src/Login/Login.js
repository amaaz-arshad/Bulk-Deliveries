import React, { Component } from 'react';
import {StyleSheet, View, Text, TextInput, Image,  StatusBar, ToastAndroid, Alert} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TouchableOpacity } from 'react-native-gesture-handler';
import axios from 'axios';
import { colors } from '../config'
import Loader from '../appComponent/Loader';
import { BASE_URL } from '../config/constant'
import { LoginAPI } from '../config/constant'
import * as NetInfo from "@react-native-community/netinfo"
import { BackHandler } from 'react-native';
import { openSettings } from 'react-native-permissions';



// https://stackoverflow.com/questions/50098376/pass-data-between-pages-in-react-native

export default class Login extends Component {

    constructor() {
        super();

        this.state = {
            userid: '',
            password: '',
            userData: [],
            isLoading: false
        }
    }
 
    componentDidMount(){
        BackHandler.addEventListener("hardwareBackPress", this.backPressDialog);
    }

    componentWillUnmount(){
        BackHandler.removeEventListener("hardwareBackPress", this.backPressDialog);
    }

    backPressDialog = () => {
        BackHandler.exitApp()
    };
    async setUser(user) {
        try {
            await AsyncStorage.setItem("userData", JSON.stringify(user));
        } catch (error) {
            ToastAndroid.show("Something went wrong", ToastAndroid.SHORT)
        }
    }


    loginAPI(userid, passwrd) {
        this.setState({ isLoading: true })

        axios.get(BASE_URL + LoginAPI,
            {
                params: {
                    Username: userid,
                    Password: passwrd
                }
            }).
            then(response => {
                if (response.data.ResultCode == 'S') {
                    this.setState({ userData: JSON.stringify(response.data) })

                    this.setUser(this.state.userData)

                    { this.props.navigation.replace('DrawerComp', { userData: response.data, screen:2}) }

                } else {
                    ToastAndroid.show(response.data.ResultStatus, ToastAndroid.SHORT)
                }

            })
            .catch(error => {
                console.error(error);
            }).finally(() => {
                this.setState({ isLoading: false })
            });
    }

    validate() {
        const userid = this.state.userid;
        const pass = this.state.password;

        if (userid.trim().length == 0) {
            ToastAndroid.show("Please enter User ID", ToastAndroid.SHORT)
            return;
        } else if (pass.length == 0) {
            ToastAndroid.show("Please enter password", ToastAndroid.SHORT)
            return;
        }

        NetInfo.fetch().then(networkState => {

            if (!networkState.isInternetReachable) {
                ToastAndroid.show("Please connect with internet", ToastAndroid.SHORT)
                return;
            }
        });

        { this.loginAPI(userid, pass) }
    }

    onChangeUserid = userid => {
        this.setState({ userid })
    }

    onChangePassword = password => {
        this.setState({ password })
    }

    render() { 
        return (

            <View style={styles.container}>

                <KeyboardAwareScrollView>
                    <StatusBar backgroundColor={colors.primary} />

                    <Loader isLoading={this.state.isLoading} />

                    <Image source={require('../assets/logo_design.jpg')} style={{
                        alignItems: 'center',
                        width: 100, height: 100, marginTop: 20
                    }} ></Image>


                    <View style={styles.viewStyle}>
                        <Text style={styles.textStyle}>Sign in to</Text>
                        <Text style={styles.textStyle} style={{ fontSize: 30 }}>Your Account</Text>
                    </View>

                    <View style={styles.loginEditextSection}>
                        <Text style={styles.textStyle}>Login</Text>

                        <TextInput style={styles.editText} placeholder="User ID*"
                            placeholderTextColor={colors.grey}
                            value={this.state.userid}
                            onChangeText={this.onChangeUserid}
                        ></TextInput>

                        <TextInput secureTextEntry={true} style={styles.editText} placeholder="Password*" placeholderTextColor={colors.grey}
                            value={this.state.password}
                            onChangeText={this.onChangePassword}
                        ></TextInput>
                    </View>

                    {/* Signin Button */}
                    <TouchableOpacity
                        onPress={() => this.validate()}
                        style={styles.buttonStyle}>
                        <Text style={{ color: 'white', fontSize: 16 }}>Sign In</Text>
                    </TouchableOpacity>

                </KeyboardAwareScrollView>


                <View style={styles.bottomText}>
                    <Text style={{
                        color: 'black',
                        textAlign: 'center',
                        alignSelf: 'center',
                        color: colors.grey2,
                        fontSize: 14
                    }}>Powered by Pakistan Oxygen Limited</Text>


                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
        flexDirection: 'column',

        backgroundColor: "#ffffff",
        paddingStart: 20,
        paddingEnd: 20,
        paddingTop: 20
    },

    viewStyle: {

        marginTop: 10,
        flex: 0.2,
    },

    editText: {
        width: "100%",
        height: 45,
        borderColor: '#000',
        borderWidth: 0.5,
        padding: 10,
        textShadowColor: "black",
        marginTop: 15,
        color: "black",

    },

    buttonStyle: {
        marginTop: 50,
        width: "100%",
        borderColor: colors.primary,
        borderRadius: 100,
        alignSelf: 'center',
        alignItems: 'center',
        padding: 10,
        backgroundColor: colors.primary
    },

    textStyle: {
        padding: 5,
        fontSize: 20,
        textShadowColor: "black",
        marginTop: 0,
        color: "black",
    },

    textStyleGray: {
        padding: 5,
        fontSize: 14,
        textShadowColor: "black",
        color: "gray",
    },

    loginEditextSection: {
        width: '100%',
        justifyContent: 'center',
        flex: 0.5,
        marginTop: 35
    },

    bottomText: {
        flex: 0.2,
        width: '100%',
        alignSelf: 'baseline',
        justifyContent: 'flex-end',
        marginBottom: 25
    }

});