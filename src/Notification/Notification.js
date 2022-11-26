import React, { Component } from 'react';
import {
    StyleSheet, View, Text, TextInput, ImageBackground, Button,
    ScrollView, Image, TouchableNativeFeedback, FlatList, ToastAndroid, Alert
} from 'react-native';
import { Container, Header, Tab, Tabs, TabHeading, Icon } from 'native-base';
import NotificationItem from '../Notification/notifitem'


export default class Notification extends Component {

    notiData = [
        {
            id: "1",
            day: "Today",
            time: "12:20 PM",
            notification: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
        }, {
            id: "2",
            day: "Today",
            time: "12:20 PM",
            notification: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
        }, {
            id: "3",
            day: "Today",
            time: "12:20 PM",
            notification: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
        }, {
            id: "4",
            day: "Today",
            time: "12:20 PM",
            notification: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
        }, {
            id: "5",
            day: "Today",
            time: "12:20 PM",
            notification: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
        }, {
            id: "6",
            day: "Today",
            time: "12:20 PM",
            notification: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
        }, {
            id: "7",
            day: "Today",
            time: "12:20 PM",
            notification: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
        },
    ]

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={{flex:1, backgroundColor:'white'}}>
                {/* separator line */}
                <View
                    style={{
                        borderBottomColor: 'black',
                        borderBottomWidth: 0.5,
                    }}
                />

                {this.showFlatList(this.notiData)}
            </View>

        );
    }


    showFlatList = (notiData) => {
        return (
           
                <FlatList style={{marginTop:10 }}
                    data={notiData}
                    renderItem={({ item }) => (
                        <NotificationItem
                            day={item.day}
                            time={item.time}
                            notification={item.notification}
                            key={item.id}
                        />
                    )}
                    keyExtractor={item => item.id}
                    key={item => item.id}
                />
            
        )
    }

}
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#000000",
        marginTop: 100
    },

    editText: {
        width: "70%",
        height: 50,
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 8,
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

    activeTabTextStyle: {
        color: "#105a72",
        fontFamily: 'Raleway-Regular',
    },

    textStyle: {
        color: 'gray',
        fontFamily: 'Raleway-Regular',
    },
    mainTabView: {
        backgroundColor: '#1d1d27',
        height: 55
    },

    // tabStyle: {
    //     backgroundColor: "white"
    // }


});