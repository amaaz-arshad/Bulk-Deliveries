import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Modal,
    Image,
    ActivityIndicator,
    Text
} from 'react-native';
import colors from '../config/colors';

class Loader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: this.props.isLoading
        }
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            isLoading: nextProps.isLoading
        };
    }

    render() {
        return (
            <Modal
                transparent={true}
                animationType={'none'}
                visible={this.state.isLoading}
                style={{ zIndex: 1100 }}
                onRequestClose={() => { }}>
                <View style={styles.modalBackground}>
                    <View style={styles.activityIndicatorWrapper}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator size={30} animating={this.state.loading} color={colors.primary} />
                            <Text style={{marginStart:20}}>Loading...</Text>

                        </View>
                        {/* If you want to image set source here */}
                        {/* <Image
              source={require('../assets/images/loader.gif')}
              style={{ height: 80, width: 80 }}
              resizeMode="contain"
              resizeMethod="resize"
            /> */}
                    </View>
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: '#rgba(0, 0, 0, 0.5)',
        zIndex: 1000
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        height: 85,
        width: '50%',
        borderRadius: 3 ,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
    }
});

export default Loader