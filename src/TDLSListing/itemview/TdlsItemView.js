import React, {Component} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {colors} from '../../config';
import {Card} from 'react-native-shadow-cards';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TDLSItemView = props => {
  return (
    <Card style={styles.container}>
      <View style={{flexDirection: 'column'}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
          }}>
          {/* starting tdls num */}
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={require('../../assets/tdlslistitem/clock.png')}
              resizeMode={'contain'}
              style={{width: 20, height: 20, marginEnd: 10}}
            />

            <Text style={{color: colors.primary, fontSize: 20}}>
              {props.tdlsNo}
            </Text>
          </View>
          {props.statusNo == 1 || props.statusNo == 3 ? null : (
            <TouchableOpacity onPress={props.print}>
              <Image
                source={require('../../assets/tdlslistitem/print.png')}
                resizeMode={'contain'}
                style={{width: 20, height: 20, marginEnd: 0}}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* dotted box */}
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 3}}>
          <Image
            source={require('../../assets/tdlslistitem/box.png')}
            resizeMode={'contain'}
            style={{width: 15, height: 15, marginEnd: 15}}
          />

          <Text style={styles.allTextStyle}>{props.bttrNo}</Text>
        </View>

        {/* location */}
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 3}}>
          <Image
            source={require('../../assets/tdlslistitem/location.png')}
            resizeMode={'contain'}
            style={{width: 15, height: 15, marginEnd: 15}}
          />

          <Text style={[styles.allTextStyle, {marginEnd: 15}]}>
            {props.location}
          </Text>
        </View>

        {/* tanker */}
        {props.tankerName ? (
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 3}}>
            <Icon
              name="tanker-truck"
              size={18}
              color="rgb(83, 83, 83)"
              style={{marginRight: 12}}
            />
            <Text style={[styles.allTextStyle, {marginEnd: 15}]}>
              {props.tankerName}
            </Text>
          </View>
        ) : null}

        {/* Product */}
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 3}}>
          <Image
            source={require('../../assets/tdlslistitem/gas.png')}
            resizeMode={'contain'}
            style={{width: 15, height: 15, marginEnd: 15}}
          />

          <Text style={styles.allTextStyle}>{props.product}</Text>
        </View>

        {/* separator line */}
        <View
          style={{
            borderBottomColor: 'black',
            borderBottomWidth: 0.5,
            marginBottom: 10,
            marginTop: 10,
          }}
        />
      </View>

      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        {/* Status */}
        <View>
          <Text style={{color: colors.grey}}>Status</Text>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 10,
              alignItems: 'center',
            }}>
            <Text style={{fontSize: 13}}>Schedule Action: {props.status}</Text>
          </View>
        </View>

        {/* Open tdls button */}
        <TouchableOpacity onPress={props.openTdlsBtnClick}>
          <Image
            source={require('../../assets/tdlslistitem/opentdls.png')}
            resizeMode={'contain'}
            style={{width: 125, marginTop: 10}}
            onPress={props.openTdlsBtnClick}
          />
        </TouchableOpacity>
      </View>
    </Card>
  );
};
export default TDLSItemView;

const styles = StyleSheet.create({
  container: {
    marginStart: 18,
    marginTop: 5,
    marginBottom: 10,
    padding: 15,
    justifyContent: 'center',
  },

  button: {
    marginTop: 30,
    width: '30%',
    borderColor: 'blue',
    borderWidth: 1,
    borderRadius: 8,
    elevation: 1,
  },

  allTextStyle: {
    color: colors.black,
    fontSize: 16,
  },
});
