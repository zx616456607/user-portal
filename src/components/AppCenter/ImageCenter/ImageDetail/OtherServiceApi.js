/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ServiceAPI component
 *
 * v0.1 - 2016-10-26
 * @author BaiYu
 */
import React, { Component } from 'react'
import { Card, Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { loadOtherDetailTagConfig} from '../../../../actions/app_center'
import './style/ServiceAPI.less'

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  formatEnv: function (envList) {
    //this function for format the env list ,change the single elem to an new json
    let newList = new Array();
    envList.map((item) => {
      let tempList = item.split("=");
      let tempElem = {
        "envName": tempList[0],
        "envData": tempList[1]
      }
      newList.push(tempElem);
    });
    return newList;
  },
  render: function () {
    let config = this.props.config;
    let items;
    if (!!config) {
      let showList = this.formatEnv(config);
      items = showList.map((item, index) => {
        return (
          <div className="apiItemDetail" key={index} >
            <span className="leftSpan">{item.envName}</span>
            <span className="rightSpan">{item.envData}</span>
            <div style={{ clear: "both" }}></div>
          </div>
        );
      });
    } else {
      items = (
        <div className="apiItemDetail" key="apiItemDetail" >
        </div>
      )
    }
    return (
      <div className="apiItemList">
        {items}
      </div>
    );
  }
});

class OtherServiceApi extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    console.log('loadConfigGroup', this.props)
    const { fullname, imageTag , imageId} = this.props;
    const config = {imageId, fullname, imageTag}
    this.props.loadOtherDetailTagConfig(config)
  }
  componentWillReceiveProps(nextPorps) {
    const { fullname, imageTag , imageId} = this.props;
    const config = {imageId, fullname, imageTag}
    const newImageDetail = nextPorps.fullname;
    if (newImageDetail != fullname) {
      this.props.loadOtherDetailTagConfig(config)
    }
  }
  render() {
    const { isFetching, configList } = this.props;
      if (!configList) return
    if (isFetching) {
      return (
        <Card className='loadingBox'>
          <Spin size='large' />
        </Card>
      )
    }
    let portsShow = null, dataStorageShow = null, cmdShow = null, entrypointShow = null;
    if (configList.hasOwnProperty('containerPorts')) {
      let ports = configList.containerPorts
      if (!!ports) {
        portsShow = ports.map((item) => {
          return (
            <p>容器端口:&nbsp;{item}</p>
          )
        });
      }

    }
    let dataStorage = configList.mountPath;
    if (!!dataStorage) {
      dataStorageShow = dataStorage.map((item) => {
        return (
          <p>数据存储器: &nbsp;{item}</p>
        )
      });
    }
    let { cmd, entrypoint } = configList;
    if (!!cmd) {
      cmdShow = cmd.map((item) => {
        return (
          <span>{item}&nbsp;</span>
        )
      });
    }
    if (!!entrypoint) {
      entrypointShow = entrypoint.map((item) => {
        return (
          <span>{item}&nbsp;</span>
        )
      });
    }
    let { env } = configList;
    return (
      <Card className="imageServiceAPI" key={portsShow}>
        {portsShow}
        {dataStorageShow}
        <p>运行命令及参数:&nbsp;{entrypointShow}{cmdShow}</p>
        <p>所需环境变量: </p>
        <div className="itemBox">
          <div className="title">
            <span className="leftSpan">变量名</span>
            <span className="rightSpan">镜像</span>
            <div style={{ clear: "both" }}></div>
          </div>
          <MyComponent config={env} />
        </div>
      </Card>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultImageDetailTagConfig = {
    isFetching: false,
    configList: []
  }
  const { otherTagConfig} = state.getImageTagConfig
  const { tag, isFetching, configList } = otherTagConfig || defaultImageDetailTagConfig
  
  return {
    configList,
    isFetching,
    tag
  }
}

OtherServiceApi.propTypes = {
  //
}
function mapDispatchToProps(dispatch) {
  return {
    loadOtherDetailTagConfig: (image) => {
      dispatch(loadOtherDetailTagConfig(image))
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(OtherServiceApi);