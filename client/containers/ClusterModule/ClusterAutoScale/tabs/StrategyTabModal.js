/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2018-04-08
 * @author rensiwei
 */
import React from 'react'
import { Modal, Button, Input, Select, Row, Col, Form, Spin, Icon } from 'antd'
import '../style/tabModal.less'
import classNames from 'classnames'
import * as autoScalerActions from '../../../../actions/clusterAutoScaler';
import { connect } from 'react-redux';
import _ from 'lodash';
import NotificationHandler from '../../../../../src/components/Notification';

const notify = new NotificationHandler();
const Option = Select.Option;
const FormItem = Form.Item;
let isGetParams = true; //是否获取接口数据
let isEdit = false;
const disabledIcons = ["aws", "azure", "ali"]; //不支持的资源池

class Tab2Modal extends React.Component {
  clickIcon = (e) => {
    let obj = e.target.parentElement.attributes['data-name'] || e.target.attributes['data-name'];
    if(!!e.target.className && e.target.className.indexOf("selectedBox") > -1){ return; }
    if(!!e.target.parentElement.className && e.target.parentElement.className.indexOf("selectedBox") > -1){ return; }
    if(this.currentIcon === obj.value){ return; }
    if(!!e.target.className && e.target.className.indexOf("Dis") > -1){ return; }
    if(!!e.target.parentElement.className && e.target.parentElement.className.indexOf("Dis") > -1){ return; }
    this.setState({currentIcon: obj.value});
  }
  state = {
    currentIcon: "",
    selectValue: "",
    disabled: false,
    isShowPassword: false,
    isPasswordReadOnly: true, //防止密码填充表单
    submitLoading: false,
  }
  componentDidMount() {
    //接收参数
    //this.getQueryData();
  }
  componentWillReceiveProps(next) {
    const _that = this, currData = next.currData;
    setTimeout(() => {
      if(isEdit && !!currData){
        _that.setState({
          disabled: true,
          currentIcon: currData.iaas,
          selectValue: currData.cluster,
        });
      }
      if(!next.visible){
        _that.setState({
          disabled: false,
          currentIcon: "",
          selectValue: "",
        })
      }
    }, 200);
    if(isGetParams && next.visible){
      isGetParams = false;
      this.getQueryData();
      return;
    }
    // if(!this.props.visible){
    //   isGetParams = true;
    // }
    if( next.isEdit && !!next.currData){
      isEdit = true;
    }else{ isEdit = false }
  }
  getQueryData(){
    const { getAutoScalerClusterList } = this.props;
    getAutoScalerClusterList();
  }
  onChange = (value) => {
    this.setState({
      selectValue: value,
      //currentIcon: "",
    })
    return value;
  }
  checkParams = () => {
    return this.checkIaas() && this.checkCluster()
  }
  checkIaas = () => {
    let b = true;
    if(!!!this.state.currentIcon){
      notify.warn('请选择Iaas平台');
      b = false;
    }
    return b;
  }
  checkCluster = () => {
    let b = true;
    if(!!!this.state.selectValue){
      notify.warn('请选择容器集群');
      b = false;
    }
    return b;
  }
  onCancel = () => {
    this.props.form.resetFields();
    this.props.onCancel(this.resetState);
  }
  resetState = () => {
    this.setState({
      currentIcon: "",
      selectValue: "",
      disabled: false,
      isShowPassword: false,
      isPasswordReadOnly: true, //防止密码填充表单
      submitLoading: false,
    });
  }
  onTab2ModalOk = () => {
    if(!this.checkParams()) return;
    this.props.form.validateFields((errors, values) => {
      if (!!errors || (errors === null && JSON.stringify(values) === "{}")) {
        console.log('Errors in form!!!');
        return;
      }
      this.setState({
        submitLoading: true,
      }, () => {
        //新增、修改接口
        const { addServer, updateServer, funcTab1, funcTab2 } = this.props;
        const date = new Date();
        const dateString = date.Format("yyyy-MM-dd HH:mm:ss")
        const params = Object.assign({}, {
          iaas: this.state.currentIcon,
          // name: this.state.name,
          // password: this.state.password,
          // server: this.state.vSphere,
          cluster: this.state.selectValue,
          date: dateString,
        });
        params.name = values.Username;
        params.password = values.Userpassword;
        params.server = values.server;
        if(isEdit){
          updateServer(params,{
            success: {
              func: () => {
                notify.success(`配置 ${params.name} 更新成功`);
                if(!!funcTab2){
                  funcTab2.loadData();
                  funcTab2.scope.setState({
                    isTab2ModalShow:false,
                    pagination: {
                      current: 1,
                      defaultCurrent: 1,
                      pageSize: 5,
                    }, //分页配置
                    paginationCurrent: 1,
                  });
                }
              },
              isAsync: true,
            },
            failed: {
              func: err => {
                const { statusCode, message } = err
                notify.warn(`更新配置 ${params.name} 失败，错误代码: ${statusCode}，${message}`);
                this.setState({
                  submitLoading: false,
                });
              },
            }
          })
        }else{
          addServer(params,
          {
            success: {
              func: () => {
                notify.success(`配置 ${params.name} 新建成功`)
                if(!!funcTab2){
                  funcTab2.loadData();
                  funcTab2.scope.setState({ isTab2ModalShow:false,
                    pagination: {
                      current: 1,
                      defaultCurrent: 1,
                      pageSize: 5,
                    }, //分页配置
                    paginationCurrent: 1, })
                }else if(!!funcTab1){
                  funcTab1.scope.onTab2ModalCancel();
                }
              },
              isAsync: true,
            },
            failed: {
              func: err => {
                const { statusCode, message } = err;
                notify.warn(`新建配置 ${params.name} 失败，错误代码: ${statusCode}，${message}`);
                this.setState({
                  submitLoading: false,
                });
              },
            }
          })
        }
      })
    })
  }
  changePasswordType = () => {
    this.setState({
      isShowPassword: !this.state.isShowPassword,
    })
  }
  render(){
    const { clusterList, isModalFetching, getData, isGetFormData } = this.props;
    const { getFieldProps } = this.props.form;
    const options = !!clusterList ?
    clusterList.map((o,i,objs) => <Select.Option disabled={!!this.props.allClusterIds && this.props.allClusterIds.indexOf(o.clusterid) > -1} key={i} value={o.clusterid}>{o.clustername}</Select.Option>) : null;
    !!options && options.unshift(<Select.Option key="-1" value=""><span className="optionValueNull">请选择容器集群</span></Select.Option>)
    let objCluster = _.filter(clusterList, {clusterid: this.state.selectValue})[0];
    let objProvider;
    !!objCluster ? objProvider = objCluster.provider : objProvider = {
      vmware: false,
      aws: false,
      azure: false,
      ali: false,
    }
    if(isEdit){ objProvider = {
      vmware: true,
      aws: true,
      azure: true,
      ali: true,
    }}
    const iconClass1 = classNames({
      'iconCon': true,
      'iconvmware': true,
      'selectedBox': this.state.currentIcon == "vmware",
      'iconConDis': disabledIcons.indexOf("vmware") > -1 || !!objProvider && objProvider["vmware"],//true 为已配置 false为未配置
    });
    const iconClass2 = classNames({
      'iconCon': true,
      'iconaws': true,
      'selectedBox': this.state.currentIcon == "aws",
      'iconConDis': disabledIcons.indexOf("aws") > -1 || !!objProvider && objProvider["aws"],
    });
    const iconClass3 = classNames({
      'iconCon': true,
      'iconazure': true,
      'selectedBox': this.state.currentIcon == "azure",
      'iconConDis': disabledIcons.indexOf("azure") > -1 || !!objProvider && objProvider["azure"],
    });
    const iconClass4 = classNames({
      'iconCon': true,
      'iconali': true,
      'selectedBox': this.state.currentIcon == "ali",
      'iconConDis': disabledIcons.indexOf("ali") > -1 || !!objProvider && objProvider["ali"],
    });
    const formItemLargeLayout = {
      labelCol: { span: 6},
      wrapperCol: { span: 14}
    }
    const server = !!this.props.currData ? this.props.currData["server"] : ''
    const name = !!this.props.currData ? this.props.currData["name"] : ''
    const password = !!this.props.currData ? this.props.currData["password"] : ''
    return (
      <Modal
        className="aotuScalerModal"
        visible={this.props.visible}
        onOk={this.onTab2ModalOk}
        onCancel={this.onCancel}
        onClose={this.props.onClose}
        title="新建资源池配置"
        okText="保存"
        width="550"
        maskClosable={false}
        confirmLoading={this.state.submitLoading}
        >
        {isModalFetching ?

          <div className="loadingBox">
            <Spin size="large"/>
          </div>
          :
          <Form horizontal >
            <Row key="row1">
              <FormItem
                {...formItemLargeLayout}
                label="容器集群"
              >
                <Select disabled={this.state.disabled} value={this.state.selectValue} onChange={(value) => {this.onChange(value)}} placeholder="请选择容器集群" style={{width: "100%", }}>
                  {options}
                </Select>
              </FormItem>
            </Row>
            <div className="bottom-line"></div>
            <div className="topIconContainer">
              <div className={iconClass1} data-name="vmware" onClick={this.clickIcon}>
                <div className="icon"></div>
                <div className="name">vmware</div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div className={iconClass2} data-name="aws" onClick={this.clickIcon}>
              <div className="icon"></div>
                <div className="name">aws</div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div className={iconClass3} data-name="azure" onClick={this.clickIcon}>
              <div className="icon"></div>
                <div className="name">azure</div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div className={iconClass4} data-name="ali" onClick={this.clickIcon}>
              <div className="icon"></div>
                <div className="name">aliyun</div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div style={{clear:"both"}}></div>
            </div>
            <div className="bottom-line"></div>
            <div className="formContainer" style={{paddingTop: 20}}>
              <Row key="row2">
                <FormItem
                  {...formItemLargeLayout}
                  label="vSphere地址"
                >
                  <Input {...getFieldProps('server', { initialValue: server,
                    validate: [{
                      rules: [
                        { required: true, message: '请输入vSphere地址' },
                      ],
                      trigger: ['onBlur', 'onChange'] ,
                    }],
                  },
                  )} placeholder="请输入vSphere地址" />
                </FormItem>
              </Row>
              <Row key="row3">
                <FormItem
                  {...formItemLargeLayout}
                  label="登录用户名"
                >
                  <Input {...getFieldProps('Username', { initialValue: name,
                    validate: [{
                      rules: [
                        { required: true, message: '请输入登录用户名' },
                      ],
                      trigger: ['onBlur', 'onChange'] ,
                    }],
                  },
                  )} placeholder="请输入登录用户名" />
                </FormItem>
              </Row>
              <Row key="row4">
                <FormItem
                  {...formItemLargeLayout}
                  label="登录密码"
                >
                  <Input {...getFieldProps('Userpassword', { initialValue: password,
                        validate: [{
                          rules: [
                            { required: true, message: '请输入登录密码' },
                          ],
                          trigger: ['onBlur', 'onChange'] ,
                        }],
                      }
                      )} autoComplete="new-password"
                      readOnly={this.state.isPasswordReadOnly}
                      onFocus={() => this.setState({ isPasswordReadOnly: false })}
                      onBlur={() => this.setState({ isPasswordReadOnly: true })}
                      type={this.state.isShowPassword ? "text" : "password"} placeholder="请输入登录密码" />
                  {
                    this.state.isShowPassword ?
                    <Icon className="iconEye" type="eye-o" onClick={this.changePasswordType} />
                    :
                    <Icon className="iconEye" type="eye" onClick={this.changePasswordType} />
                  }
                </FormItem>
              </Row>
            </div>
          </Form>
        }
      </Modal>
    )
  }
};
/**
 * 日期转字符串
 * @param fmt
 * @returns
 */
Date.prototype.Format = function (fmt) {
  var o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "H+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
  };
  if (/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o){
      if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      }
  }
  return fmt;
}

Tab2Modal = Form.create()(Tab2Modal);

const mapStateToProps = state => {
  const { appAutoScaler } = state;
  const { getAutoScalerClusterList } = appAutoScaler;
  const { clusterList, isModalFetching } = getAutoScalerClusterList || {clusterList: [], isModalFetching: false};
  return {
    clusterList,
    isModalFetching,
  };
};

export default connect(mapStateToProps, {
  getAutoScalerClusterList: autoScalerActions.getAutoScalerClusterList,
  addServer: autoScalerActions.createServer,
  updateServer: autoScalerActions.updateServer,
})(Tab2Modal);