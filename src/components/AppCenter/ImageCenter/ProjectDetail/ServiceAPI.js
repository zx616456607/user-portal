/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ServiceAPI component
 *
 * v0.1 - 2017-6-9
 * @author BaiYu
 */
import React, { Component } from 'react'
import { Table, Spin, Row, Col } from 'antd'
import { connect } from 'react-redux'
import { loadRepositoriesTagConfigInfo } from '../../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../../constants'
import './style/ServiceAPI.less'
import {encodeImageFullname} from "../../../../common/tools";
import { injectIntl } from 'react-intl'
import serviceApiIntl from './intl/serviceApiIntl'
let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  formatEnv: function (envList) {
    //this function for format the env list ,change the single elem to an new json
    let newList = new Array();
    envList.forEach((item) => {
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
    const { formatMessage } = this.props.intl
    let config = this.props.config;
    let showList = []
    if (!!config) {
      showList = this.formatEnv(config);
    }
    const columns = [{
      title: formatMessage(serviceApiIntl.variableName),
      dataIndex: 'envName',
      width: '30%'
    }, {
      title: formatMessage(serviceApiIntl.defaultValue),
      dataIndex: 'envData',
      width: '70%'
    }]
    return (
      <Table
        columns={columns}
        dataSource={showList}
        bordered
        pagination={false}
      />
    );
  }
});
MyComponent = injectIntl(MyComponent, {
  withRef: true
})

class ServiceAPI extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { registry, loadRepositoriesTagConfigInfo, harbor } = this.props;
    const { fullname, imageTags} = this.props;
    let processedName = encodeImageFullname(fullname)
    loadRepositoriesTagConfigInfo(harbor, registry, processedName, imageTags);
  }
  componentWillReceiveProps(nextProps) {
    const newImagename = nextProps.fullname
    const newImageTag = nextProps.imageTags
    const { registry, loadRepositoriesTagConfigInfo, harbor } = this.props;
    const { fullname, imageTags} = this.props;
    if (newImagename !== fullname || imageTags !== newImageTag) {
      let processedName = encodeImageFullname(newImagename)
      loadRepositoriesTagConfigInfo(harbor, registry, processedName, newImageTag);
    }
  }
  render() {
    const { formatMessage } = this.props.intl
    const { isFetching, configList } = this.props
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!configList) {
      return (
        <div style={{lineHeight:'50px'}}>{formatMessage(serviceApiIntl.noDataTxt)}</div>
      )
    }

    let portsShow = null, dataStorageShow = [], cmdShow = null, entrypointShow = null;
    let ports = configList.containerPorts || null
    if (!!ports) {
      portsShow = ports.map(item => item).join('，')
    }
    let dataStorage = configList.mountPath;
    if (dataStorage && Object.keys(dataStorage).length) {
      for(let key in dataStorage){
        dataStorageShow.push(<p key={key}>- {key}</p>)
      }
      //dataStorageShow = dataStorage.map((item) => {
      //  return (
      //    <p>&nbsp;&nbsp;&nbsp;&nbsp; - {item}</p>
      //  )
      //});
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
    let size = 0;
    let unit = ' K';
    if (configList.sizeInfo && configList.sizeInfo.totalSize > 0) {
      size = configList.sizeInfo.totalSize;
      if (size > 1024) {
        size = Math.ceil(size /1024)
      }
      if (size > 1024) {
        size = Math.ceil(size /1024)
        unit = ' M'
      }
      if (size > 1024) {
        size = Math.ceil(size /1024)
        unit = ' G'
      }
    }
    let { defaultEnv } = configList;
    return (
      <div className="imageServiceAPI" key='imageserviceapi'>
        <Row>
          <Col span={6}>
            {formatMessage(serviceApiIntl.servicePort)}
          </Col>
          <Col span={18}>
            {portsShow ? portsShow:formatMessage(serviceApiIntl.portUndefined)}
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            {formatMessage(serviceApiIntl.storage)}
          </Col>
          <Col span={18}>
            {dataStorageShow.length ? dataStorageShow :formatMessage(serviceApiIntl.storageUndefined)}
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            {formatMessage(serviceApiIntl.runCommandsAndParameters)}
          </Col>
          <Col span={18}>
            {entrypointShow}&nbsp;{cmdShow}
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            {formatMessage(serviceApiIntl.size)}
          </Col>
          <Col span={18}>
            {(size > 0) ? size + unit : formatMessage(serviceApiIntl.unknown)}
          </Col>
        </Row>
        <Row>{formatMessage(serviceApiIntl.definitionOfEnv)}</Row>
        <MyComponent config={defaultEnv} />
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultImageDetailTagConfig = {
    isFetching: false,
    registry: DEFAULT_REGISTRY
  }
  const { imageTagConfig } = state.harbor
  const configList =  imageTagConfig[DEFAULT_REGISTRY] || defaultImageDetailTagConfig
  // const { registry, tag, isFetching, server, configList } = otherTagConfig || defaultImageDetailTagConfig
  const tag = props.imageTags

  let list = {}
  if(configList[tag]){
    list = configList[tag]
  }

  const { cluster } =  state.entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    registry: DEFAULT_REGISTRY,
    registryServer: configList.server,
    configList: list,
    isFetching: configList.isFetching,
    tag,
    harbor,
  }
}

ServiceAPI.propTypes = {
  //
}

export default connect(mapStateToProps, {
  loadRepositoriesTagConfigInfo
})(injectIntl(ServiceAPI, { withRef: true }));
