

import React, { Fragment, Component } from 'react';
import * as ImagePicker from "react-native-image-picker"

import SignatureCapture from 'react-native-signature-capture';

import Orientation from 'react-native-orientation';

/// yooooooo bro

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image,
  Button,
  Dimensions,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { colors } from '../config';
import { HeaderBackButton } from '@react-navigation/stack';
import { BackHandler } from 'react-native';


export default class IP extends Component {

  goBack(ress) {
    const { navigation } = this.props;
    
    this.props.route.params.onReceiveSignature(ress);
    
    this.props.navigation.goBack();
  }

  constructor(props) {
    super(props)
    this.state = {
      signatureUri: '',
      viewMode: 'landscape'
    }
  }

  componentDidMount() {
    // Orientation.lockToLandscape();
    BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
  }

  onBackButtonPressAndroid = () => {
    this.setState({ viewMode: 'portrait' })

  }
 
  saveSign() {
    this.refs["sign"].saveImage();
  }

  resetSign() {
    this.refs["sign"].resetImage();
  }

  _onSaveEventt(result) {
    //result.encoded - for the base64 encoded png
    //result.pathName - for the file path name

    this.goBack(result.encoded)
    this.setState({ viewMode: 'portrait' })
  }
  _onDragEvent() {
    // This callback will be called when the user enters signature 
  }


  render() {
    return (
      <View style={{ flex: 1, flexDirection: "column" }}>

        <View style={{ flex: 0.2, flexDirection: "row" }}>
          <TouchableOpacity style={[styles.buttonStyle, {backgroundColor:colors.lightGreen}]}
            onPress={() => { this.saveSign() }} >
            <Text>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.buttonStyle, {backgroundColor:colors.lightgrey}]}
            onPress={() => { this.resetSign() }} >
            <Text>Reset</Text>
          </TouchableOpacity>

        </View>

        <SignatureCapture
          style={[{ flex: 0.9 }, styles.signature]} ref="sign"
          onSaveEvent={res => this._onSaveEventt(res)}
          onDragEvent={this._onDragEvent}
          saveImageFileInExtStorage={false}
          showNativeButtons={false}
          showTitleLabel={false}
          backgroundColor="#ffffff"
          strokeColor="#000000"
          minStrokeWidth={4}
          maxStrokeWidth={4}
          viewMode={this.state.viewMode} />



      </View>
    );
  }
};

const styles = StyleSheet.create({

  body: {
    // flex:1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 1,
    // height: Dimensions.get('screen').height - 20,
    // width: Dimensions.get('screen').width

    width: '100%',
    height: '100%'
  },

  signature: {
    flex: 1,
    borderColor: '#000033',
    borderWidth: 1,
  },
  buttonStyle: {
    flex: 1, justifyContent: "center", alignItems: "center", 
    backgroundColor: "#eeeeee",
   }
});


