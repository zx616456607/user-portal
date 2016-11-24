/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ServiceAPI component
 *
 * v0.1 - 2016-10-09
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card, Spin } from 'antd'
import { connect } from 'react-redux'
import { loadImageDetailTagConfig } from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'
import './style/ServiceAPI.less'

let MyComponent = React.createClass({
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
          No Data
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

class ServiceAPI extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentWillMount() {
    const { registry, loadImageDetailTagConfig } = this.props;
    const { fullname, imageTag} = this.props;
    loadImageDetailTagConfig(registry, fullname, imageTag);
  }
  render() {
    const { isFetching, configList } = this.props;
    if (isFetching) {
      return (
        <Card className='loadingBox'>
          <Spin size='large' />
        </Card>
      )
    }
    let portsShow = null, dataStorageShow = null, cmdShow = null, entrypointShow = null;
    let ports = configList.containerPorts || null
    if (!!ports) {
      portsShow = ports.map(item => item).join('，')
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
    let { defaultEnv } = configList;
    return (
      <Card className="imageServiceAPI" key='imageserviceapi'>
        <p>容器端口:&nbsp;{portsShow}</p>
        {dataStorageShow}
        <p>运行命令及参数：&nbsp;{entrypointShow}{cmdShow}</p>
        <div>大小：{(configList.sizeInfo && configList.sizeInfo.totalSize > 0) ? Math.ceil(configList.sizeInfo.totalSize / 1024) + ' K' : '未知'}</div>
        <p>所需环境变量: </p>
        <div className="itemBox">
          <div className="title">
            <span className="leftSpan">变量名</span>
            <span className="rightSpan">镜像</span>
            <div style={{ clear: "both" }}></div>
          </div>
          <MyComponent config={defaultEnv} />
        </div>
      </Card>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultImageDetailTagConfig = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    configList: []
  }
  const { imageTagConfig, otherTagConfig} = state.getImageTagConfig
  const { registry, tag, isFetching, server, configList } = imageTagConfig[DEFAULT_REGISTRY] || defaultImageDetailTagConfig
  // const { registry, tag, isFetching, server, configList } = otherTagConfig || defaultImageDetailTagConfig

  return {
    registry: DEFAULT_REGISTRY,
    registryServer: server,
    configList,
    isFetching,
    tag,
  }
}

ServiceAPI.propTypes = {
  //
}

export default connect(mapStateToProps, {
  loadImageDetailTagConfig
})(ServiceAPI);