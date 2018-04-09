import React from 'react'
import { Modal, Button, Input, Select, Row, Col, Form, Spin } from 'antd'
import '../style/tabModal.less'
import classNames from 'classNames'
import * as autoScalerActions from '../../../../actions/clusterAutoScaler';
import { connect } from 'react-redux';
import _ from 'lodash';
const Option = Select.Option;
const FormItem = Form.Item;
let randomKey = Math.random();//重置表单
let isGetParams = true; //是否获取接口数据
let disabledIconCon = ["vmware", "aws", "azure", "ali"]; //禁用的图标按钮集合


class Tab2ModalContent extends React.Component {
  clickIcon = (e) => {
    let obj = e.target.parentElement.attributes['data-name'] || e.target.attributes['data-name'];
    if(this.currentIcon == obj.value){ return; }//disabledIconCon.indexOf(obj.value) > -1 ||
    this.setState({currentIcon: obj.value});
  }
  state = {
    current: "0",
    currentIcon: "",
    selectValue: "",
  }
  // componentWillReceiveProps() {
  //   //接收参数
  //   if(!this.props.isGetData)return;
  //   const { getClusterList } = this.props;
  //   getClusterList();
  // }
  componentDidMount() {
    //接收参数
   this.getData();
  }
  getData(){
    const { getClusterList } = this.props;
    getClusterList();
  }
  fetching(){
    return (
      <div className="loadingBox">
        <Spin size="large"/>
      </div>
    );
  }
  onChange(value){
    this.setState({
      selectValue: value,
      currentIcon: ""
    })
    return value;
  }
  render(){
    const { clusterList, isFetching, getServerList } = this.props;
    if (isFetching) {
      return this.fetching();
    }
    if(this.props.isShow && isGetParams){
      isGetParams = false;
      this.getData();
      return this.fetching();
    }
    if(!this.props.isShow){
      isGetParams = true;
    }
    const options = !!clusterList ?
    clusterList.map((o,i,objs) => <Select.Option key={i} value={o.clusterid}>{o.clustername}</Select.Option>) : null;

    const objDisabled = _.filter(clusterList, {clusterid: this.state.selectValue})[0];
    const iconClass1 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "vmware",
      'iconConDis': !!objDisabled ? !!!objDisabled["vmware"] : true,
    });
    const iconClass2 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "aws",
      'iconConDis': !!objDisabled ? !!!objDisabled["aws"] : true,
    });
    const iconClass3 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "azure",
      'iconConDis': !!objDisabled ? !!!objDisabled["azure"] : true,
    });
    const iconClass4 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "ali",
      'iconConDis': !!objDisabled ? !!!objDisabled["ali"] : true,
    });
    const formItemLargeLayout = {
      labelCol: { span: 6},
      wrapperCol: { span: 14}
    }
    if(!this.props.visible) randomKey = Math.random();//重置表单
    return (
      <div
        key={randomKey}
      >
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
        <div className="formContainer">
          <Row key="row1">
            <FormItem
              {...formItemLargeLayout}
              label="容器集群"
            >
              <Select value={this.state.selectValue} onChange={(value) => {this.onChange(value)}} placeholder="请选择容器集群" style={{width: "100%", }}>
                {/* <Option value="0">请选择容器集群</Option> */}
                {options}
              </Select>
            </FormItem>
          </Row>
          <Row key="row2">
            <FormItem
              {...formItemLargeLayout}
              label="vSphere"
            >
              <Input  placeholder="请输入vSphere" />
            </FormItem>
          </Row>
          <Row key="row3">
            <FormItem
              {...formItemLargeLayout}
              label="登录用户名"
            >
              <Input  placeholder="请输入登录用户名" />
            </FormItem>
          </Row>
          <Row key="row4">
            <FormItem
              {...formItemLargeLayout}
              label="登录密码"
            >
              <Input  placeholder="请输入登录密码" />
            </FormItem>
          </Row>
        </div>
      </div>
    )
  }
};

const mapStateToProps = state => {
  const { appAutoScaler } = state;
  const { getClusterList } = appAutoScaler;
  const { clusterList, isFetching } = getClusterList || {clusterList: [], isFetching: false};

  return {
    clusterList,
    isFetching,
  };
};

export default connect(mapStateToProps, {
  getClusterList: autoScalerActions.getClusterList,
})(Tab2ModalContent);
