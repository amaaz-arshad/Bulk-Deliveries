import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  ToastAndroid,
  Platform,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as NetInfo from '@react-native-community/netinfo';
import * as ImagePicker from 'react-native-image-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {colors} from '../config';
import Loader from '../appComponent/Loader';
import axios from 'axios';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import ImageResizer from 'react-native-image-resizer';
import AsyncStorage from '@react-native-community/async-storage';
import Orientation from 'react-native-orientation';
import {
  BluetoothManager,
  BluetoothEscposPrinter,
  BluetoothTscPrinter,
} from 'react-native-bluetooth-escpos-printer';
import {Modal} from 'react-native-paper';
import {FlatList} from 'react-native-gesture-handler';
import RNFS from 'react-native-fs';
import RadioButtonRN from 'radio-buttons-react-native';
import {Container} from 'native-base';
import ToastExample from '../config/ToastExample';
import {openSettings} from 'react-native-permissions';

import {BASE_URL} from '../config/constant';
import {getRemarksMaster} from '../config/constant';
import {setDelivery} from '../config/constant';
import {getAttachment} from '../config/constant';
import {convertDateString} from '../appComponent/DateConversion';

export default class TDLSForm extends Component {
  componentWillUnmount() {
    clearTimeout(this.typingTimer);
  }

  constructor(props) {
    super(props);

    this.state = {
      hideSubmitBtn: false,
      preFilledRemarks: [],
      imageType: 0, //for knowing  if image or sign is pressed or not
      selectedItems: '',
      prefilledImage: '',
      preFilledModalShow: false,
      woosimAddress: {},
      foundDevices: [],
      modalVisible: false,
      resourcePath: {},
      radioType: '',
      unit_tanker_level_start: '',
      unit_tanker_level_end: '',
      unit_content_data: '',
      response: this.props.route.params.userData,
      isLoading: false,
      imageToShow: '',
      fileUri:
        this.props.route.params.userData.Image.length > 100
          ? this.props.route.params.userData.Image
          : '',
      signatureUri:
        this.props.route.params.userData.Signature.length > 100
          ? this.props.route.params.userData.Signature
          : '',
      remarksData: [],

      odometerIn: this.props.route.params.userData.odometerin,
      odometerOut: this.props.route.params.userData.odometerout,
      Vie_Press_Start: this.props.route.params.userData.vie_press_start,
      Vie_Press_Start_Unit:
        this.props.route.params.userData.vie_press_start_unit == (null || '')
          ? 'PSI'
          : this.props.route.params.userData.vie_press_start_unit,
      Vie_Level_Start: this.props.route.params.userData.vie_level_start,
      Vie_Level_Start_Unit:
        this.props.route.params.userData.vie_level_start_unit == (null || '')
          ? 'INCH'
          : this.props.route.params.userData.vie_level_start_unit,
      Tanker_Press_Start: this.props.route.params.userData.tanker_press_start,
      Tanker_Press_Start_Unit:
        this.props.route.params.userData.tanker_press_start_unit,
      Tanker_Level_Start: this.props.route.params.userData.tanker_level_start,
      Tanker_Level_Start_Unit:
        this.props.route.params.userData.tanker_level_start_unit == null
          ? 'M3'
          : this.props.route.params.userData.tanker_level_start_unit,
      Vie_Press_End: this.props.route.params.userData.vie_press_end,
      Vie_Press_End_Unit: this.props.route.params.userData.vie_press_end_unit,
      Vie_Level_End: this.props.route.params.userData.vie_level_end,
      Vie_Level_End_Unit: this.props.route.params.userData.vie_level_end_unit,
      Tanker_Press_End: this.props.route.params.userData.tanker_press_end,
      Tanker_Press_End_Unit:
        this.props.route.params.userData.tanker_press_end_unit == (null || '')
          ? 'PSI'
          : this.props.route.params.userData.tanker_press_end_unit,
      Tanker_Press_Diff: this.props.route.params.userData.tanker_press_diff,
      Tanker_Level_End: this.props.route.params.userData.tanker_level_end,
      Tanker_Level_End_Unit:
        this.props.route.params.userData.tanker_level_end_unit,
      Tanker_Level_Diff: this.props.route.params.userData.tanker_level_diff,
      Content_Start: this.props.route.params.userData.tanker_content_start,
      Content_Start_Unit: this.props.route.params.userData.content_start_unit,
      Content_End: this.props.route.params.userData.tanker_content_end,
      Content_End_Unit: this.props.route.params.userData.content_end_unit,
      Content_Diff: this.props.route.params.userData.tanker_content_diff,
      Content_Diff_Unit:
        this.props.route.params.userData.uom == null
          ? 'M3'
          : this.props.route.params.userData.uom,
      Remarks: this.props.route.params.userData.remarks,
      Additional_Remarks: this.props.route.params.userData.Additional_Remarks,
      SupplyDate: this.props.route.params.userData.SupplyDate,
      Trip_Status: this.props.route.params.userData.Trip_Status, // 6 approve 4 reject
      Trip_Reason: this.props.route.params.userData.StatusReason,
      StatusReason: this.props.route.params.userData.StatusReason,
      Weighbridge_No: '',
      Time_In: this.props.route.params.userData.timein,
      Time_Out: this.props.route.params.userData.timeout,
      Date_In: this.props.route.params.userData.datein,
      Date_Out: this.props.route.params.userData.dateout,
      Latitude_In: this.props.route.params.userData.latitude_in,
      Latitude_Out: this.props.route.params.userData.latitude_out,
      Longitude_In: this.props.route.params.userData.longitude_in,
      Longitude_Out: this.props.route.params.userData.longitude_out,
      RemarksList: [],
      selectedRemarks: [],

      hasLocationPermission: false,
      currentPositionData: {},
      remarksArray: this.props.route.params.userData.remarksArray
        ? this.props.route.params.userData.remarksArray
        : [],
      Trip_StatusDec: this.props.route.params.userData.Trip_StatusDec,

      ScheduledDate: this.props.route.params.userData.ScheduledDate,
      PrimaryProduct: this.props.route.params.userData.PrimaryProduct,
      DecanterName: this.props.route.params.userData.DecanterName,
      DriverName: this.props.route.params.userData.DriverName,
      datein: this.props.route.params.userData.datein,
    };
  }

  componentDidMount() {
    this.camPermission();

    this.focusListener = this.props.navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
    });

    console.log('userdata: ', this.props.route.params.userData);
    this.getRemarksMaster();

    setTimeout(() => {
      if (this.props.route.params.userData.uom) {
        console.log(this.props.route.params.userData.uom);
        this.setState({
          Content_Diff_Unit: this.props.route.params.userData.uom,
        });
      } else {
        this.setState({Content_Diff_Unit: 'M3'});
        console.log(this.state.Content_Diff_Unit);
      }
    }, 2000);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      if (nextProps.route.params.isPrint) {
        this.bluetoothWorkForPrinter();
      }
    }
  }

  componentDidUpdate() {
    Orientation.lockToPortrait();
  }

  connectBlueDevices(address) {
    BluetoothManager.connect(address) // the device address scanned.
      .then(
        s => {
          this.setState({modalVisible: false, isLoading: false});
          console.log('rowData.address: ', s);

          let columnWidths = [30];

          BluetoothEscposPrinter.printColumn(
            columnWidths,
            [BluetoothEscposPrinter.ALIGN.CENTER],
            ['Pakistan Oxygen Limited'],
            {},
          );

          BluetoothEscposPrinter.printText(
            '________________________________________________' +
              '\n' +
              'TDLS#               ' +
              this.state.response.TDLS_No +
              '\n' +
              'Date                ' +
              this.state.response.ScheduledDate +
              '\n' +
              'Customer #          ' +
              this.state.response.CustomerNo +
              '\n' +
              'Name                ' +
              this.state.response.CustomerName +
              '\n' +
              'Product code        ' +
              this.state.response.PrimaryProduct +
              '\n' +
              'Description         ' +
              this.state.response.ProductName +
              '\n' +
              'Tanker #            ' +
              this.state.response.vehicleno +
              '\n' +
              'Decanter Name       ' +
              this.state.response.DecanterName +
              '\n' +
              'Driver Name         ' +
              this.state.response.DriverName +
              '\n' +
              'Date & Time In      ' +
              this.state.Date_In +
              '\n' +
              'Odometer In         ' +
              this.state.odometerIn +
              '\n' +
              'Date & Time Out     ' +
              this.state.Date_Out +
              '\n' +
              'Odometer Out        ' +
              this.state.odometerOut +
              '\n' +
              'Delivery in         ' +
              this.state.CalculationBaseType +
              '\n' +
              '________________________________________________' +
              '\n\n',
            {},
          );

          BluetoothEscposPrinter.printColumn(
            [20, 9, 9, 9],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
            ],
            ['VIE Data', 'Start', 'End', 'Unit'],
            {},
          );

          BluetoothEscposPrinter.printText(
            '________________________________________________' + '\n',

            {},
          );

          BluetoothEscposPrinter.printColumn(
            [20, 9, 9, 9],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
            ],
            [
              'Pressure',
              this.state.Vie_Press_Start + '',
              this.state.Vie_Press_End + '',
              this.state.Vie_Press_End_Unit + '',
            ],
            {},
          );

          BluetoothEscposPrinter.printColumn(
            [20, 9, 9, 9],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
            ],
            [
              'Level',
              this.state.Vie_Level_Start + '',
              this.state.Vie_Level_End + '',
              this.state.Vie_Level_End_Unit + '',
            ],
            {},
          );

          BluetoothEscposPrinter.printColumn(
            [20, 9, 9, 9],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
            ],
            ['Content', '', '', ''],
            {},
          );

          BluetoothEscposPrinter.printText(
            '________________________________________________' + '\n\n',

            {},
          );

          BluetoothEscposPrinter.printColumn(
            [20, 9, 9, 9],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
            ],
            ['Tanker Data', 'Start', 'End', 'Unit'],
            {},
          );

          BluetoothEscposPrinter.printText(
            '________________________________________________' + '\n',

            {},
          );

          BluetoothEscposPrinter.printColumn(
            [20, 9, 9, 9],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
            ],
            [
              'Pressure',
              this.state.Tanker_Press_Start + '',
              this.state.Tanker_Press_End + '',
              this.state.Tanker_Press_End_Unit + '',
            ],
            {},
          );

          BluetoothEscposPrinter.printColumn(
            [20, 9, 9, 9],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
            ],
            [
              'Level',
              this.state.Tanker_Level_Start + '',
              this.state.Tanker_Level_End + '',
              this.state.Tanker_Level_End_Unit + '',
            ],
            {},
          );

          BluetoothEscposPrinter.printColumn(
            [20, 9, 9, 9],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
            ],
            [
              'Content',
              this.state.response.tanker_content_start + '',
              this.state.response.tanker_content_end + '',
              this.state.Content_Start_Unit + '',
            ],
            {},
          );

          BluetoothEscposPrinter.printText(
            '________________________________________________' + '\n',

            {},
          );

          BluetoothEscposPrinter.printColumn(
            [20, 9, 9, 9],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
            ],
            ['Weight', '', '', ''],
            {},
          );

          BluetoothEscposPrinter.printText(
            'Delivered Volume    ' +
              this.state.response.tanker_content_diff +
              '\n' +
              'Delivered Unit      ' +
              this.state.Content_Diff_Unit +
              '\n' +
              'Comments:           ' +
              this.state.remarks +
              '\n' +
              'Customer Signature: ' +
              '' +
              '\n' +
              'Printed by:         ' +
              this.props.route.params.loginId +
              '\n' +
              'Print date:         ' +
              this.state.Date_Out +
              '\n' +
              'Device id :         ' +
              'WOOSIM' +
              '\n' +
              'Call on:            ' +
              '+92.21.111-262725' +
              '\n' +
              'Website: www.pakoxygen.com' +
              '\n' +
              '**If you want to keep a permanent record, please have a photocopy made**' +
              '\n\n\n\n\n\n',
            {},
          );
        },
        e => {
          this.setState({isLoading: false});
          alert(e);
        },
      );
  }

  scanBlueDevices() {
    this.setState({isLoading: true});

    BluetoothManager.scanDevices().then(
      s => {
        var ss = JSON.parse(s); //JSON string

        let resp = {};

        setTimeout(() => {
          resp = JSON.parse(s);

          this.setState({foundDevices: []});

          for (var i = 0; i < resp.paired.length; i++) {
            if (resp.paired[i].name == 'WOOSIM') {
              this.state.foundDevices.push({
                name: resp.paired[i].name + ' (Paired)',
                address: resp.paired[i].address,
              });
            }
          }

          for (var i = 0; i < resp.found.length; i++) {
            this.state.foundDevices.push({
              name: resp.found[i].name,
              address: resp.found[i].address,
            });
          }
          this.setState({isLoading: false, modalVisible: true});
        }, 100);
      },
      er => {
        this.setState({isLoading: false});
        alert('error' + JSON.stringify(er));
      },
    );
  }

  async permision() {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]).then(result => {
        if (
          result['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          this.cameraLaunch();
        } else {
          this.permision();
        }
      });
    } catch (err) {
      console.warn(err);
    }
  }

  async camPermission() {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]).then(result => {
        if (
          !(
            result['android.permission.CAMERA'] ===
            PermissionsAndroid.RESULTS.GRANTED
          )
        ) {
          if (result['android.permission.CAMERA'] === 'never_ask_again') {
            this.openAppSetting();
          } else {
            this.camPermission();
          }
        }
      });
    } catch (err) {
      console.warn(err);
    }
  }
  openAppSetting() {
    Alert.alert(
      'Alert',
      'Please enable required permission from app setting',
      [
        {
          text: 'OK',
          onPress: () => {
            this.props.navigation.goBack();
            openSettings();
          },
        },
      ],
      {
        cancelable: false,
      },
    );
  }

  print() {
    let viePressUnit = this.state.Vie_Press_Start_Unit + '\n';
    let vieLevelUnit =
      this.state.Vie_Level_Start_Unit +
      '\n' +
      '------------------------------------------------' +
      '\n';
    let tankerPressUnit = this.state.Tanker_Press_End_Unit + '\n';
    let tankerLevelUnit = this.state.Tanker_Level_End_Unit + '\n';
    let contentUnit =
      this.state.Content_Start_Unit +
      '\n' +
      '------------------------------------------------' +
      '\n';
    let bttrno = this.state.response.BTTR_No + '\n';
    let tdlsno = this.state.response.TDLS_No + '\n';
    let scheduledate = this.state.response.ScheduledDate + '\n';
    let customerno = this.state.response.CustomerNo + '\n';
    let customername = this.state.response.CustomerName + '\n';
    let primaryproduct = this.state.response.PrimaryProduct + '\n';
    let vie = this.state.response.TankerShortName + '\n';
    let productname = this.state.response.ProductName + '\n';
    let vehiclenum = this.state.response.vehicleno + '\n';
    let decantername = this.state.response.DecanterName + '\n';
    let drivername = this.state.response.DriverName + '\n';
    // let timein =
    //   this.state.response.Trip_Status == 1 ||
    //   this.state.response.Trip_Status == 3
    //     ? convertDateString(this.state.Date_In)
    //     : convertDateString(this.state.response.datein);
    let timein = convertDateString(
      this.state.response.datein,
      this.state.response.timein,
    );
    let inodometer = this.state.odometerIn + '\n';
    // let timeout =
    //   this.state.response.Trip_Status == 1 ||
    //   this.state.response.Trip_Status == 3
    //     ? '\n'
    //     : convertDateString(this.state.response.dateout);
    let timeout = convertDateString(
      this.state.response.dateout,
      this.state.response.timeout,
    );
    let outodometer =
      this.state.odometerOut +
      '\n' +
      '------------------------------------------------' +
      '\n';
    let chk = this.state.response.CalculationBaseType.toString();

    let diff = this.state.Content_Start - this.state.Content_End;
    let netweight = this.state.radioType == 1 ? '\n' : diff + '' + ' KG' + '\n';

    // let netweight =
    //     this.state.response.CalculationBaseTypeID == 1
    //         ? '\n'
    //         : diff + "" +
    //         ' KG' +
    //         '\n';

    // let netweight =
    //     this.state.response.CalculationBaseTypeID == 1
    //         ? '\n'
    //         : this.state.Content_Diff + "" +
    //         ' KG' +
    //         '\n';

    let deliveredvolume = this.state.Content_Diff + '' + ' M3' + '\n';
    let comments = this.state.Additional_Remarks
      ? this.state.Additional_Remarks
      : '\n';

    console.log('timein:', timein);
    console.log('timeout:', timeout);
    console.log(viePressUnit);
    console.log(vieLevelUnit);
    console.log(tankerPressUnit);
    console.log(tankerLevelUnit);
    console.log(contentUnit);
    console.log('bttrno:', bttrno);
    console.log(tdlsno);
    console.log('vie:', vie);
    console.log('diff: ', diff);
    console.log('net weight: ', netweight);
    console.log('deliveredvolume: ', deliveredvolume);
    console.log('sign: ', this.state.signatureUri);
    console.log(
      'CalculationBaseType: ',
      this.state.response.CalculationBaseType,
    );
    console.log(
      'CalculationBaseType id: ',
      this.state.response.CalculationBaseTypeID,
    );
    console.log(
      'CalculationBaseType id: ',
      this.props.route.params.userData.CalculationBaseTypeID,
    );
    console.log('radio type: ', this.state.radioType);

    ToastExample.show(
      this.state.Vie_Press_Start + '',
      this.state.Vie_Press_End + '',
      viePressUnit,
      this.state.Vie_Level_Start + '',
      this.state.Vie_Level_End + '',
      vieLevelUnit,
      this.state.Tanker_Press_Start + '',
      this.state.Tanker_Press_End + '',
      tankerPressUnit,
      this.state.Tanker_Level_Start + '',
      this.state.Tanker_Level_End + '',
      tankerLevelUnit,
      this.state.Content_Start + '',
      this.state.Content_End + '',
      contentUnit,
      bttrno,
      tdlsno,
      scheduledate,
      customername,
      customerno,
      vie,
      primaryproduct,
      productname,
      vehiclenum,
      decantername,
      drivername,
      timein,
      timeout,
      inodometer,
      outodometer,
      chk,
      netweight,
      deliveredvolume,
      comments,
      this.state.signatureUri,
      err => {
        alert(err);
      },
      message => {
        alert(message);
      },
    );
  }

  bluetoothWorkForPrinter() {
    BluetoothManager.enableBluetooth().then(
      r => {
        this.print();
      },
      err => {
        alert(err);
      },
    );
  }

  onReceiveSignature = signatureUri => {
    setTimeout(() => {
      this.setState({signatureUri: signatureUri});
    }, 100);
  };

  submitDialog = () => {
    Alert.alert('Please Confirm', 'Are you sure you want submit the form?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {
        text: 'YES',
        onPress: () => {
          this.submitForm();
        },
      },
    ]);
    return true;
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  selectFile = () => {
    var options = {
      title: 'Select Image',
      customButtons: [
        {
          name: 'customOptionKey',
          title: 'Choose file from Custom Option',
        },
      ],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
  };

  // Launch Camera
  cameraLaunch = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      maxWidth: 500,
      maxHeight: 500,
      quality: 1,
    };
    ImagePicker.launchCamera(options, res => {
      console.log('Response = ', res);

      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton);
        alert(res.customButton);
      } else {
        const source = {uri: res.uri};
        this.setState({imageToShow: res.assets[0].uri});

        if (res.assets[0].fileSize > 50000) {
          RNFS.readFile(res.assets[0].uri, 'base64').then(res => {
            this.handleBase64('data:image/jpeg,' + res);
          });
        } else {
          RNFS.readFile(res.assets[0].uri, 'base64').then(res => {
            this.setState({fileUri: res});
          });
        }
      }
    });
  };

  handleBase64 = async path => {
    const resizedImageUrl = await ImageResizer.createResizedImage(
      path,
      1200,
      800,
      'JPEG',
      50,
      0,
      RNFS.DocumentDirectoryPath,
    );
    const base64 = await RNFS.readFile(resizedImageUrl.uri, 'base64');
    this.setState({fileUri: base64});

    return base64;
  };

  onRadioBtnSelected(selectedVal) {
    if (selectedVal == 1) {
      this.setState({
        unit_tanker_level_start: 'M3',
        unit_tanker_level_end: 'M3',
        unit_content_data: 'M3',
        Content_Diff_Unit: 'M3',
      });
    } else {
      this.setState({
        unit_tanker_level_start: 'KG',
        unit_tanker_level_end: 'KG',
        unit_content_data: 'KG',
        Content_Diff_Unit: 'KG',
      });
    }
  }

  remarksID = '';
  remarksArray = '';

  onSelectedItemsChange = selectedItems => {
    this.setState({selectedItems});

    this.setState({preFilledRemarks: selectedItems});

    this.remarksID = selectedItems + '';
    this.setState({remarksArray: selectedItems});
    this.remarksArray = selectedItems;
  };

  onSelectedItemsChange_old = selectedItems => {
    setTimeout(() => {
      var aa = selectedItems + '';
      var newStr = aa.replace(/,/g, '');
      this.setState({selectedItems: newStr});
      this.setState({selectedRemarks: selectedItems});
    }, 200);
  };

  getAttachmentForPrint() {
    this.setState({isLoading: true});
    axios
      .get(BASE_URL + getAttachment, {
        params: {
          TripNo: this.state.response.TDLS_No, //tdls
          AttachmentType: 2,
        },
      })
      .then(response => {
        this.setState({signatureUri: response.data});
        this.bluetoothWorkForPrinter();
      })
      .catch(error => {
        this.setState({signatureUri: ''});

        ToastAndroid.show(
          'Connect your internet to print signature',
          ToastAndroid.SHORT,
        );

        this.bluetoothWorkForPrinter();

        console.error(error);

        this.setState({isLoading: false});
      })
      .finally(() => {
        this.setState({isLoading: false});
      });
  }

  getAttachment(AttachmentType) {
    this.setState({isLoading: true});
    axios
      .get(BASE_URL + getAttachment, {
        params: {
          TripNo: this.state.response.TDLS_No, //tdls
          AttachmentType: AttachmentType,
        },
      })
      .then(response => {
        this.setState({
          prefilledImage: response.data,
          preFilledModalShow: true,
        });
        if (AttachmentType == 1) {
          this.setState({
            prefilledImage:
              this.state.fileUri.length > 100
                ? this.state.fileUri
                : response.data,
          });
        } else {
          this.setState({
            prefilledImage:
              this.state.signatureUri.length > 100
                ? this.state.signatureUri
                : response.data,
          });
          this.setState({signatureUri: this.state.prefilledImage});
        }
      })
      .catch(error => {
        if (AttachmentType == 1)
          this.setState({
            prefilledImage: this.state.fileUri ? this.state.fileUri : '',
          });
        else
          this.setState({
            prefilledImage: this.state.signatureUri
              ? this.state.signatureUri
              : '',
          });

        this.setState({preFilledModalShow: true});
        console.error(error);
        this.setState({isLoading: false});
      })
      .finally(() => {
        this.setState({isLoading: false});
      });
  }

  getRemarksData = async () => {
    try {
      const value = await AsyncStorage.getItem('remarksData');
      if (value !== null) {
      }
      return value;
    } catch (error) {
      console.log('Something went wrong', error);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    }
  };

  getRemarksMaster() {
    let data = this.props.route.params.userData.TDLSRemarks;

    if (data == null) {
      let remarks = this.state.remarksArray;

      if (remarks) {
        for (var i = 0; i < remarks.length; i++) {
          this.state.preFilledRemarks.push(remarks[i]);
        }
      }
    }

    if (data != [] && data != null) {
      for (var i = 0; i < data.length; i++) {
        this.state.preFilledRemarks.push(data[i].RemarksMasterID);

        this.state.remarksArray.push(data[i].RemarksMasterID);
      }
    }

    {
      let data = {};
      let response = [];

      data = this.getRemarksData();

      setTimeout(() => {
        response = JSON.parse(data._W);
        this.remarksWork(response);
      }, 300);

      return;
    }

    return;

    this.setState({isLoading: true});
    axios
      .get(BASE_URL + getRemarksMaster)
      .then(response => {
        console.log('ddd: ', response.data);
        if (!response.data.length > 0) {
          ToastAndroid.show('No Remarks Data Found', ToastAndroid.SHORT);
          return;
        }

        for (var i = 0; i < response.data.length; i++) {
          if (this.state.response.Trip_Status == 5) {
            this.state.remarksData.push({
              name: response.data[i].Remarks,
              id: response.data[i].RemarksMasterID,
            });
          } else {
            this.state.remarksData.push({
              name: response.data[i].Remarks,
              id: response.data[i].RemarksMasterID,
              disabled: true, // disabled when viewing from approve and reject
            });
          }
        }

        this.setState({selectedItems: this.state.remarksData});
      })
      .catch(error => {
        console.error(error);
        this.setState({isLoading: false});
      })
      .finally(() => {
        this.setState({isLoading: false});
      });
  }

  remarksWork(response) {
    for (var i = 0; i < response.length; i++) {
      if (this.state.response.Trip_Status == 5) {
        this.state.remarksData.push({
          name: response[i].Remarks,
          id: response[i].RemarksMasterID,
        });
      } else {
        this.state.remarksData.push({
          name: response[i].Remarks,
          id: response[i].RemarksMasterID,
          disabled: true, // disabled when viewing from approve and reject
        });
      }
    }

    this.setState({selectedItems: this.state.remarksData});
  }

  removeMultiDotExceptfirst(input) {
    var index = input.indexOf('.');

    if (index > -1) {
      input =
        input.substr(0, index + 1) + input.slice(index).replace(/\./g, '');
    }

    const val = input;
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      // if (val) {
      //    this.setState({ odometerIn: input })
      // }
    }, 500);

    return input;
  }

  checkValidation(text) {
    var decimalValue = 0;
    var minusValue = 0;
    var commaValue = 0;

    if (text == null) {
      return true;
    }

    for (var i = 0; i < text.length; i++) {
      if (text[i] == '.') {
        decimalValue += 1;
      }

      if (text[i] == ',') {
        commaValue += 1;
      }

      if (text[i] == '-') {
        minusValue += 1;
      }
    }

    if (decimalValue > 1 || commaValue > 0 || minusValue > 0) {
      return false;
    }

    return true;
  }

  validate() {
    const oIn = this.state.odometerIn;
    console.log('odoin: ', this.state.odometerIn);

    if (oIn < 0 || oIn == null || oIn === '') {
      ToastAndroid.show('Please enter odometer in value', ToastAndroid.SHORT);
      return '';
    }

    if (
      this.state.odometerOut == null ||
      !(this.state.odometerOut >= 0) ||
      this.state.odometerOut === ''
    ) {
      ToastAndroid.show('Please enter odometer out value', ToastAndroid.SHORT);
      return '';
    }

    if (
      this.state.Vie_Press_Start == null ||
      !(this.state.Vie_Press_Start >= 0) ||
      this.state.Vie_Press_Start === ''
    ) {
      ToastAndroid.show(
        'Please enter VIE Pressure Start value',
        ToastAndroid.SHORT,
      );
      return '';
    }

    if (
      this.state.Vie_Level_Start == null ||
      !(this.state.Vie_Level_Start >= 0) ||
      this.state.Vie_Level_Start === ''
    ) {
      ToastAndroid.show(
        'Please enter VIE Level Start value',
        ToastAndroid.SHORT,
      );
      return '';
    }

    if (
      this.state.Tanker_Press_Start == null ||
      !(this.state.Tanker_Press_Start >= 0) ||
      this.state.Tanker_Press_Start === ''
    ) {
      ToastAndroid.show(
        'Please enter Tanker Pressure Start value',
        ToastAndroid.SHORT,
      );
      return '';
    }

    if (
      this.state.Tanker_Level_Start == null ||
      !(this.state.Tanker_Level_Start >= 0) ||
      this.state.Tanker_Level_Start === ''
    ) {
      ToastAndroid.show(
        'Please enter Tanker Level Start value',
        ToastAndroid.SHORT,
      );
      return '';
    }

    if (
      this.state.Vie_Press_End == null ||
      !(this.state.Vie_Press_End >= 0) ||
      this.state.Vie_Press_End === ''
    ) {
      ToastAndroid.show(
        'Please enter VIE Pressure End value',
        ToastAndroid.SHORT,
      );
      return '';
    }

    if (
      this.state.Vie_Level_End == null ||
      !(this.state.Vie_Level_End >= 0) ||
      this.state.Vie_Level_End === ''
    ) {
      ToastAndroid.show('Please enter VIE Level End value', ToastAndroid.SHORT);
      return '';
    }

    if (
      this.state.Tanker_Press_End == null ||
      !(this.state.Tanker_Press_End >= 0) ||
      this.state.Tanker_Press_End === ''
    ) {
      ToastAndroid.show(
        'Please enter Tanker Pressure End value',
        ToastAndroid.SHORT,
      );
      return '';
    }

    if (
      this.state.Tanker_Level_End == null ||
      !(this.state.Tanker_Level_End >= 0) ||
      this.state.Tanker_Level_End === ''
    ) {
      ToastAndroid.show(
        'Please enter Tanker Level End value',
        ToastAndroid.SHORT,
      );
      return '';
    }

    if (
      this.state.Content_Start == null ||
      !(this.state.Content_Start >= 0) ||
      this.state.Content_Start === ''
    ) {
      ToastAndroid.show('Please enter Start Content value', ToastAndroid.SHORT);
      return '';
    }

    if (
      this.state.Content_End == null ||
      !(this.state.Content_End >= 0) ||
      this.state.Content_End === ''
    ) {
      ToastAndroid.show('Please enter End Content value', ToastAndroid.SHORT);
      return '';
    }

    if (
      this.state.Content_Diff == null ||
      !(this.state.Content_Diff >= 0) ||
      this.state.Content_Diff === ''
    ) {
      ToastAndroid.show(
        'Please enter content difference value',
        ToastAndroid.SHORT,
      );
      return '';
    }
    if (this.state.Trip_Status == 5) {
      ToastAndroid.show(
        'Please approve or reject the form',
        ToastAndroid.SHORT,
      );
      return '';
    }

    if (!this.checkValidation(this.state.odometerIn)) {
      ToastAndroid.show(
        'Please enter valid odometer in value',
        ToastAndroid.SHORT,
      );
      return '';
    }
    if (!this.checkValidation(this.state.odometerOut)) {
      ToastAndroid.show(
        'Please enter valid odometer out value',
        ToastAndroid.SHORT,
      );
      return '';
    }
    if (!this.checkValidation(this.state.Vie_Press_Start)) {
      ToastAndroid.show(
        'Please enter valid VIE Pressure start value',
        ToastAndroid.SHORT,
      );
      return '';
    }
    if (!this.checkValidation(this.state.Vie_Level_Start)) {
      ToastAndroid.show(
        'Please enter valid VIE Level start value',
        ToastAndroid.SHORT,
      );
      return '';
    }
    if (!this.checkValidation(this.state.Tanker_Press_Start)) {
      ToastAndroid.show(
        'Please enter valid Tanker Pressure start value',
        ToastAndroid.SHORT,
      );
      return '';
    }
    if (!this.checkValidation(this.state.Tanker_Level_Start)) {
      ToastAndroid.show(
        'Please enter valid Tanker Level start value',
        ToastAndroid.SHORT,
      );
      return '';
    }
    if (!this.checkValidation(this.state.Vie_Press_End)) {
      ToastAndroid.show(
        'Please enter valid VIE Pressure end value',
        ToastAndroid.SHORT,
      );
      return '';
    }
    if (!this.checkValidation(this.state.Vie_Level_End)) {
      ToastAndroid.show(
        'Please enter valid VIE Level end value',
        ToastAndroid.SHORT,
      );
      return '';
    }
    if (!this.checkValidation(this.state.Tanker_Press_End)) {
      ToastAndroid.show(
        'Please enter valid Tanker Pressure end value',
        ToastAndroid.SHORT,
      );
      return '';
    }
    if (!this.checkValidation(this.state.Tanker_Level_End)) {
      ToastAndroid.show(
        'Please enter valid Tanker Level end value',
        ToastAndroid.SHORT,
      );
      return '';
    }
    if (!this.checkValidation(this.state.Content_Start)) {
      ToastAndroid.show(
        'Please enter valid content start value',
        ToastAndroid.SHORT,
      );
      return '';
    }
    if (!this.checkValidation(this.state.Content_End)) {
      ToastAndroid.show(
        'Please enter valid content end value',
        ToastAndroid.SHORT,
      );
      return '';
    }

    if (!this.checkValidation(this.state.Content_Diff)) {
      ToastAndroid.show(
        'Please enter valid content difference value',
        ToastAndroid.SHORT,
      );
      return '';
    }
  }

  submitForm() {
    if (this.validate() == '') return;

    // for multi remarks in json format
    for (var i = 0; i < this.state.selectedRemarks.length; i++) {
      this.state.RemarksList.push({
        RemarksMasterID: this.state.selectedRemarks[i],
        TDLSNo: this.state.response.TDLS_No,
      });
    }

    var remarksID = this.state.preFilledRemarks + '';
    remarksID = remarksID.replace('[', '').replace(']', '');

    let d = {};
    setTimeout(() => {
      const d = JSON.stringify({
        TDLS_No: this.state.response.TDLS_No,
        BTTR_No: this.state.response.BTTR_No,
        CustomerNo: this.state.response.CustomerNo,
        vehicleno: this.state.response.vehicleno,
        TankerCode: this.state.response.TankerCode,
        LoginCategoryID: this.props.route.params.catId,
        LoginId: this.props.route.params.loginId,
        odometerin: this.state.odometerIn,
        odometerout: this.state.odometerOut,
        CalculationBaseTypeID: this.state.radioType,
        CalculationContentTypeID: 0, //empty
        vie_press_start: parseFloat(this.state.Vie_Press_Start),
        vie_press_start_unit: this.state.Vie_Press_Start_Unit,
        vie_level_start: parseFloat(this.state.Vie_Level_Start),
        vie_level_start_unit: this.state.Vie_Level_Start_Unit,
        tanker_press_start: parseFloat(this.state.Tanker_Press_Start),
        tanker_press_start_unit: this.state.Tanker_Press_Start_Unit,
        tanker_level_start: parseFloat(this.state.Tanker_Level_Start),
        tanker_level_start_unit: this.state.unit_tanker_level_start,
        vie_press_end: parseFloat(this.state.Vie_Press_End),
        vie_press_end_unit: this.state.Vie_Press_End_Unit,
        vie_level_end: parseFloat(this.state.Vie_Level_End),
        vie_level_end_unit: this.state.Vie_Level_End_Unit,
        tanker_press_end: parseFloat(this.state.Tanker_Press_End),
        tanker_press_end_unit: this.state.Tanker_Press_End_Unit,
        tanker_press_diff: '', //parseFloat(this.state.Tanker_Press_Diff),
        tanker_level_end: parseFloat(this.state.Tanker_Level_End),
        tanker_level_end_unit: this.state.unit_tanker_level_end,
        tanker_level_diff: '', //parseFloat(this.state.Tanker_Level_Diff),
        tanker_content_start: parseFloat(this.state.Content_Start),
        content_start_unit: this.state.unit_content_data,
        tanker_content_end: parseFloat(this.state.Content_End),
        content_end_unit: this.state.unit_content_data,
        tanker_content_diff: parseFloat(this.state.Content_Diff),
        uom: this.state.Content_Diff_Unit,
        remarks: remarksID,
        Additional_Remarks: this.state.Additional_Remarks,
        SupplyDate: '', //
        Trip_Status: this.state.Trip_Status,
        Trip_Reason: this.state.Trip_Reason,
        StatusReason: this.state.Trip_Reason,
        Weighbridge_No: '', //
        timein: this.state.Date_In,
        timeout: this.state.Date_Out,
        datein: this.state.Date_In,
        dateout: this.state.Date_Out,
        latitude_in: this.state.Latitude_In,
        latitude_out: this.state.Latitude_Out,
        longitude_in: this.state.Longitude_In,
        longitude_out: this.state.Longitude_Out,
        // 'RemarksList': [],
        // 'RemarksList': this.state.RemarksList,
        Image: this.state.fileUri,
        Signature: this.state.signatureUri,

        ProductName: this.state.response.ProductName,
        CustomerName: this.state.response.CustomerName,
        remarksArray: this.state.remarksArray,
        Trip_StatusDec: this.state.Trip_StatusDec,

        ScheduledDate: this.state.ScheduledDate,
        PrimaryProduct: this.state.PrimaryProduct,
        DecanterName: this.state.DecanterName,
        DriverName: this.state.DriverName,
      });

      console.log('JSON DATA: ', d);

      // return;

      NetInfo.fetch().then(networkState => {
        if (!networkState.isInternetReachable) {
          this.saveFormData([d]);
          this.saveSubmittedForminArray_toSendOnServer(d);
          this.props.route.params.onFormSubmission(true, []); //no response to replace with bcz of no internet thats why passing empty array[]
          this.setState({hideSubmitBtn: true});
          // this.props.navigation.goBack()
          ToastAndroid.show('Data Successfully Saved', ToastAndroid.SHORT);
          return;
        }
      });

      this.setState({isLoading: true});

      axios
        .post(BASE_URL + setDelivery, d, {
          headers: {
            'content-type': 'application/json',
          },
        })
        .then(response => {
          if (response.data.ResultCode == 'S') {
            ToastAndroid.show(response.data.ResultStatus, ToastAndroid.SHORT);
            this.props.route.params.onFormSubmission(
              true,
              response.data.DeliveryList,
            );
            this.setState({hideSubmitBtn: true});
          } else {
            ToastAndroid.show(response.data.ResultStatus, ToastAndroid.SHORT);
          }
        })
        .catch(error => {
          console.error(error);
          this.setState({isLoading: false});
        })
        .finally(() => {
          this.setState({isLoading: false});
        });
    }, 200);
  }

  saveFormData = async formData => {
    try {
      await AsyncStorage.setItem('formData', JSON.stringify(formData));
    } catch (error) {
      console.log('Something went wrong', error);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    }
  };

  saveSubmittedForminArray_toSendOnServer = async formData => {
    try {
      var arrayData = [];
      let responseData = '';

      responseData = this.getFormArray();
      setTimeout(() => {
        if (responseData._W != null) {
          responseData = JSON.parse(responseData._W);

          arrayData = responseData;
          arrayData.push(JSON.parse(formData));
        } else {
          arrayData = [JSON.parse(formData)];
        }

        AsyncStorage.setItem('formArray', JSON.stringify(arrayData));
      }, 500);
    } catch (error) {
      console.log('Something went wrong', error);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    }
  };

  getFormArray = async () => {
    try {
      const value = await AsyncStorage.getItem('formArray');
      if (value !== null) {
        //console.log('getListingData: ', value);
      }
      return value;
    } catch (error) {
      console.log('Something went wrong', error);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    }
  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  onRequestClose() {
    this.setModalVisible(false);
  }

  render() {
    let data = [
      {
        value: 'Approved',
      },
      {
        value: 'Rejected',
      },
    ];

    const radioData = [
      {label: 'By Volume', value: 1},
      {label: 'By Weight', value: 2},
    ];

    let pressureUnits = [
      {
        value: 'PSI',
      },
      {
        value: 'BAR',
      },
    ];

    let vieLevelUnits = [
      {
        value: 'INCH',
      },
      {
        value: 'IWC',
      },
      {
        value: 'MMWC',
      },
      {
        value: 'MBWC',
      },
      {
        value: 'LWC',
      },
      {
        value: '%age',
      },
    ];

    let tankerUnits = [
      {
        value: 'M3',
      },
      {
        value: 'KG',
      },
    ];

    let content_unit = [
      {
        value: 'M3',
      },
      {
        value: 'KG',
      },
      {
        value: 'LTR',
      },
      {
        value: 'LIT',
      },
      {
        value: 'GAA',
      },
    ];

    return (
      <View>
        <View
          style={{
            borderBottomColor: 'black',
            borderBottomWidth: 0.5,
          }}
        />

        <Loader isLoading={this.state.isLoading} />

        {/* Header */}
        <View style={{flexDirection: 'column'}}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: 'white',
              height: 50,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
              <Image
                source={require('../assets/back.png')}
                style={{
                  marginStart: 15,
                  width: 20,
                  height: 20,
                  padding: 5,
                }}></Image>
            </TouchableOpacity>
            <Text style={{fontWeight: 'bold', fontSize: 20}}>
              Delivery Form (TDLS)
            </Text>

            {this.props.route.params.userData.Trip_Status == 1 ||
            this.props.route.params.userData.Trip_Status == 3 ? (
              <TouchableOpacity
                style={{opacity: 0, height: 0}}
                onPress={() => {
                  if (this.props.route.params.userData.Signature > 0) {
                    if (!this.state.signatureUri) this.getAttachmentForPrint();
                    else this.bluetoothWorkForPrinter();
                  } else {
                    this.bluetoothWorkForPrinter();
                  }
                }}>
                <Image
                  source={require('../assets/print.png')}
                  style={{width: 20, height: 20, marginEnd: 15}}></Image>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  if (this.props.route.params.userData.Signature > 0) {
                    if (!this.state.signatureUri) this.getAttachmentForPrint();
                    else this.bluetoothWorkForPrinter();
                  } else {
                    this.bluetoothWorkForPrinter();
                  }
                }}>
                <Image
                  source={require('../assets/print.png')}
                  style={{width: 20, height: 20, marginEnd: 15}}></Image>
              </TouchableOpacity>
            )}
          </View>

          <View
            style={{
              backgroundColor: colors.greyDark,
              height: 1,
              width: '100%',
            }}></View>
        </View>

        <KeyboardAwareScrollView>
          {/* separator line */}

          <View style={styles.container}>
            <StatusBar backgroundColor={colors.primary} />

            <View style={styles.loginEditextSection}>
              <View
                pointerEvents={
                  this.props.route.params.userData.Trip_Status == 5
                    ? undefined
                    : 'none'
                }>
                <View style={{flexDirection: 'row'}}>
                  <View style={styles.twoInputFieldsStyle}>
                    <Text style={styles.labelStyle}>Delivery Number(TDLS)</Text>

                    <TextInput
                      editable={false}
                      keyboardType={'numeric'}
                      style={styles.prefilledEditText}
                      placeholderTextColor={colors.black}
                      placeholder="TDLS Number">
                      {this.state.response.TDLS_No}
                    </TextInput>
                  </View>

                  <View style={styles.twoInputFieldsStyle}>
                    <Text style={styles.labelStyle}>Trip Number(BTTR)</Text>

                    <TextInput
                      editable={false}
                      keyboardType={'numeric'}
                      style={styles.prefilledEditText}
                      placeholderTextColor={colors.black}
                      placeholder="BTTR Number">
                      {this.state.response.BTTR_No}
                    </TextInput>
                  </View>
                </View>

                <Text style={styles.labelStyle}>Customer Code</Text>

                <TextInput
                  editable={false}
                  style={styles.prefilledEditText}
                  placeholderTextColor={colors.black}
                  placeholder="Customer Code">
                  {this.state.response.CustomerNo}
                </TextInput>

                <Text style={styles.labelStyle}>Customer Name</Text>

                <TextInput
                  editable={false}
                  style={styles.prefilledEditText}
                  placeholderTextColor={colors.black}
                  placeholder="Customer Name">
                  {this.state.response.CustomerName}
                </TextInput>

                <Text style={styles.labelStyle}>VIE</Text>

                <TextInput
                  editable={false}
                  style={styles.prefilledEditText}
                  placeholderTextColor={colors.black}
                  placeholder="Tanker Short Name">
                  {this.state.response.TankerShortName}
                </TextInput>

                <Text style={styles.labelStyle}>Product Code</Text>

                <TextInput
                  editable={false}
                  style={styles.prefilledEditText}
                  placeholderTextColor={colors.black}
                  placeholder="Product Code">
                  {this.state.response.PrimaryProduct}
                </TextInput>

                <Text style={styles.labelStyle}>Product Name</Text>

                <TextInput
                  editable={false}
                  style={styles.prefilledEditText}
                  placeholderTextColor={colors.black}
                  placeholder="Product Name">
                  {this.state.response.ProductName}
                </TextInput>

                <Text style={styles.labelStyle}>Vehicle Number</Text>

                <TextInput
                  editable={false}
                  style={styles.prefilledEditText}
                  placeholderTextColor={colors.black}
                  placeholder="Vehicle Number">
                  {this.state.response.vehicleno}
                </TextInput>

                {/* Odo Meter */}
                <View style={{flexDirection: 'row'}}>
                  <View style={styles.twoInputFieldsStyle}>
                    <Text style={styles.labelStyle}>Odometer In</Text>

                    <TextInput
                      keyboardType="numeric"
                      input={Float32Array}
                      editable={
                        this.props.route.params.userData.Trip_Status == 5
                          ? true
                          : false
                      }
                      style={
                        this.props.route.params.userData.Trip_Status == 5
                          ? styles.editText
                          : styles.prefilledEditText
                      }
                      placeholderTextColor={colors.black}
                      placeholder={
                        this.state.odometerIn == null
                          ? ''
                          : this.state.odometerIn + ''
                      }
                      onChangeText={text => {
                        var res = text;

                        var inp = text.replace(/[^0-9.]/g, '');

                        res = this.removeMultiDotExceptfirst(
                          inp.replace(/[^0-9.]/g, ''),
                        );

                        this.setState({odometerIn: res});
                      }}
                      value={this.state.odometerIn}></TextInput>
                  </View>

                  <View style={styles.twoInputFieldsStyle}>
                    <Text style={styles.labelStyle}>Odometer Out</Text>

                    <TextInput
                      keyboardType="numeric"
                      style={
                        this.props.route.params.userData.Trip_Status == 5
                          ? styles.editText
                          : styles.prefilledEditText
                      }
                      placeholderTextColor={colors.black}
                      placeholder={
                        this.state.odometerOut == null
                          ? ''
                          : this.state.odometerOut + ''
                      }
                      onChangeText={text => {
                        var res = text;

                        var inp = text.replace(/[^0-9.]/g, '');

                        res = this.removeMultiDotExceptfirst(
                          inp.replace(/[^0-9.]/g, ''),
                        );

                        this.setState({odometerOut: res});
                      }}
                      value={this.state.odometerOut}></TextInput>
                  </View>
                </View>

                <RadioButtonRN
                  data={radioData}
                  textColor={colors.greyDark}
                  style={{marginTop: 10}}
                  selectedBtn={e => {
                    this.setState({radioType: e.value});
                    this.onRadioBtnSelected(e.value);
                  }}
                  initial={
                    this.props.route.params.userData.CalculationBaseTypeID
                  }
                  box={false}
                  animationTypes={['pulse']}
                />

                {/* VIE Data Level(start) */}
                <Text style={styles.labelHeadingStyle}>VIE Data (Start)</Text>

                {this.vieDataStart(pressureUnits, vieLevelUnits)}

                {/* Tanker Data Level(Start) */}
                <Text style={styles.labelHeadingStyle}>
                  Tanker Data (Start)
                </Text>

                {this.tankerDataStart(pressureUnits, tankerUnits)}

                {/* VIE Data Level(Ends) */}
                <Text style={styles.labelHeadingStyle}>VIE Data (Ends)</Text>

                {this.vieDataEnds(pressureUnits, vieLevelUnits)}

                {/* Tanker Data Level(Ends) */}
                <Text style={styles.labelHeadingStyle}>Tanker Data (Ends)</Text>

                {this.tankerDataEnds(pressureUnits, tankerUnits)}

                <Text style={styles.labelHeadingStyle}>Content Data</Text>

                {this.contentData(tankerUnits, content_unit)}

                <Text style={[styles.labelHeadingStyle, {marginBottom: 10}]}>
                  Remarks (Decentre)
                </Text>
              </View>

              <View
                style={{
                  marginEnd: 15,
                  paddingStart: 10,
                  paddingEnd: 10,
                  backgroundColor: 'white',
                  borderWidth: 0.5,
                  borderColor: colors.grey,
                }}>
                <SectionedMultiSelect
                  container={{marginTop: 200}}
                  items={this.state.remarksData}
                  IconRenderer={Icon}
                  uniqueKey="id"
                  selectText="Select Remarks"
                  showDropDowns={false}
                  readOnlyHeadings={false}
                  confirmText={
                    this.state.response.Trip_Status == 5 ? 'Confirm' : 'Close'
                  }
                  showChips={false}
                  hideSearch={true}
                  onSelectedItemsChange={this.onSelectedItemsChange}
                  selectedItems={this.state.preFilledRemarks}
                />
              </View>

              <View
                style={
                  this.props.route.params.userData.Trip_Status == 5
                    ? {
                        flex: 1,
                        borderWidth: 0.5,
                        borderColor: colors.grey,
                        height: 70,
                        marginTop: 15,
                        marginEnd: 15,
                        paddingStart: 5,
                        paddingEnd: 10,
                      }
                    : {
                        flex: 1,
                        borderWidth: 0.5,
                        borderColor: colors.grey,
                        height: 70,
                        marginTop: 15,
                        marginEnd: 15,
                        paddingStart: 5,
                        paddingEnd: 10,
                        backgroundColor: colors.lightgrey,
                      }
                }>
                <TextInput
                  multiline={true}
                  placeholderTextColor={colors.grey}
                  editable={
                    this.props.route.params.userData.Trip_Status == 5
                      ? true
                      : false
                  }
                  placeholder="Additional Remarks"
                  style={{color: 'black', height: 70, textAlignVertical: 'top'}}
                  onChangeText={text =>
                    this.setState({Additional_Remarks: text})
                  }>
                  {this.state.Additional_Remarks}
                </TextInput>
              </View>
            </View>

            {/* Image Picker */}

            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 100,
                  height: 100,
                  borderWidth: 0.5,
                  borderColor: colors.grey,
                  marginTop: 15,
                }}
                onPress={() => {
                  this.setState({imageType: 1});
                  this.getAttachment(1);
                }}>
                <Image
                  source={{uri: this.state.fileUri}}
                  style={{
                    width: 100,
                    height: 90,
                    backgroundColor: '#000',
                    resizeMode: 'stretch',
                  }}
                  source={
                    this.state.fileUri
                      ? {uri: 'data:image/jpeg;base64,' + this.state.fileUri}
                      : this.state.response.Image >= '1'
                      ? require('../assets/image_exist.jpg')
                      : require('../assets/image_exist_no.jpg')
                  }
                />
              </TouchableOpacity>

              {/* Signature */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 100,
                  height: 100,
                  borderWidth: 0.5,
                  borderColor: colors.grey,
                  marginTop: 15,
                  marginStart: 10,
                  marginEnd: 15,
                }}
                onPress={() => {
                  this.setState({imageType: 2});
                  this.getAttachment(2);
                }}>
                <Image
                  source={
                    this.state.signatureUri
                      ? {
                          uri:
                            'data:image/jpeg;base64,' + this.state.signatureUri,
                        }
                      : this.state.response.Signature >= '1'
                      ? require('../assets/sign_exist.jpg')
                      : require('../assets/sign_exist_no.jpg')
                  }
                  style={{width: 100, height: 90, resizeMode: 'contain'}}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.labelHeadingStyle}>Trip Status</Text>

            <View
              style={[styles.dropDownViewStyle, {marginEnd: 15}]}
              pointerEvents={
                this.props.route.params.userData.Trip_Status == 5
                  ? undefined
                  : 'none'
              }>
              <Dropdown
                icon={require('../assets/dropicon.png')}
                baseColor={'#fff'}
                iconColor={colors.grey}
                placeholder={
                  this.state.Trip_StatusDec == 'Approved' ||
                  this.props.route.params.userData.Trip_StatusDec == 'Closed'
                    ? this.props.route.params.userData.Trip_StatusDec
                    : 'Approved/Rejected'
                }
                data={data}
                style={
                  this.props.route.params.userData.Trip_Status == 5
                    ? styles.dropDownStyle
                    : styles.dropDownStylePrefilled
                }
                underlineColor="transparent"
                onChangeText={unit => {
                  if (unit == 'Approved')
                    this.setState({Trip_Status: 6, Trip_StatusDec: unit});
                  else
                    this.setState({Trip_Status: 4, Trip_StatusDec: 'Closed'});
                }}
              />
            </View>

            {/* Reason */}
            <View
              style={
                this.props.route.params.userData.Trip_Status == 5
                  ? {
                      flex: 1,
                      borderWidth: 0.5,
                      borderColor: colors.grey,
                      height: 120,
                      marginTop: 15,
                      marginEnd: 15,
                      paddingStart: 10,
                      paddingEnd: 10,
                    }
                  : {
                      flex: 1,
                      borderWidth: 0.5,
                      borderColor: colors.grey,
                      height: 120,
                      marginTop: 15,
                      marginEnd: 15,
                      paddingStart: 10,
                      paddingEnd: 10,
                      backgroundColor: colors.lightgrey,
                    }
              }>
              <TextInput
                multiline={true}
                placeholderTextColor={colors.greys}
                editable={
                  this.props.route.params.userData.Trip_Status == 5
                    ? true
                    : false
                }
                placeholder="Reason"
                style={{color: 'black', height: 120, textAlignVertical: 'top'}}
                onChangeText={text => this.setState({Trip_Reason: text})}>
                {this.state.Trip_Reason}
              </TextInput>
            </View>

            {/* Submit btn */}

            {this.state.hideSubmitBtn == true ? (
              <View style={{marginBottom: 70}}></View>
            ) : (
              <TouchableOpacity
                disabled={
                  this.props.route.params.userData.Trip_Status == 5
                    ? false
                    : true
                }
                onPress={() => {
                  this.submitDialog();
                }}
                style={[
                  styles.buttonStyle,
                  {
                    marginBottom: 70,
                    opacity:
                      this.props.route.params.userData.Trip_Status == 5
                        ? 100
                        : 0,
                  },
                ]}>
                <Text style={{color: 'white', fontSize: 18}}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAwareScrollView>

        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.preFilledModalShow}
          dismissable={true}
          onDismiss={() => this.setState({preFilledModalShow: false})}>
          <View
            style={{
              backgroundColor: 'white',
              width: '95%',
              height: '90%',
              alignSelf: 'center',
              borderRadius: 5,
            }}>
            <Image
              source={
                this.state.prefilledImage
                  ? {uri: 'data:image/jpeg;base64,' + this.state.prefilledImage}
                  : require('../assets/upload.png')
              }
              style={{
                width: '100%',
                height: '90%',
                resizeMode: 'contain',
                backgroundColor: 'black',
              }}
            />
            {this.props.route.params.userData.Trip_Status == 5 ? (
              <View style={{flex: 1, flexDirection: 'row'}}>
                <TouchableOpacity
                  style={[
                    styles.buttonStylemodal,
                    {backgroundColor: colors.grey},
                  ]}
                  onPress={() => {
                    this.setState({preFilledModalShow: false});
                  }}>
                  <Text>Close</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.buttonStylemodal,
                    {backgroundColor: colors.lightGreen},
                  ]}
                  onPress={() => {
                    this.setState({preFilledModalShow: false});

                    console.log('imagetype: ', this.state.imageType);
                    setTimeout(() => {
                      if (this.state.imageType == 2)
                        this.props.navigation.navigate('IP', {
                          onReceiveSignature: this.onReceiveSignature,
                        });
                      else this.permision();
                    }, 100);
                  }}>
                  <Text>Upload</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{flex: 1, flexDirection: 'row'}}>
                <TouchableOpacity
                  style={[
                    styles.buttonStylemodal,
                    {backgroundColor: colors.grey},
                  ]}
                  onPress={() => {
                    this.setState({preFilledModalShow: false});
                  }}>
                  <Text>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>

        {/* Bluetooth modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          dismissable={true}
          onDismiss={() => this.setState({modalVisible: false})}>
          <View
            style={{
              backgroundColor: 'white',
              width: '70%',
              height: '80%',
              alignSelf: 'center',
              borderRadius: 10,
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                alignSelf: 'center',
                marginTop: 10,
                marginBottom: 10,
              }}>
              Bluetooth Devices
            </Text>

            <FlatList
              data={this.state.foundDevices}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({isLoading: true});
                    this.connectBlueDevices(
                      this.state.foundDevices[index].address,
                    );
                  }}>
                  <View
                    style={{
                      flexDirection: 'column',
                      marginStart: 30,
                      marginEnd: 30,
                      alignContent: 'center',
                    }}>
                    <Text style={{marginTop: 10}}>{item.name}</Text>
                    <Text>{item.address}</Text>
                    <View
                      style={{
                        width: '100%',
                        height: 1,
                        backgroundColor: colors.greyDark,
                        marginTop: 10,
                      }}></View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.address}
              key={item => item.address}
            />
          </View>
        </Modal>
      </View>
    );
  }
  // render end

  vieDataStart(pressureUnits, vieLevelUnits) {
    return (
      <View style={{flexDirection: 'column'}}>
        <View style={styles.twoInputFieldsStyle}>
          <Text style={styles.labelStyle}>Pressure Start</Text>

          <View style={{flexDirection: 'row', marginEnd: 5}}>
            <TextInput
              style={
                this.props.route.params.userData.Trip_Status == 5
                  ? styles.editTextDATA
                  : styles.prefilledEditTextDATA
              }
              placeholderTextColor={colors.black}
              placeholder={this.state.Vie_Press_Start + ''}
              keyboardType="numeric"
              onChangeText={text => {
                var res = text;

                var inp = text.replace(/[^0-9.]/g, '');

                res = this.removeMultiDotExceptfirst(
                  inp.replace(/[^0-9.]/g, ''),
                );

                this.setState({Vie_Press_Start: res});
              }}
              value={this.state.Vie_Press_Start}></TextInput>

            <View
              style={{
                borderWidth: 0.5,
                borderColor: colors.grey2,
                justifyContent: 'center',
                height: 45,
                alignContent: 'center',
                marginEnd: 10,
                marginTop: 2,
              }}>
              <Dropdown
                style={
                  this.props.route.params.userData.Trip_Status == 5
                    ? styles.dropDownStyle
                    : styles.dropDownStylePrefilled
                }
                icon={require('../assets/dropicon.png')}
                baseColor={'#fff'}
                iconColor={colors.grey}
                placeholder={this.state.Vie_Press_Start_Unit}
                data={pressureUnits}
                underlineColor="transparent"
                onChangeText={unit =>
                  this.setState({
                    Vie_Press_Start_Unit: unit,
                    Vie_Press_End_Unit: unit,
                  })
                }
                value={
                  this.state.Vie_Press_Start_Unit
                    ? this.state.Vie_Press_Start_Unit
                    : pressureUnits[0].value
                }
              />
            </View>
          </View>
        </View>

        <View style={styles.twoInputFieldsStyle}>
          <Text style={styles.labelStyle}>Level Start</Text>

          <View style={{flexDirection: 'row', marginEnd: 5}}>
            <TextInput
              style={
                this.props.route.params.userData.Trip_Status == 5
                  ? styles.editTextDATA
                  : styles.prefilledEditTextDATA
              }
              placeholderTextColor={colors.black}
              placeholder={this.state.Vie_Level_Start + ''}
              keyboardType="numeric"
              onChangeText={text => {
                var res = text;

                var inp = text.replace(/[^0-9.]/g, '');

                res = this.removeMultiDotExceptfirst(
                  inp.replace(/[^0-9.]/g, ''),
                );

                this.setState({Vie_Level_Start: res});
              }}
              value={this.state.Vie_Level_Start}></TextInput>

            <View
              style={{
                borderWidth: 0.5,
                borderColor: colors.grey2,
                justifyContent: 'center',
                height: 45,
                alignContent: 'center',
                marginEnd: 10,
                marginTop: 2,
              }}>
              <Dropdown
                style={
                  this.props.route.params.userData.Trip_Status == 5
                    ? styles.dropDownStyle
                    : styles.dropDownStylePrefilled
                }
                icon={require('../assets/dropicon.png')}
                baseColor={'#fff'}
                iconColor={colors.grey}
                placeholder={this.state.Vie_Level_Start_Unit}
                data={vieLevelUnits}
                underlineColor="transparent"
                onChangeText={unit =>
                  this.setState({
                    Vie_Level_Start_Unit: unit,
                    Vie_Level_End_Unit: unit,
                  })
                }
                value={
                  this.state.Vie_Level_Start_Unit
                    ? this.state.Vie_Level_Start_Unit
                    : vieLevelUnits[0].value
                }
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  tankerDataStart(pressureUnits, tankerUnits) {
    return (
      <View style={{flexDirection: 'column'}}>
        <View style={styles.twoInputFieldsStyle}>
          <Text style={styles.labelStyle}>Pressure Start</Text>

          <View style={{flexDirection: 'row', marginEnd: 5}}>
            <TextInput
              style={
                this.props.route.params.userData.Trip_Status == 5
                  ? styles.editTextDATA
                  : styles.prefilledEditTextDATA
              }
              placeholderTextColor={colors.black}
              placeholder={this.state.Tanker_Press_Start + ''}
              keyboardType="numeric"
              onChangeText={text => {
                var res = text;

                var inp = text.replace(/[^0-9.]/g, '');

                res = this.removeMultiDotExceptfirst(
                  inp.replace(/[^0-9.]/g, ''),
                );

                this.setState({Tanker_Press_Start: res});
              }}
              value={this.state.Tanker_Press_Start}></TextInput>

            <View
              style={{
                borderWidth: 0.5,
                borderColor: colors.grey2,
                justifyContent: 'center',
                height: 45,
                alignContent: 'center',
                marginEnd: 10,
                marginTop: 2,
              }}>
              <Dropdown
                style={
                  this.props.route.params.userData.Trip_Status == 5
                    ? styles.dropDownStyle
                    : styles.dropDownStylePrefilled
                }
                icon={require('../assets/dropicon.png')}
                baseColor={'#fff'}
                iconColor={colors.grey}
                placeholder={this.state.Tanker_Press_Start_Unit}
                data={pressureUnits}
                underlineColor="transparent"
                onChangeText={unit =>
                  this.setState({
                    Tanker_Press_Start_Unit: unit,
                    Tanker_Press_End_Unit: unit,
                  })
                }
                value={
                  this.state.Tanker_Press_Start_Unit
                    ? this.state.Tanker_Press_Start_Unit
                    : pressureUnits[0].value
                }
              />
            </View>
          </View>
        </View>

        <View style={styles.twoInputFieldsStyle}>
          <Text style={styles.labelStyle}>Level Start</Text>

          <View style={{flexDirection: 'row', marginEnd: 5}}>
            <TextInput
              style={
                this.props.route.params.userData.Trip_Status == 5
                  ? styles.editTextDATA
                  : styles.prefilledEditTextDATA
              }
              placeholderTextColor={colors.black}
              placeholder={this.state.Tanker_Level_Start + ''}
              keyboardType="numeric"
              onChangeText={text => {
                var res = text;

                var inp = text.replace(/[^0-9.]/g, '');

                res = this.removeMultiDotExceptfirst(
                  inp.replace(/[^0-9.]/g, ''),
                );

                this.setState({Tanker_Level_Start: res});
              }}
              value={this.state.Tanker_Level_Start}></TextInput>

            <View
              style={{
                borderWidth: 0.5,
                borderColor: colors.grey2,
                justifyContent: 'center',
                height: 45,
                alignContent: 'center',
                marginEnd: 10,
                marginTop: 2,
              }}>
              <Dropdown
                style={
                  this.props.route.params.userData.Trip_Status == 5
                    ? styles.dropDownStyle
                    : styles.dropDownStylePrefilled
                }
                icon={require('../assets/dropicon.png')}
                baseColor={'#fff'}
                iconColor={colors.grey}
                placeholder={this.state.Tanker_Level_Start_Unit}
                underlineColor="transparent"
                value={this.state.unit_tanker_level_start}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  vieDataEnds(pressureUnits, vieLevelUnits) {
    return (
      <View style={{flexDirection: 'column'}}>
        <View style={styles.twoInputFieldsStyle}>
          <Text style={styles.labelStyle}>Pressure Ends</Text>

          <View style={{flexDirection: 'row', marginEnd: 5}}>
            <TextInput
              style={
                this.props.route.params.userData.Trip_Status == 5
                  ? styles.editTextDATA
                  : styles.prefilledEditTextDATA
              }
              placeholderTextColor={colors.black}
              placeholder={this.state.Vie_Press_End + ''}
              keyboardType="numeric"
              onChangeText={text => {
                var res = text;

                var inp = text.replace(/[^0-9.]/g, '');

                res = this.removeMultiDotExceptfirst(
                  inp.replace(/[^0-9.]/g, ''),
                );

                this.setState({Vie_Press_End: res});
              }}
              value={this.state.Vie_Press_End}></TextInput>

            <View
              style={{
                borderWidth: 0.5,
                borderColor: colors.grey2,
                justifyContent: 'center',
                height: 45,
                alignContent: 'center',
                marginEnd: 10,
                marginTop: 2,
              }}>
              <Dropdown
                style={
                  this.props.route.params.userData.Trip_Status == 5
                    ? styles.dropDownStyle
                    : styles.dropDownStylePrefilled
                }
                icon={require('../assets/dropicon.png')}
                baseColor={'#fff'}
                iconColor={colors.grey}
                placeholder={this.state.Vie_Press_End_Unit}
                data={pressureUnits}
                underlineColor="transparent"
                onChangeText={unit =>
                  this.setState({
                    Vie_Press_End_Unit: unit,
                    Vie_Press_Start_Unit: unit,
                  })
                }
                value={
                  this.state.Vie_Press_End_Unit
                    ? this.state.Vie_Press_End_Unit
                    : pressureUnits[0].value
                }
              />
            </View>
          </View>
        </View>

        <View style={styles.twoInputFieldsStyle}>
          <Text style={styles.labelStyle}>Level Ends</Text>

          <View style={{flexDirection: 'row', marginEnd: 5}}>
            <TextInput
              style={
                this.props.route.params.userData.Trip_Status == 5
                  ? styles.editTextDATA
                  : styles.prefilledEditTextDATA
              }
              placeholderTextColor={colors.black}
              placeholder={this.state.Vie_Level_End + ''}
              keyboardType="numeric"
              onChangeText={text => {
                var res = text;

                var inp = text.replace(/[^0-9.]/g, '');

                res = this.removeMultiDotExceptfirst(
                  inp.replace(/[^0-9.]/g, ''),
                );

                this.setState({Vie_Level_End: res});
              }}
              value={this.state.Vie_Level_End}></TextInput>

            <View
              style={{
                borderWidth: 0.5,
                borderColor: colors.grey2,
                justifyContent: 'center',
                height: 45,
                alignContent: 'center',
                marginEnd: 10,
                marginTop: 2,
              }}>
              <Dropdown
                style={
                  this.props.route.params.userData.Trip_Status == 5
                    ? styles.dropDownStyle
                    : styles.dropDownStylePrefilled
                }
                icon={require('../assets/dropicon.png')}
                baseColor={'#fff'}
                iconColor={colors.grey}
                placeholder={this.state.Vie_Level_End_Unit}
                data={vieLevelUnits}
                underlineColor="transparent"
                onChangeText={unit =>
                  this.setState({
                    Vie_Level_End_Unit: unit,
                    Vie_Level_Start_Unit: unit,
                  })
                }
                value={
                  this.state.Vie_Level_End_Unit
                    ? this.state.Vie_Level_End_Unit
                    : vieLevelUnits[0].value
                }
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  tankerDataEnds(pressureUnits, tankerUnits) {
    return (
      <View style={{flexDirection: 'column'}}>
        <View style={styles.twoInputFieldsStyle}>
          <Text style={styles.labelStyle}>Pressure Ends</Text>

          <View style={{flexDirection: 'row', marginEnd: 5}}>
            <TextInput
              style={
                this.props.route.params.userData.Trip_Status == 5
                  ? styles.editTextDATA
                  : styles.prefilledEditTextDATA
              }
              placeholderTextColor={colors.black}
              placeholder={this.state.Tanker_Press_End + ''}
              keyboardType="numeric"
              onChangeText={text => {
                var res = text;

                var inp = text.replace(/[^0-9.]/g, '');

                res = this.removeMultiDotExceptfirst(
                  inp.replace(/[^0-9.]/g, ''),
                );

                this.setState({Tanker_Press_End: res});
              }}
              value={this.state.Tanker_Press_End}></TextInput>

            <View
              style={{
                borderWidth: 0.5,
                borderColor: colors.grey2,
                justifyContent: 'center',
                height: 45,
                alignContent: 'center',
                marginEnd: 10,
                marginTop: 2,
              }}>
              <Dropdown
                style={
                  this.props.route.params.userData.Trip_Status == 5
                    ? styles.dropDownStyle
                    : styles.dropDownStylePrefilled
                }
                icon={require('../assets/dropicon.png')}
                baseColor={'#fff'}
                iconColor={colors.grey}
                placeholder={this.state.Tanker_Press_End_Unit}
                data={pressureUnits}
                underlineColor="transparent"
                onChangeText={unit =>
                  this.setState({
                    Tanker_Press_End_Unit: unit,
                    Tanker_Press_Start_Unit: unit,
                  })
                }
                value={
                  this.state.Tanker_Press_End_Unit
                    ? this.state.Tanker_Press_End_Unit
                    : pressureUnits[0].value
                }
              />
            </View>
          </View>
        </View>

        <View style={styles.twoInputFieldsStyle}>
          <Text style={styles.labelStyle}>Level Ends</Text>

          <View style={{flexDirection: 'row', marginEnd: 5}}>
            <TextInput
              style={
                this.props.route.params.userData.Trip_Status == 5
                  ? styles.editTextDATA
                  : styles.prefilledEditTextDATA
              }
              placeholderTextColor={colors.black}
              placeholder={this.state.Tanker_Level_End + ''}
              keyboardType="numeric"
              onChangeText={text => {
                var res = text;

                var inp = text.replace(/[^0-9.]/g, '');

                res = this.removeMultiDotExceptfirst(
                  inp.replace(/[^0-9.]/g, ''),
                );

                this.setState({Tanker_Level_End: res});
              }}
              value={this.state.Tanker_Level_End}></TextInput>

            <View
              style={{
                borderWidth: 0.5,
                borderColor: colors.grey2,
                justifyContent: 'center',
                height: 45,
                alignContent: 'center',
                marginEnd: 10,
                marginTop: 2,
              }}>
              <Dropdown
                style={
                  this.props.route.params.userData.Trip_Status == 5
                    ? styles.dropDownStyle
                    : styles.dropDownStylePrefilled
                }
                icon={require('../assets/dropicon.png')}
                baseColor={'#fff'}
                iconColor={colors.grey}
                placeholder={this.state.Tanker_Level_End_Unit}
                underlineColor="transparent"
                value={this.state.unit_tanker_level_end}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  contentDiffCalculation() {
    var result = 0;
    var sum = 0;
    var diff = 0;
    var planned = this.props.route.params.userData.ScheduledAmount;
    setTimeout(() => {
      if (
        /*!this.state.Content_Start == null ||*/ !this.state.Content_Start == ''
      ) {
        diff =
          parseFloat(this.state.Content_Start) -
          parseFloat(this.state.Content_End);
        result = planned * 0.1;
        sum = result + planned;
      }
      if (diff > sum) {
        ToastAndroid.show(
          'Content limit exceed from planned quantity',
          ToastAndroid.LONG,
        );
      }
      if (this.state.Content_End) {
        if (this.state.Content_End.length > 0)
          this.setState({Content_Diff: diff});
        else this.setState({Content_Diff: 0});
      } else this.setState({Content_Diff: 0});
    }, 50);
  }

  contentData(tankerUnits, content_unit) {
    return (
      <View>
        <View style={{flexDirection: 'column'}}>
          <View style={styles.twoInputFieldsStyle}>
            <Text style={styles.labelStyle}>Start Content</Text>

            <View style={{flexDirection: 'row', marginEnd: 5}}>
              <TextInput
                style={
                  this.props.route.params.userData.Trip_Status == 5
                    ? styles.editTextDATA
                    : styles.prefilledEditTextDATA
                }
                placeholderTextColor={colors.black}
                placeholder={this.state.Content_Start + ''}
                keyboardType="numeric"
                onChangeText={text => {
                  var res = text;

                  var inp = text.replace(/[^0-9.]/g, '');

                  res = this.removeMultiDotExceptfirst(
                    inp.replace(/[^0-9.]/g, ''),
                  );

                  this.setState({Content_Start: res});

                  clearTimeout(this.typingTimer);
                  this.typingTimer = setTimeout(() => {
                    this.contentDiffCalculation();
                  }, 1000);
                }}
                value={this.state.Content_Start}></TextInput>

              <View
                style={{
                  borderWidth: 0.5,
                  borderColor: colors.grey2,
                  justifyContent: 'center',
                  height: 45,
                  alignContent: 'center',
                  marginEnd: 10,
                  marginTop: 2,
                }}>
                <Dropdown
                  style={
                    this.props.route.params.userData.Trip_Status == 5
                      ? styles.dropDownStyle
                      : styles.dropDownStylePrefilled
                  }
                  icon={require('../assets/dropicon.png')}
                  baseColor={'#fff'}
                  iconColor={colors.grey}
                  placeholder={this.state.Content_Start_Unit}
                  underlineColor="transparent"
                  value={this.state.unit_content_data}
                />
              </View>
            </View>
          </View>

          <View style={styles.twoInputFieldsStyle}>
            <Text style={styles.labelStyle}>End Content</Text>

            <View style={{flexDirection: 'row', marginEnd: 5}}>
              <TextInput
                style={
                  this.props.route.params.userData.Trip_Status == 5
                    ? styles.editTextDATA
                    : styles.prefilledEditTextDATA
                }
                placeholderTextColor={colors.black}
                placeholder={this.state.Content_End + ''}
                keyboardType="numeric"
                onChangeText={text => {
                  var res = text;

                  var inp = text.replace(/[^0-9.]/g, '');

                  res = this.removeMultiDotExceptfirst(
                    inp.replace(/[^0-9.]/g, ''),
                  );

                  this.setState({Content_End: res});

                  clearTimeout(this.typingTimer);
                  this.typingTimer = setTimeout(() => {
                    this.contentDiffCalculation();
                  }, 1000);
                }}
                value={this.state.Content_End}></TextInput>

              <View
                style={{
                  borderWidth: 0.5,
                  borderColor: colors.grey2,
                  justifyContent: 'center',
                  height: 45,
                  alignContent: 'center',
                  marginEnd: 10,
                  marginTop: 2,
                }}>
                <Dropdown
                  style={
                    this.props.route.params.userData.Trip_Status == 5
                      ? styles.dropDownStyle
                      : styles.dropDownStylePrefilled
                  }
                  icon={require('../assets/dropicon.png')}
                  baseColor={'#fff'}
                  iconColor={colors.grey}
                  placeholder={this.state.Content_End_Unit}
                  underlineColor="transparent"
                  value={this.state.unit_content_data}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={{flexDirection: 'row'}}>
          <View style={styles.twoInputFieldsStyle}>
            <Text style={styles.labelStyle}>Content</Text>

            <TextInput
              style={
                this.props.route.params.userData.Trip_Status == 5
                  ? styles.editText
                  : styles.prefilledEditText
              }
              placeholderTextColor={colors.black}
              placeholder={this.state.Content_Diff + ''}
              keyboardType="numeric"
              onChangeText={text => {
                var res = text;

                var inp = text.replace(/[^0-9.]/g, '');

                res = this.removeMultiDotExceptfirst(
                  inp.replace(/[^0-9.]/g, ''),
                );

                this.setState({Content_Diff: res});
                clearTimeout(this.typingTimer);
                this.typingTimer = setTimeout(() => {
                  if (
                    res >
                    this.props.route.params.userData.ScheduledAmount +
                      this.props.route.params.userData.ScheduledAmount * 0.1
                  )
                    ToastAndroid.show(
                      'Content limit exceed from planned quantity',
                      ToastAndroid.LONG,
                    );
                }, 1000);
              }}
              value={this.state.Content_Diff}></TextInput>
          </View>

          <View style={styles.twoInputFieldsStyle}>
            <Text style={styles.labelStyle}>Unit</Text>

            <View
              style={{
                flex: 1,
                borderWidth: 0.5,
                borderColor: colors.grey2,
                justifyContent: 'center',
                height: 45,
                alignContent: 'center',
                marginEnd: 10,
                marginTop: 2,
              }}>
              <Dropdown
                style={
                  this.props.route.params.userData.Trip_Status == 5
                    ? styles.dropDownStyle
                    : styles.dropDownStylePrefilled
                }
                icon={require('../assets/dropicon.png')}
                baseColor={'#fff'}
                iconColor={colors.grey}
                placeholder={
                  this.state.Content_Diff_Unit
                    ? this.state.Content_Diff_Unit
                    : 'Select unit'
                }
                data={content_unit}
                underlineColor="transparent"
                onChangeText={unit => this.setState({Content_Diff_Unit: unit})}
                value={this.state.Content_Diff_Unit}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    paddingStart: 15,
    paddingEnd: 1,
    paddingTop: 2,
  },

  viewStyle: {
    marginTop: 10,
    flex: 0.2,
  },

  editText: {
    height: 45,
    flex: 1,
    marginEnd: 15,
    borderColor: colors.grey2,
    borderWidth: 0.5,
    padding: 10,
    marginTop: 2,
    color: 'black',
    backgroundColor: 'white',
  },
  editTextDATA: {
    height: 45,
    width: 20,
    flex: 1,
    marginEnd: 1,
    borderColor: colors.grey2,
    borderWidth: 0.5,
    padding: 10,
    marginTop: 2,
    color: 'black',
    backgroundColor: 'white',
  },
  prefilledEditTextDATA: {
    height: 45,
    width: 20,
    flex: 1,
    marginEnd: 1,
    borderColor: colors.grey2,
    borderWidth: 0.5,
    padding: 10,
    marginTop: 2,
    color: colors.grey2,
    backgroundColor: colors.lightgrey,
  },

  prefilledEditText: {
    height: 45,
    flex: 1,
    marginEnd: 15,
    borderColor: colors.grey2,
    borderWidth: 0.5,
    padding: 10,
    marginTop: 2,
    color: colors.black,
    backgroundColor: colors.lightgrey,
  },
  buttonStyle: {
    marginTop: 50,
    width: '100%',
    borderColor: colors.primary,
    borderRadius: 100,
    alignSelf: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.primary,
    marginBottom: 20,
  },

  textStyle: {
    padding: 5,
    fontSize: 20,
    textShadowColor: 'black',
    marginTop: 0,
    color: 'black',
  },

  textStyleGray: {
    padding: 5,
    fontSize: 14,
    textShadowColor: 'black',
    color: 'gray',
  },

  loginEditextSection: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
  },

  bottomText: {
    flex: 0.3,
    alignSelf: 'baseline',
    justifyContent: 'flex-end',
  },
  labelStyle: {
    color: colors.black,
    marginTop: 15,
  },
  labelHeadingStyle: {
    color: colors.black,
    marginTop: 25,
    fontWeight: 'bold',
  },
  twoInputFieldsStyle: {
    flex: 0.5,
    flexDirection: 'column',
  },
  dropDownViewStyle: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: colors.grey2,
    justifyContent: 'center',
    height: 50,
    marginTop: 15,
    alignContent: 'center',
    marginEnd: 10,
  },
  dropDownStyle: {
    height: 45,
    borderWidth: 0.5,
    borderColor: colors.white,
    backgroundColor: 'transparent',
  },
  dropDownStylePrefilled: {
    height: 43,
    borderWidth: 0.5,
    borderColor: colors.white,
    backgroundColor: colors.lightgrey,
    margin: 5,
  },
  buttonStylemodal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eeeeee',
  },
});
