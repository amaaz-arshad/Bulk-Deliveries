import React, {Component, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ToastAndroid,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {ms, ScaledSheet} from 'react-native-size-matters';
import {Tab, Tabs, TabHeading} from 'native-base';
import DatePicker from 'react-native-datepicker';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import CheckBox from 'react-native-check-box';
import {colors} from '../config';
import Icon from 'react-native-vector-icons/Fontisto';
import axios from 'axios';
import {BASE_URL, searchTdls} from '../config/constant';
import {getSchedulerList_DateAndAll} from '../config/constant';
import {setDelivery} from '../config/constant';
import {getRemarksMaster} from '../config/constant';
import {getAttachment} from '../config/constant';
import * as NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import Loader from '../appComponent/Loader';
import {
  BluetoothManager,
  BluetoothEscposPrinter,
  BluetoothTscPrinter,
} from 'react-native-bluetooth-escpos-printer';
import {Modal} from 'react-native-paper';
import {PermissionsAndroid} from 'react-native';
import {requestMultiple, PERMISSIONS} from 'react-native-permissions';
import TDLSForm from '../TDLSForm/TDLSForm';
import ToastExample from '../config/ToastExample';
import {ActivityIndicator} from 'react-native';
import {StyleSheet} from 'react-native';
import {TextInput} from 'react-native';
import TDLSItemView from '../TDLSListing/itemview/TdlsItemView';
import {convertDateString} from '../appComponent/DateConversion';

export default class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      toDateMinRange: new Date(),
      tripPlaceHolder: 'Select Trip No',
      printData: {},
      modalVisible: false,
      mainResp: [],
      dateFrom: '',
      dateTo: '',
      tripNoDropDownData: [],
      selectedTripNo: '',
      isChecked: false,
      userData: {},
      pendingData: [],
      approvedData: [],
      closedData: [],
      currentTab: 0,
      isLoading: false,
      isNetAvailable: false,
      isSync: false,
      signatureUri: '',
      tdlsNo: '',
      errorMsg: '',
      loading: false,
      tdlsData: {},
    };
  }

  //userID
  loginId = this.props.route.params.userData.LoginId;

  onFormSubmission = (isSubmitSuccessfully, response) => {
    setTimeout(() => {
      if (isSubmitSuccessfully) {
        this.setState({isSubmitSuccessfully: true});

        NetInfo.fetch().then(networkState => {
          if (!networkState.isInternetReachable)
            this.saveSubmittedFormData_withDBupdate_onBack(
              networkState.isInternetReachable,
            );
          else {
            this.updateListingonFormSubmissionOnline(response);
          }
        });
      }
    }, 50);
  };

  updateListingonFormSubmissionOnline(response) {
    if (!response.length > 0) {
      // ToastAndroid.show("No Data Found", ToastAndroid.SHORT)
      return;
    }

    this.saveListingData(response);

    this.setState({
      mainResp: response,

      pendingData: this.getFiltered_Status_Data(response, 5),

      approvedData: this.getFiltered_Status_Data(response, 6),

      closedData: this.getFiltered_Status_Data(response, 4),
    });

    this.setTripNoDropDown(response, this.state.currentTab);
  }

  componentWillReceiveProps(nextProps) {
    //to save data locally when sync
    if (this.props !== nextProps) {
      NetInfo.fetch().then(networkState => {
        if (!networkState.isInternetReachable) {
          ToastAndroid.show('Please connect with internet', ToastAndroid.SHORT);
          return;
        } else {
          this.setState({isSync: nextProps.route.params.sync});
          this.setState({
            currentTab: this.state.currentTab,
            dateFrom: '',
            dateTo: '',
            isChecked: false,
            tripPlaceHolder: 'Select Trip No\t',
          });
          this.setTripNoDropDown(this.state.mainResp, this.state.currentTab);

          let responseData = '';
          responseData = this.getFormArray();
          setTimeout(() => {
            if (responseData._W != null) {
              this.sendAllFormsToServer();
            } else {
              NetInfo.fetch().then(networkState => {
                this.fetchData(networkState.isInternetReachable);
              });
            }
            this.setState({tripPlaceHolder: 'Select Trip No'});
          }, 50);
        }
      });
    }
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
              this.state.printData.TDLS_No +
              '\n' +
              'Date                ' +
              this.state.printData.ScheduledDate +
              '\n' +
              'Customer #          ' +
              this.state.printData.CustomerNo +
              '\n' +
              'Name                ' +
              this.state.printData.CustomerName +
              '\n' +
              'Product code        ' +
              this.state.printData.PrimaryProduct +
              '\n' +
              'Description         ' +
              this.state.printData.ProductName +
              '\n' +
              'Tanker #            ' +
              this.state.printData.vehicleno +
              '\n' +
              'Decanter Name       ' +
              this.state.printData.DecanterName +
              '\n' +
              'Driver Name         ' +
              this.state.printData.DriverName +
              '\n' +
              'Date & Time In      ' +
              this.state.printData.datein +
              '\n' +
              'Odometer In         ' +
              this.state.printData.odometerin +
              '\n' +
              'Date & Time Out     ' +
              this.state.printData.dateout +
              '\n' +
              'Odometer Out        ' +
              this.state.printData.odometerout +
              '\n' +
              'Delivery in         ' +
              this.state.printData.CalculationBaseType +
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
              this.state.printData.vie_press_start + '',
              this.state.printData.vie_press_end + '',
              this.state.printData.vie_press_start_unit + '',
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
              this.state.printData.vie_level_start + '',
              this.state.printData.vie_level_end + '',
              this.state.printData.vie_level_end_unit + '',
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
              this.state.printData.tanker_press_start + '',
              this.state.printData.tanker_press_end + '',
              this.state.printData.tanker_press_start_unit + '',
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
              this.state.printData.tanker_level_start + '',
              this.state.printData.tanker_level_end + '',
              this.state.printData.tanker_level_start_unit + '',
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
              this.state.printData.tanker_content_start + '',
              this.state.printData.tanker_content_end + '',
              this.state.printData.content_start_unit + '',
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
              this.state.printData.tanker_content_diff +
              '\n' +
              'Delivered Unit      ' +
              this.state.printData.uom +
              '\n' +
              'Comments:           ' +
              this.state.printData.remarks +
              '\n' +
              'Customer Signature: ' +
              '' +
              '\n' + //sig ki image
              'Printed by:         ' +
              this.loginId +
              '\n' +
              'Print date:         ' +
              this.state.printData.Date_Out +
              '\n' +
              'Device id :         ' +
              'WOOSIM' +
              '\n' +
              'Call on:            ' +
              '+9211165892525' +
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

  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]).then(result => {
        if (
          result['android.permission.ACCESS_COARSE_LOCATION'] &&
          result['android.permission.ACCESS_FINE_LOCATION'] &&
          result['android.permission.CAMERA'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          this.setState({hasLocationPermission: true});
        }
      });

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.setState({hasLocationPermission: true});
      }
    } catch (err) {
      console.warn(err);
    }
  }

  scanBlueDevices() {
    this.setState({isLoading: true});

    BluetoothManager.scanDevices().then(
      s => {
        var ss = JSON.parse(s); //JSON string

        console.log('okokokok: ', s);

        let resp = {};

        setTimeout(() => {
          resp = JSON.parse(s);

          console.log('response Poora ', resp);

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

  getAttachmentForPrint() {
    this.setState({isLoading: true});
    axios
      .get(BASE_URL + getAttachment, {
        params: {
          TripNo: this.state.printData.TDLS_No, //tdls
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

  print() {
    let viePressUnit = this.state.printData.vie_press_start_unit + '\n';
    let vieLevelUnit =
      this.state.printData.vie_level_start_unit +
      '\n' +
      '------------------------------------------------' +
      '\n';
    let tankerPressUnit = this.state.printData.tanker_press_end_unit + '\n';
    let tankerLevelUnit = this.state.printData.tanker_level_start_unit + '\n';
    let contentUnit =
      this.state.printData.content_start_unit +
      '\n' +
      '------------------------------------------------' +
      '\n';
    let bttrno = this.state.printData.BTTR_No + '\n';
    let tdlsno = this.state.printData.TDLS_No + '\n';
    let scheduledate = this.state.printData.ScheduledDate + '\n';
    let customerno = this.state.printData.CustomerNo + '\n';
    let customername = this.state.printData.CustomerName + '\n';
    let primaryproduct = this.state.printData.PrimaryProduct + '\n';
    let vie = this.state.printData.TankerShortName + '\n';
    let productname = this.state.printData.ProductName + '\n';
    let vehiclenum = this.state.printData.vehicleno + '\n';
    let decantername = this.state.printData.DecanterName + '\n';
    let drivername = this.state.printData.DriverName + '\n';
    let timein = convertDateString(
      this.state.printData.datein,
      this.state.printData.timein,
    );
    let inodometer = this.state.printData.odometerin + '\n';
    let timeout = convertDateString(
      this.state.printData.dateout,
      this.state.printData.timeout,
    );
    let outodometer =
      this.state.printData.odometerout +
      '\n' +
      '------------------------------------------------' +
      '\n';
    let chk =
      this.state.printData.CalculationBaseType == null
        ? ''
        : this.state.printData.CalculationBaseType + '';
    // let netweight = this.state.printData.tanker_content_diff + " KG"  + '\n';

    let diff =
      this.state.printData.tanker_content_start -
      this.state.printData.tanker_content_end;
    let netweight =
      this.state.printData.CalculationBaseTypeID == 1
        ? '\n'
        : diff + '' + ' KG' + '\n';

    // let netweight =
    //     this.state.printData.CalculationBaseTypeID == 1
    //         ? '\n'
    //         : this.state.printData.tanker_content_diff + "" +
    //         ' KG' +
    //         '\n';

    let deliveredvolume =
      this.state.printData.tanker_content_diff +
      ' ' +
      this.state.printData.uom +
      '\n';
    //let deliveredvolume = this.state.printData.tanker_content_diff + " " + 'M3' + '\n';
    let comments = !this.state.printData.Additional_Remarks
      ? '\n'
      : this.state.printData.Additional_Remarks + '\n';
    let sig = this.state.signatureUri;

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
      this.state.printData.CalculationBaseType,
    );
    console.log(
      'CalculationBaseType id: ',
      this.state.printData.CalculationBaseTypeID,
    );

    ToastExample.show(
      this.state.printData.vie_press_start + '',
      this.state.printData.vie_press_end + '',
      viePressUnit,
      this.state.printData.vie_level_start + '',
      this.state.printData.vie_level_end + '',
      vieLevelUnit,
      this.state.printData.tanker_press_start + '',
      this.state.printData.tanker_press_end + '',
      tankerPressUnit,
      this.state.printData.tanker_level_start + '',
      this.state.printData.tanker_level_end + '',
      tankerLevelUnit,
      this.state.printData.tanker_content_start + '',
      this.state.printData.tanker_content_end + '',
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
      sig,
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
        var paired = [];

        this.print();
      },
      err => {
        alert(err);
      },
    );
  }

  componentDidMount() {
    // NetInfo.fetch().then(networkState => {
    //   screen = this.props.route.params.screen;
    //   if (screen == 1) this.fetchData(false);
    //   else this.fetchData(networkState.isInternetReachable);
    // });
  }

  saveSubmittedFormData_withDBupdate_onBack(isNetAvailable) {
    if (!isNetAvailable) {
      let data = {};
      let response = [];

      let formData = {};
      let responseformData = [];

      data = this.getListingData();
      formData = this.getFormData();

      setTimeout(() => {
        responseformData = JSON.parse(formData._W);

        response = JSON.parse(data._W);

        var index = response.findIndex(
          e => e.TDLS_No == JSON.parse(responseformData).TDLS_No,
        );
        if (index != -1) {
          response.splice(index, 1, JSON.parse(responseformData));
        } else {
          console.log('Item not found');
        }

        this.saveListingData(response);

        this.fetchData(isNetAvailable);
      }, 50);
    }
  }

  fetchData(isNetAvailable) {
    if (!isNetAvailable) {
      let data = {};
      let response = [];

      data = this.getListingData();

      setTimeout(() => {
        response = JSON.parse(data._W);

        if (response == null) {
          ToastAndroid.show('Data Not Synced', ToastAndroid.SHORT);
          return;
        }

        this.setState({
          mainResp: response,

          pendingData: this.getFiltered_Status_Data(response, 5),

          approvedData: this.getFiltered_Status_Data(response, 6),

          closedData: this.getFiltered_Status_Data(response, 4),
        });

        this.setTripNoDropDown(response, this.state.currentTab);
      }, 200);
    } else {
      this.getSchedulerListAll(this.loginId);
    }
  }

  saveRemarksData = async remarksData => {
    try {
      await AsyncStorage.setItem('remarksData', JSON.stringify(remarksData));
    } catch (error) {
      console.log('Something went wrong', error);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    }
  };

  saveListingData = async schedData => {
    try {
      await AsyncStorage.setItem('schedData', JSON.stringify(schedData));
    } catch (error) {
      console.log('Something went wrong', error);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    }
  };

  getListingData = async () => {
    try {
      const value = await AsyncStorage.getItem('schedData');
      if (value !== null) {
        //console.log('getListingData: ', value);
      }
      return value;
    } catch (error) {
      console.log('Something went wrong', error);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    }
  };

  getFormData = async () => {
    try {
      const value = await AsyncStorage.getItem('formData');
      if (value !== null) {
        //console.log('getListingData: ', value);
      }
      return value;
    } catch (error) {
      console.log('Something went wrong', error);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    }
  };

  getFiltered_Date_Data(response, fromDate, toDate, Status) {
    let momentObj_start = moment(fromDate, 'DD-MM-YYYY'); //current format
    let startDate = moment(momentObj_start).format('YYYY-MM-DD'); // format for filteration

    let momentObj_end = moment(toDate, 'DD-MM-YYYY');
    let endDate = moment(momentObj_end).format('YYYY-MM-DD');

    var resultData = response.filter(resp => {
      let momentObj = moment(resp.ScheduledDate, 'DD-MM-YYYY');
      let date = moment(momentObj).format('YYYY-MM-DD');

      return date >= startDate && date <= endDate && resp.Trip_Status == Status;
    });
    return resultData;
  }

  getFiltered_Status_Data(response, Status) {
    const data = response.filter(x => x.Trip_Status == Status);
    return data;
  }

  getFiltered_By_TripNo_Status(response, bttrNo, status) {
    const data = response.filter(
      x => x.BTTR_No == bttrNo && x.Trip_Status == status,
    );
    return data;
  }

  getFiltered_By_TripStatus(response, status) {
    const data = response.filter(x => x.Trip_Status == status);

    return data;
  }

  getFiltered_By_Dates(response, bttrNo, status) {
    const data = response.filter(
      x => x.BTTR_No == bttrNo && x.Trip_Status == status,
    );
    return data;
  }

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

  sendAllFormsToServer = async () => {
    this.setState({isLoading: true});

    var arrayData = [];
    let responseData = '';

    responseData = this.getFormArray();
    setTimeout(() => {
      if (responseData._W != null) {
        responseData = JSON.parse(responseData._W);

        arrayData = responseData;
      }

      arrayData.forEach((data, index) => {
        return axios
          .post(BASE_URL + setDelivery, data, {
            headers: {
              'content-type': 'application/json',
            },
          })
          .then(async response => {
            if (response.data.ResultCode == 'S') {
              if (index == arrayData.length - 1) {
                ToastAndroid.show(
                  response.data.ResultStatus,
                  ToastAndroid.LONG,
                );
                try {
                  AsyncStorage.removeItem('formArray');
                  console.log('Data removed');
                } catch (exception) {
                  console.log(exception);
                }

                this.getSchedulerListAll(this.loginId);
              }
            } else {
              ToastAndroid.show(response.data.ResultStatus, ToastAndroid.SHORT);
            }
          })
          .catch(error => {
            console.error(error);
            this.setState({isLoading: false});
          })
          .finally(() => {
            //  this.setState({ isLoading: false })
          });
      });
    }, 50);
  };

  getSchedulerListAll(loginId) {
    this.setState({isLoading: true});

    axios
      .get(BASE_URL + getSchedulerList_DateAndAll, {
        params: {
          userid: loginId,
          From: '',
          To: '',
        },
      })
      .then(response => {
        ///////////////////////////////////////////////////////////////////////////////////

        // Tabsname:
        // For Decanter
        // Pending			Submitted
        // 1 == Scheduled		5 == Submitted
        // 3 == Unblocked

        // For Scheduler:
        // Field name: Trip_Status
        // Tabsname:
        // Pending			Approved		Closed
        // 5 == Submitted		6 == Approved		4 == Closed

        /////////////////////////////////////////////////////////////////////////////////////

        if (!response.data.length > 0) {
          ToastAndroid.show('No Data Found', ToastAndroid.SHORT);
          this.setState({isLoading: false});
          // return;
        }

        this.getRemarksMaster();

        this.requestLocationPermission();

        this.saveListingData(response.data);

        this.setState({
          mainResp: response.data,

          pendingData: this.getFiltered_Status_Data(response.data, 5),

          approvedData: this.getFiltered_Status_Data(response.data, 6),

          closedData: this.getFiltered_Status_Data(response.data, 4),
        });

        this.setTripNoDropDown(response.data, this.state.currentTab);
      })
      .catch(error => {
        console.error(error);
        this.setState({isLoading: false});
      })
      .finally(() => {
        // this.setState({ isLoading: false })
      });
  }

  getRemarksMaster() {
    axios
      .get(BASE_URL + getRemarksMaster)
      .then(response => {
        this.saveRemarksData(response.data);
      })
      .catch(error => {
        console.error(error);
        this.setState({isLoading: false});
      })
      .finally(() => {
        this.setState({isLoading: false});
      });
  }

  pendingTab() {
    return (
      <View>
        {/* View For Date */}
        <View style={styles.dateContainerStyle}>
          {/* From Date */}
          <View style={{flexDirection: 'row', alignContent: 'center'}}>
            <Text style={{alignSelf: 'center', marginStart: 15, marginEnd: 5}}>
              From
            </Text>

            {/* View For Border */}
            <View
              style={{
                marginEnd: 5,
                borderWidth: 1,
                borderColor: '#b2b2b2',
                borderRadius: 3,
              }}>
              <DatePicker
                date={this.state.dateFrom}
                mode="date"
                placeholder="Select date"
                format="DD-MM-YYYY"
                showIcon={true}
                iconSource={require('../assets/calender.png')}
                customStyles={{
                  dateIcon: {
                    position: 'relative',
                    marginEnd: 10,
                    width: 20,
                    height: 20,
                  },
                  dateInput: {
                    borderWidth: 0,
                  },
                }}
                onDateChange={date => {
                  this.setState({
                    dateFrom: date,
                    dateTo: '',
                    toDateMinRange: date,
                    tripPlaceHolder: 'Select Trip No\t',
                  });
                  this.onDateSelected();
                  this.setState({tripPlaceHolder: 'Select Trip No'});
                }}
              />
            </View>
          </View>

          {/* To Date */}
          <View style={{flexDirection: 'row', alignContent: 'center'}}>
            <Text style={{alignSelf: 'center'}}>To</Text>

            {/* View For Border */}
            <View
              style={{
                marginStart: 5,
                marginEnd: 15,
                borderWidth: 1,
                borderColor: '#b2b2b2',
                borderRadius: 3,
              }}>
              <DatePicker
                date={this.state.dateTo}
                mode="date"
                placeholder="Select date"
                format="DD-MM-YYYY"
                minDate={this.state.toDateMinRange}
                showIcon={true}
                iconSource={require('../assets/calender.png')}
                customStyles={{
                  dateIcon: {
                    position: 'relative',
                    marginEnd: 10,
                    width: 20,
                    height: 20,
                  },
                  dateInput: {
                    borderWidth: 0,
                  },
                }}
                onDateChange={date => {
                  this.setState({
                    dateTo: date,
                    tripPlaceHolder: 'Select Trip No\t',
                  });
                  this.onDateSelected();
                  this.setState({tripPlaceHolder: 'Select Trip No'});
                }}
              />
            </View>
          </View>
        </View>

        <CheckBox
          isChecked={this.state.isChecked}
          onClick={() => {
            setTimeout(() => {
              if (this.state.isChecked) {
                this.setState({
                  isChecked: false,
                });
              } else {
                this.setState({
                  isChecked: true,
                });
              }

              this.checkBoxClick(this.state.isChecked);
            }, 100);
          }}
          checkBoxColor={colors.primary}
          rightText={'All Pending Deliveries (TDLS)'}
          disabled={false}
          style={{marginStart: 15}}
        />

        <View style={styles.dropDownViewStyle}>
          <Dropdown
            icon={require('../assets/dropicon.png')}
            baseColor={'#fff'}
            iconColor={colors.grey}
            placeholder={'Select Trip No'}
            value={this.state.tripPlaceHolder}
            data={this.state.tripNoDropDownData}
            style={styles.dropDownStyle}
            underlineColor="transparent"
            onChangeText={value => this.getSelectedTripNo(value)}
          />
        </View>
      </View>
    );
  }

  onDateSelected() {
    if (this.state.currentTab == 0) {
      this.setState({
        pendingData: this.getFiltered_Date_Data(
          this.state.mainResp,
          this.state.dateFrom,
          this.state.dateTo,
          5,
        ),
      });
      this.setTripNoDropDown(this.state.pendingData, this.state.currentTab);
    } else if (this.state.currentTab == 1) {
      this.setState({
        approvedData: this.getFiltered_Date_Data(
          this.state.mainResp,
          this.state.dateFrom,
          this.state.dateTo,
          6,
        ),
      });
      this.setTripNoDropDown(this.state.approvedData, this.state.currentTab);
    } else {
      this.setState({
        closedData: this.getFiltered_Date_Data(
          this.state.mainResp,
          this.state.dateFrom,
          this.state.dateTo,
          4,
        ),
      });
      this.setTripNoDropDown(this.state.closedData, this.state.currentTab);
    }
  }

  checkBoxClick = isChecked => {
    if (isChecked) {
      this.setState({
        dateFrom: '',
        dateTo: '',
        tripPlaceHolder: 'Select Trip No\t',
      });

      if (this.state.currentTab == 0) {
        this.setState({
          pendingData: this.getFiltered_Status_Data(this.state.mainResp, 5),
        });
        this.setTripNoDropDown(this.state.pendingData, this.state.currentTab);
      } else if (this.state.currentTab == 1) {
        this.setState({
          approvedData: this.getFiltered_Status_Data(this.state.mainResp, 6),
        });
        this.setTripNoDropDown(this.state.approvedData, this.state.currentTab);
      } else {
        this.setState({
          closedData: this.getFiltered_Status_Data(this.state.mainResp, 4),
        });
        this.setTripNoDropDown(this.state.closedData, this.state.currentTab);
      }

      this.setState({tripPlaceHolder: 'Select Trip No'});
    }
  };

  setTripNoDropDown(response, whichTab) {
    //for preventing repeatition in trip drop down
    this.setState({tripNoDropDownData: []});

    let tabWiseTripNo = whichTab;

    if (this.state.currentTab == 0) {
      tabWiseTripNo = 5;
    } else if (this.state.currentTab == 1) {
      tabWiseTripNo = 6;
    } else {
      tabWiseTripNo = 4;
    }

    //for fetching unique trip no/bttr no from response
    const tripNo = this.getFiltered_By_TripStatus(response, tabWiseTripNo).map(
      x => x.BTTR_No,
    );

    const uniqueTripNo = [...new Set(tripNo)];

    for (var i = 0; i < uniqueTripNo.length; i++) {
      this.state.tripNoDropDownData.push({
        value: uniqueTripNo[i],
      });
    }
  }

  getSelectedTripNo = val => {
    this.setState({selectedTripNo: val, isChecked: false});
    console.log(this.state.selectedTripNo);
    // Tabs
    // 0 -- Pending
    // 1 -- Approved
    // 2 -- Closed

    if (this.state.currentTab == 0) {
      if (this.state.dateFrom != '' && this.state.dateTo != '') {
        // const dataFilteredByTripNo = this.getFiltered_By_TripNo_Status(this.state.pendingData, this.state.selectedTripNo, 5)
        const dataFilteredByTripNo = this.getFiltered_By_TripNo_Status(
          this.state.mainResp,
          this.state.selectedTripNo,
          5,
        );

        this.setState({pendingData: dataFilteredByTripNo});
      } else {
        const dataFilteredByTripNo = this.getFiltered_By_TripNo_Status(
          this.state.mainResp,
          this.state.selectedTripNo,
          5,
        );

        this.setState({pendingData: dataFilteredByTripNo});
      }
    } else if (this.state.currentTab == 1) {
      if (this.state.dateFrom != '' && this.state.dateTo != '') {
        // const dataFilteredByTripNo = this.getFiltered_By_TripNo_Status(this.state.approvedData, this.state.selectedTripNo, 6)
        const dataFilteredByTripNo = this.getFiltered_By_TripNo_Status(
          this.state.mainResp,
          this.state.selectedTripNo,
          6,
        );

        this.setState({approvedData: dataFilteredByTripNo});
      } else {
        const dataFilteredByTripNo = this.getFiltered_By_TripNo_Status(
          this.state.mainResp,
          this.state.selectedTripNo,
          6,
        );

        this.setState({approvedData: dataFilteredByTripNo});
      }
    } else {
      if (this.state.dateFrom != '' && this.state.dateTo != '') {
        // const dataFilteredByTripNo = this.getFiltered_By_TripNo_Status(this.state.closedData, this.state.selectedTripNo, 4)
        const dataFilteredByTripNo = this.getFiltered_By_TripNo_Status(
          this.state.mainResp,
          this.state.selectedTripNo,
          4,
        );

        this.setState({closedData: dataFilteredByTripNo});
      } else {
        const dataFilteredByTripNo = this.getFiltered_By_TripNo_Status(
          this.state.mainResp,
          this.state.selectedTripNo,
          4,
        );

        this.setState({closedData: dataFilteredByTripNo});
      }
    }
  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  onRequestClose() {
    this.setModalVisible(false);
  }

  searchData() {
    console.log('search function running');
    if (!this.state.tdlsNo) return;
    this.setState({loading: true});
    axios
      .get(BASE_URL + searchTdls, {
        params: {
          TDLSNo: this.state.tdlsNo,
        },
      })
      .then(response => {
        this.setState({loading: false});
        this.setState({tdlsData: response.data});
        if (response.data.TDLS_No) {
          this.setState({errorMsg: ''});
        } else {
          this.setState({errorMsg: 'TDLS No not found.'});
        }
      })
      .catch(err => {
        let errmsg = err.message;
        this.setState({loading: false});
        this.setState({tdlsData: {}});
        if (errmsg.endsWith('400')) {
          errmsg += '.\nError: The request is invalid.';
        }
        this.setState({errorMsg: errmsg});
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.box}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter TDLS No"
            value={this.state.tdlsNo}
            onChangeText={val => this.setState({tdlsNo: val})}
          />
          {!this.state.loading ? (
            <TouchableOpacity
              style={styles.btn}
              onPress={() => this.searchData()}>
              <Icon name="search" color="white" size={18} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btn} disabled={true}>
              <ActivityIndicator color="white" />
            </TouchableOpacity>
          )}
        </View>

        {this.state.tdlsData?.TDLS_No ? (
          <View style={styles.cardContainer}>
            <TDLSItemView
              tdlsNo={this.state.tdlsData.TDLS_No}
              bttrNo={this.state.tdlsData.BTTR_No}
              location={this.state.tdlsData.CustomerName}
              product={this.state.tdlsData.ProductName}
              status={this.state.tdlsData.Trip_StatusDec}
              statusNo={this.state.tdlsData.Trip_Status}
              tankerName={this.state.tdlsData.TankerShortName}
              touchView={() =>
                ToastAndroid.show(
                  this.state.tdlsData.id + '',
                  ToastAndroid.SHORT,
                )
              }
              openTdlsBtnClick={() => {
                this.props.navigation.navigate('TDLSForm', {
                  userData: this.state.tdlsData,
                  loginId: this.loginId,
                  catId: this.props.route.params.userData.LoginCategoryID,
                  onFormSubmission: this.onFormSubmission,
                });
              }}
              print={() => {
                this.setState({printData: this.state.tdlsData});
                setTimeout(() => {
                  if (this.state.tdlsData.Signature > 0) {
                    this.getAttachmentForPrint();
                  } else {
                    this.bluetoothWorkForPrinter();
                  }
                }, 200);
              }}
              key={this.state.tdlsData.TDLS_No}
            />
          </View>
        ) : (
          <View
            style={{
              marginTop: 40,
              alignItems: 'center',
            }}>
            <Text style={{color: 'red', fontSize: 15}}>
              {this.state.errorMsg}
            </Text>
          </View>
        )}
      </View>
    );
  }

  showFlatList = tdlsData => {
    return (
      <View style={{flex: 1}}>
        <TDLSItemView
          tdlsNo={item.TDLS_No}
          bttrNo={item.BTTR_No}
          location={item.CustomerName}
          product={item.ProductName}
          status={item.Trip_StatusDec}
          statusNo={item.Trip_Status}
          tankerName={item.TankerShortName}
          touchView={() => ToastAndroid.show(item.id + '', ToastAndroid.SHORT)}
          openTdlsBtnClick={() => {
            this.props.navigation.navigate(
              'TDLSForm',

              {
                userData: tdlsData[index],
                loginId: this.loginId,
                catId: this.props.route.params.userData.LoginCategoryID,
                onFormSubmission: this.onFormSubmission,
              },
            );
          }}
          print={() => {
            this.setState({printData: tdlsData[index]});
            setTimeout(() => {
              if (item.Signature > 0) {
                this.getAttachmentForPrint();
              } else {
                this.bluetoothWorkForPrinter();
              }
            }, 200);
          }}
          key={item.TDLS_No}
        />
      </View>
    );
  };

  CheckConnectivity = () => {
    if (Platform.OS === 'android') {
      NetInfo.fetch().then(networkState => {
        setTimeout(() => {
          this.setState({isNetAvailable: networkState.isInternetReachable});
        }, 100);
      });
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    paddingStart: 20,
    paddingEnd: 20,
    paddingTop: 30,
  },
  box: {
    flexDirection: 'row',
  },
  input: {
    fontSize: 15,
    flex: 0.9,
    padding: 12,
    borderWidth: 0.3,
    borderRightWidth: 0,
    borderBottomLeftRadius: 5,
    borderTopLeftRadius: 5,
  },
  btn: {
    flex: 0.1,
    backgroundColor: colors.primary,
    padding: 12,
    alignItems: 'center',
    borderBottomRightRadius: 5,
    borderTopRightRadius: 5,
  },
  cardContainer: {
    marginTop: 40,
    marginStart: -20,
  },
});
