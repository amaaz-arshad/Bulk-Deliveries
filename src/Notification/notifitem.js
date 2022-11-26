import React, { Component } from 'react';
import {
    StyleSheet, View, Text, TextInput, ImageBackground, Button,
    ScrollView, Image, TouchableNativeFeedback
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { colors } from '../config'
import { Card } from 'react-native-shadow-cards';


const NotificationItem = (props) => {

    return (
       
        <Card style={styles.container}>
            <View style={{ flexDirection: "column" }}>

                <View style={{ flexDirection: "row", justifyContent: "space-between", width: '100%' }}>
                
                        <Text style={{ color: colors.greyDark, fontSize: 15 }}>{props.day}</Text>
 
                    <View style={{ flexDirection: "row", alignItems: 'center' }}>
                        <Image
                            source={require('../assets/tdlslistitem/clock.png')}
                            resizeMode={'contain'}
                            style={{ width: 15, height: 15, marginEnd: 10 }} />

                        <Text style={{ color: colors.greyDark, fontSize: 15 }}>{props.time}</Text>

                    </View>
                   
                </View>

                

                {/* notif box */}
                <View style={{ flexDirection: "row", alignItems: 'center', marginTop: 8 }}>
                    <Image
                        source={require('../assets/bell.png')}
                        resizeMode={'contain'}
                        style={{ width: 40, height: 40, marginStart:10,marginEnd: 10 }} />

                    <Text style={{ flex: 1 ,color: colors.greyDark, fontSize: 15 }}>{props.notification}</Text>

                </View> 
            </View>

        </Card>


    );
}
export default NotificationItem;

const styles = StyleSheet.create({
    container: {  
        marginStart:18,
        marginEnd:15,
        marginBottom:10,
        marginTop:5,
        padding: 15, 
        justifyContent: "center"

    },
   
});