import React from 'react'
import { Modal, Button, Input, Select, Row, Col, Form, Spin } from 'antd'
import '../style/tabModal.less'
import classNames from 'classNames'
import * as autoScalerActions from '../../../../actions/clusterAutoScaler';
import { connect } from 'react-redux';
import _ from 'lodash';
import NotificationHandler from '../../../../../src/components/Notification';

const notify = new NotificationHandler();
const Option = Select.Option;
const FormItem = Form.Item;
let randomKey = Math.random();//重置表单
let isGetParams = true; //是否获取接口数据
let disabledIconCon = ["aws", "azure", "ali"]; //禁用的图标按钮集合
let isEdit = false;

class Tab2Modal extends React.Component {
  clickIcon = (e) => {
    let obj = e.target.parentElement.attributes['data-name'] || e.target.attributes['data-name'];
    if(this.currentIcon === obj.value){ return; }
    if(!!e.target.className && e.target.className.indexOf("Dis") > -1){ return; }
    if(!!e.target.parentElement.className && e.target.parentElement.className.indexOf("Dis") > -1){ return; }
    this.setState({currentIcon: obj.value});
  }
  state = {
    currentIcon: "",
    selectValue: "",
    name: "",
    password: "",
    vSphere: "",
    disabled: false,
  }
  componentDidMount() {
    //接收参数
    this.getQueryData();
  }
  componentWillReceiveProps() {
    if(isGetParams && this.props.visible){
      isGetParams = false;
      this.getQueryData();
    }
    if(!this.props.visible){
      isGetParams = true;
    }
    if( this.props.isEdit && !!this.props.currData){
      isEdit = true;
    }else{ isEdit = false }
  }
  getQueryData(){
    const { getAutoScalerClusterList } = this.props;
    const _that = this, currData = _that.props.currData;
    getAutoScalerClusterList().then(() => {
      if(isEdit){
        _that.setState({
          disabled: true,
          currentIcon: currData.issa,
          name: currData.name,
          password: currData.password,
          vSphere: currData.server,
          selectValue: currData.cluster,
        });
      }
      else{
        _that.setState({
          disabled: false,
          currentIcon: "",
          name: "",
          password: "",
          vSphere: "",
          selectValue: "",
        })
      }
    });
  }
  onChange = (value) => {
    this.setState({
      selectValue: value,
      currentIcon: "",
      name: "",
      password: "",
      vSphere: "",
    })
    return value;
  }
  onTab2ModalOk = () => {
    //新增、修改接口
    const { addServer, updateServer, funcTab1, funcTab2 } = this.props;
    const date = new Date();
    const dateString = date.Format("yyyy-MM-dd HH:mm:ss")
    const params = {
      issa: this.state.currentIcon,
      name: this.state.name,
      password: this.state.password,
      server: this.state.vSphere,
      cluster: this.state.selectValue,
      date: dateString,
    };
    if(isEdit){
      updateServer(params,{
        success: {
          func: () => {
            notify.success(`配置 ${params.name} 更新成功`);
            if(!!funcTab2){//tab2打开编辑页时 逻辑 同理funcTab1 todo
              func.loadData();
              func.scope.setState({
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
            const { statusCode } = err
            notify.error(`更新配置 ${params.name} 失败，错误代码: ${statusCode}`)
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
                func.loadData()
                func.scope.setState({ isTab2ModalShow:false,
                  pagination: {
                    current: 1,
                    defaultCurrent: 1,
                    pageSize: 5,
                  }, //分页配置
                  paginationCurrent: 1, })
              }
            },
            isAsync: true,
          },
          failed: {
            func: err => {
              const { statusCode } = err;
              notify.error(`新建配置 ${params.name} 失败，错误代码: ${statusCode}`)
            },
          }
        })
    }
  }
  inputvSphereChange = (e) => {
    this.setState({vSphere: e.target.value});
  }
  inputpasswordChange = (e) => {
    this.setState({password: e.target.value});
  }
  inputnameChange = (e) => {
    this.setState({name: e.target.value});
  }
  render(){
    const { clusterList, isModalFetching, getData, isGetFormData } = this.props;

    const options = !!clusterList ?
    clusterList.map((o,i,objs) => <Select.Option key={i} value={o.clusterid}>{o.clustername}</Select.Option>) : null;
    !!options && options.unshift(<Select.Option key="-1" value="">请选择容器集群</Select.Option>)
    let objDisabled = _.filter(clusterList, {clusterid: this.state.selectValue})[0];
    if(isEdit){ objDisabled = null; }
    const iconClass1 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "vmware",
      'iconConDis': disabledIconCon.indexOf("vmware") < 0 && !!objDisabled ? !!objDisabled["vmware"] : true,
    });
    const iconClass2 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "aws",
      'iconConDis': disabledIconCon.indexOf("aws") < 0 && !!objDisabled ? !!objDisabled["aws"] : true,
    });
    const iconClass3 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "azure",
      'iconConDis': disabledIconCon.indexOf("azure") < 0 && !!objDisabled ? !!objDisabled["azure"] : true,
    });
    const iconClass4 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "ali",
      'iconConDis': disabledIconCon.indexOf("ali") < 0 && !!objDisabled ? !!objDisabled["ali"] : true,
    });
    const formItemLargeLayout = {
      labelCol: { span: 6},
      wrapperCol: { span: 14}
    }
    if(!this.props.visible) randomKey = Math.random();//重置表单
    return (
      <Modal
        visible={this.props.visible}
        onOk={this.onTab2ModalOk}
        onCancel={this.props.onCancel}
        onClose={this.props.onClose}
        title="新建资源池配置"
        okText="保存"
        width="550"
        >
        {isModalFetching ?

          <div className="loadingBox">
            <Spin size="large"/>
          </div>
          :
          <div key={randomKey} >
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
              <Row key="row2">
                <FormItem
                  {...formItemLargeLayout}
                  label="vSphere地址"
                >
                  <Input value={this.state.vSphere} onChange={this.inputvSphereChange} placeholder="请输入vSphere地址" />
                </FormItem>
              </Row>
              <Row key="row3">
                <FormItem
                  {...formItemLargeLayout}
                  label="登录用户名"
                >
                  <Input value={this.state.name} onChange={this.inputnameChange} placeholder="请输入登录用户名" />
                </FormItem>
              </Row>
              <Row key="row4">
                <FormItem
                  {...formItemLargeLayout}
                  label="登录密码"
                >
                  <Input value={this.state.password} onChange={this.inputpasswordChange} placeholder="请输入登录密码" />
                </FormItem>
              </Row>
            </div>
          </div>
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
