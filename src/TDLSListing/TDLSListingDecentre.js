import React, {Component, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ToastAndroid,
  PermissionsAndroid,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {ms, ScaledSheet} from 'react-native-size-matters';
import {Container, Tab, Tabs, TabHeading} from 'native-base';
import TDLSItemView from './itemview/TdlsItemView';
import axios from 'axios';
import DatePicker from 'react-native-datepicker';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import CheckBox from 'react-native-check-box';
import {colors} from '../config';
import {BASE_URL} from '../config/constant';
import {getDecanterList_DateAndAll} from '../config/constant';
import {getRemarksMaster} from '../config/constant';
import {setDelivery} from '../config/constant';
import moment from 'moment';
import Loader from '../appComponent/Loader';
import * as NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-community/async-storage';
import {
  BluetoothManager,
  BluetoothEscposPrinter,
  BluetoothTscPrinter,
} from 'react-native-bluetooth-escpos-printer';
import {Modal} from 'react-native-paper';
import ToastExample from '../config/ToastExample';
import {getAttachment} from '../config/constant';
import {convertDateString} from '../appComponent/DateConversion';

export default class TDLSListingDecentre extends Component {
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
      submittedData: [],
      currentTab: 0,
      isLoading: false,
      isNetAvailable: false,
      isSync: false,
      signatureUri: '0',
    };
  }

  //userID
  loginId = this.props.route.params.userData.LoginId;

  componentDidMount() {
    NetInfo.fetch().then(networkState => {
      screen = this.props.route.params.screen;

      if (screen == 1) this.fetchData(false);
      else this.fetchData(networkState.isInternetReachable);
    });
  }

  componentWillReceiveProps(nextProps) {
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
              '\n' +
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
        this.setState({signatureUri: '0'});

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
    // let netweight = this.state.printData.tanker_content_diff + " KG" + '\n';

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
    let comments = this.state.printData.Additional_Remarks
      ? this.state.printData.Additional_Remarks
      : '\n';
    let sig =
      this.state.printData.Signature.length > 100
        ? this.state.printData.Signature
        : this.state.signatureUri == '0'
        ? ''
        : this.state.signatureUri;

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

  onFormSubmission = (isSubmitSuccessfully, response) => {
    setTimeout(() => {
      if (isSubmitSuccessfully) {
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
      //ToastAndroid.show("No Data Found", ToastAndroid.SHORT)
      return;
    }

    this.saveListingData(response);

    this.setState({
      mainResp: response,

      pendingData: this.getFiltered_Status_Data_Pending(response),

      submittedData: this.getFiltered_Status_Data_Submitted(response),
    });

    this.setTripNoDropDown(response, this.state.currentTab);
  }

  onBackPressDataRcvd = () => {
    setTimeout(() => {
      this.setState({
        currentTab: this.state.currentTab,
        dateFrom: '',
        dateTo: '',
        isChecked: false,
        tripPlaceHolder: 'Select Trip No\t',
      });

      this.setTripNoDropDown(this.state.mainResp, this.state.currentTab);

      this.saveSubmittedFormData_withDBupdate_onBack(false);

      this.setState({tripPlaceHolder: 'Select Trip No'});
    }, 50);
  };

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
      }, 300);
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

          pendingData: this.getFiltered_Status_Data_Pending(response),

          submittedData: this.getFiltered_Status_Data_Submitted(response),
        });

        this.setTripNoDropDown(response, this.state.currentTab);
      }, 200);
    } else {
      this.getDecentreListAll(this.loginId);
    }
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

  saveRemarksData = async remarksData => {
    try {
      await AsyncStorage.setItem('remarksData', JSON.stringify(remarksData));
    } catch (error) {
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    }
  };

  saveListingData = async schedData => {
    try {
      await AsyncStorage.setItem('decData', JSON.stringify(schedData));
    } catch (error) {
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    }
  };

  getListingData = async () => {
    try {
      const value = await AsyncStorage.getItem('decData');
      if (value !== null) {
        //console.log('getListingData: ', value);
      }
      return value;
    } catch (error) {
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
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    }
  };

  getFiltered_Date_Data_Pending(response, fromDate, toDate) {
    let momentObj_start = moment(fromDate, 'DD-MM-YYYY'); //current format
    let startDate = moment(momentObj_start).format('YYYY-MM-DD'); // format for filteration

    let momentObj_end = moment(toDate, 'DD-MM-YYYY');
    let endDate = moment(momentObj_end).format('YYYY-MM-DD');

    var resultData = response.filter(resp => {
      let momentObj = moment(resp.ScheduledDate, 'DD-MM-YYYY');
      let date = moment(momentObj).format('YYYY-MM-DD');

      return (
        date >= startDate &&
        date <= endDate &&
        (resp.Trip_Status == 1 || resp.Trip_Status == 3)
      );
    });
    return resultData;
  }

  getFiltered_Date_Data_Submitted(response, fromDate, toDate) {
    let momentObj_start = moment(fromDate, 'DD-MM-YYYY'); //current format
    let startDate = moment(momentObj_start).format('YYYY-MM-DD'); // format for filteration

    let momentObj_end = moment(toDate, 'DD-MM-YYYY');
    let endDate = moment(momentObj_end).format('YYYY-MM-DD');

    var resultData = response.filter(resp => {
      let momentObj = moment(resp.ScheduledDate, 'DD-MM-YYYY');
      let date = moment(momentObj).format('YYYY-MM-DD');

      return date >= startDate && date <= endDate && resp.Trip_Status == 5;
    });
    return resultData;
  }

  getFiltered_Status_Data_Pending(response) {
    const data = response.filter(x => x.Trip_Status == 1 || x.Trip_Status == 3);
    return data;
  }

  getFiltered_Status_Data_Submitted(response) {
    const data = response.filter(x => x.Trip_Status == 5);
    return data;
  }

  getFiltered_By_TripNo_Status_Pending(response, bttrNo) {
    const data = response.filter(
      x => x.BTTR_No == bttrNo && (x.Trip_Status == 1 || x.Trip_Status == 3),
    );
    return data;
  }
  getFiltered_By_TripNo_Status_Submitted(response, bttrNo) {
    const data = response.filter(
      x => x.BTTR_No == bttrNo && x.Trip_Status == 5,
    );
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

                this.getDecentreListAll(this.loginId);
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

  getDecentreListAll(loginId) {
    this.setState({isLoading: true});
    axios
      .get(BASE_URL + getDecanterList_DateAndAll, {
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
          //   return;
        }

        this.getRemarksMaster();

        this.requestLocationPermission();

        this.saveListingData(response.data);

        this.setState({
          mainResp: response.data,

          pendingData: this.getFiltered_Status_Data_Pending(response.data),

          submittedData: this.getFiltered_Status_Data_Submitted(response.data),
        });

        this.setTripNoDropDown(response.data, this.state.currentTab);
      })
      .catch(error => {
        console.error(error);
        this.setState({isLoading: false});
      })
      .finally(() => {
        //this.setState({ isLoading: false })
      });
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

  getFiltered_By_TripNo_Pending(response) {
    const data = response.filter(x => x.Trip_Status == 1 || x.Trip_Status == 3);

    return data;
  }
  getFiltered_By_TripNo_Submitted(response) {
    const data = response.filter(x => x.Trip_Status == 5);

    return data;
  }

  setTripNoDropDown(response, whichTab) {
    //for preventing repeatition in trip drop down
    this.setState({tripNoDropDownData: []});

    let tabWiseTripNo = whichTab;

    let tripNo = 0;
    if (this.state.currentTab == 0) {
      tripNo = this.getFiltered_By_TripNo_Pending(response).map(x => x.BTTR_No);
    } else if (this.state.currentTab == 1) {
      tripNo = this.getFiltered_By_TripNo_Submitted(response).map(
        x => x.BTTR_No,
      );
    }

    //for fetching unique trip no/bttr no from response
    // const tripNo = this.getFiltered_By_TripStatus(response).map(x => x.BTTR_No);

    const uniqueTripNo = [...new Set(tripNo)];

    for (var i = 0; i < uniqueTripNo.length; i++) {
      this.state.tripNoDropDownData.push({
        value: uniqueTripNo[i],
      });
    }
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
        pendingData: this.getFiltered_Date_Data_Pending(
          this.state.mainResp,
          this.state.dateFrom,
          this.state.dateTo,
        ),
      });
      this.setTripNoDropDown(this.state.pendingData, this.state.currentTab);
    } else {
      this.setState({
        submittedData: this.getFiltered_Date_Data_Submitted(
          this.state.mainResp,
          this.state.dateFrom,
          this.state.dateTo,
        ),
      });
      this.setTripNoDropDown(this.state.submittedData, this.state.currentTab);
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
          pendingData: this.getFiltered_Status_Data_Pending(
            this.state.mainResp,
          ),
        });
        this.setTripNoDropDown(this.state.pendingData, this.state.currentTab);
      } else {
        this.setState({
          submittedData: this.getFiltered_Status_Data_Submitted(
            this.state.mainResp,
          ),
        });
        this.setTripNoDropDown(this.state.submittedData, this.state.currentTab);
      }

      this.setState({tripPlaceHolder: 'Select Trip No'});
    }
  };

  getSelectedTripNo = val => {
    this.setState({selectedTripNo: val, isChecked: false});
    console.log(this.state.selectedTripNo);
    // Tabs
    // 0 -- Pending
    // 1 -- Approved
    // 2 -- Closed

    if (this.state.currentTab == 0) {
      if (this.state.dateFrom != '' && this.state.dateTo != '') {
        // const dataFilteredByTripNo = this.getFiltered_By_TripNo_Status_Pending(this.state.pendingData, this.state.selectedTripNo)
        const dataFilteredByTripNo = this.getFiltered_By_TripNo_Status_Pending(
          this.state.mainResp,
          this.state.selectedTripNo,
        );

        this.setState({pendingData: dataFilteredByTripNo});
      } else {
        const dataFilteredByTripNo = this.getFiltered_By_TripNo_Status_Pending(
          this.state.mainResp,
          this.state.selectedTripNo,
        );

        this.setState({pendingData: dataFilteredByTripNo});
      }
    } else {
      if (this.state.dateFrom != '' && this.state.dateTo != '') {
        // const dataFilteredByTripNo = this.getFiltered_By_TripNo_Status_Submitted(this.state.closedData, this.state.selectedTripNo)
        const dataFilteredByTripNo =
          this.getFiltered_By_TripNo_Status_Submitted(
            this.state.mainResp,
            this.state.selectedTripNo,
          );

        this.setState({submittedData: dataFilteredByTripNo});
      } else {
        const dataFilteredByTripNo =
          this.getFiltered_By_TripNo_Status_Submitted(
            this.state.mainResp,
            this.state.selectedTripNo,
            4,
          );

        this.setState({submittedData: dataFilteredByTripNo});
      }
    }
  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  onRequestClose() {
    this.setModalVisible(false);
  }

  render() {
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        {/* separator line */}
        <View
          style={{
            borderBottomColor: 'black',
            borderBottomWidth: 0.5,
          }}
        />
        <StatusBar backgroundColor={colors.primary} />

        <Loader isLoading={this.state.isLoading} />

        <Tabs
          onChangeTab={tab => {
            setTimeout(() => {
              this.setState({
                currentTab: tab.i,
                dateFrom: '',
                dateTo: '',
                isChecked: false,
                tripPlaceHolder: 'Select Trip No\t',
              });
              this.setTripNoDropDown(this.state.mainResp, tab.i);
              this.fetchData(false);
              this.setState({tripPlaceHolder: 'Select Trip No'});

              console.log(this.state.currentTab);
            }, 300);
          }}
          tabBarInactiveTextColor={colors.grey}
          tabBarUnderlineStyle={{backgroundColor: colors.primary}}>
          <Tab
            style={{backgroundColor: '#ffffff'}}
            heading={
              <TabHeading style={{backgroundColor: colors.white}}>
                <Text style={{color: colors.primary}}>Pending</Text>
              </TabHeading>
            }>
            {this.pendingTab()}

            {this.showFlatList(this.state.pendingData)}
          </Tab>

          <Tab
            style={{backgroundColor: '#ffffff'}}
            heading={
              <TabHeading style={{backgroundColor: colors.white}}>
                <Text style={{color: colors.primary}}>Submitted</Text>
              </TabHeading>
            }>
            {this.pendingTab()}

            {this.showFlatList(this.state.submittedData)}
          </Tab>
        </Tabs>

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
                marginBottom: 10,
                marginTop: 10,
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

  showFlatList = tdlsData => {
    return (
      <View style={{flex: 1}}>
        <FlatList
          data={tdlsData}
          renderItem={({item, index}) => (
            <TDLSItemView
              tdlsNo={item.TDLS_No}
              bttrNo={item.BTTR_No}
              location={item.CustomerName}
              product={item.ProductName}
              status={item.Trip_StatusDec}
              statusNo={item.Trip_Status}
              tankerName={item.TankerShortName}
              touchView={() =>
                ToastAndroid.show(item.id + '', ToastAndroid.SHORT)
              }
              openTdlsBtnClick={() => {
                this.props.navigation.navigate('TDLSFormDecentre', {
                  userData: tdlsData[index],
                  loginId: this.loginId,
                  catId: this.props.route.params.userData.LoginCategoryID,
                  onFormSubmission: this.onFormSubmission,
                  onBackPressDataRcvd: this.onBackPressDataRcvd,
                });
              }}
              print={() => {
                this.setState({printData: tdlsData[index]});
                setTimeout(() => {
                  if (item.Signature.length > 100) {
                    this.bluetoothWorkForPrinter();
                  } else {
                    this.getAttachmentForPrint();
                  }
                }, 200);
              }}
              key={item.TDLS_No}
            />
          )}
          keyExtractor={item => item.TDLS_No}
          key={item => item.TDLS_No}
        />
      </View>
    );
  };
}
const styles = ScaledSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    marginTop: 100,
  },

  editText: {
    width: '70%',
    height: 50,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textShadowColor: 'black',
    marginTop: 30,
    color: 'black',
  },

  button: {
    marginTop: 30,
    width: '30%',
    borderColor: 'blue',
    borderWidth: 1,
    borderRadius: 8,
    elevation: 1,
  },

  scroll: {
    flex: 1,
    height: '100%',
    width: '100%',
  },

  tocenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeTabTextStyle: {
    color: '#105a72',
    fontFamily: 'Raleway-Regular',
  },

  textStyle: {
    color: 'red',
    fontFamily: 'Raleway-Regular',
  },
  mainTabView: {
    backgroundColor: '#1d1d27',
    height: 55,
  },
  tabStyle: {
    backgroundColor: 'white',
  },
  activetabStyle: {
    backgroundColor: 'red',
  },
  dateContainerStyle: {
    flexDirection: 'row',
    alignSelf: 'center',
    margin: '15@s',
  },
  dropDownViewStyle: {
    borderWidth: 0.5,
    borderColor: colors.grey2,
    backgroundColor: colors.white,
    margin: 15,
    marginStart: 18,
    marginEnd: 21,
    height: 50,
  },
  dropDownStyle: {
    height: 45,
    borderWidth: 0.5,
    borderColor: colors.white,
    backgroundColor: 'transparent',
  },
});
