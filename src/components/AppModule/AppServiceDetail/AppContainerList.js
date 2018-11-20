/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppDetail component
 *
 * v0.1 - 2016-09-13
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Checkbox, Button, Card, Menu, Spin, Tooltip, Tag, Icon } from 'antd'
import { Link } from 'react-router'
import { camelize } from 'humps'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/AppContainerList.less'
import { calcuDate } from '../../../common/tools'
import ContainerStatus from '../../TenxStatus/ContainerStatus'
import ContainerHeader from '../../../../client/containers/AppModule/AppServiceDetail/containerHeader'
import { injectIntl,  } from 'react-intl'
import ServiceCommonIntl, { AppServiceDetailIntl, AllServiceListIntl } from '../ServiceIntl'
import { getDeepValue } from '../../../../client/util/util';
import * as meshActions from '../../../actions/serviceMesh'
import TenxIcon from '@tenx-ui/icon/es/_old'

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  checkedFunc: function (e) {
    //check this item selected or not
    const {scope} = this.props;
    let oldList = scope.state.selectedList;
    if (oldList.includes(e)) {
      return true;
    } else {
      return false;
    }
  },
  onchange: function (e) {
    //single item selected function
    const {scope} = this.props;
    let oldList = scope.state.selectedList;
    if (oldList.includes(e)) {
      let index = oldList.indexOf(e);
      oldList.splice(index, 1);
    } else {
      oldList.push(e);
    }
    scope.setState({
      selectedList: oldList
    });
  },
  getImages(item) {
    let images = []
    item.spec.containers.map((container) => {
      images.push(container.image)
    })
    return images
  },
  render: function () {
    const { config, loading, serviceName, formatMessage } = this.props
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length < 1) {
      return (
        <div className='loadingBox' style={{clear:'both'}}>
          {formatMessage(AppServiceDetailIntl.noContainerObjec)}
        </div>
      )
    }
    const serviceDetail = this.props.serviceDetail || {}
    const serviceStatus = serviceDetail.status || {}
    const serviceReplicas = serviceDetail.spec && serviceDetail.spec.replicas
    let isRollingUpdate = serviceStatus.replicas > serviceReplicas
    const imagesSet = new Set()
    config.forEach(item => {
      imagesSet.add(this.getImages(item)[0])
    })
    const imagesList = Array.from(imagesSet)
    if (imagesList.length === 1) {
      isRollingUpdate = false
    }
    const annotations = serviceDetail.metadata && serviceDetail.metadata.annotations || {}
    const currentImages = JSON.parse(annotations['rollingupdate/target'] || '{}')
    const items = config.map((item) => {
      const imageArray = this.getImages(item)
      const images = imageArray.join(', ')
      const status = item.status || {}
      let isNew = false
      if (isRollingUpdate) {
        const image = currentImages[0] && currentImages[0].to || ''
        isNew = image === imageArray[0]
      }
      const ipv4Str = getDeepValue(item, [ 'metadata', 'annotations', 'cni.projectcalico.org/ipAddrs' ] )
      const ipv4Arr = ipv4Str && JSON.parse(ipv4Str)
      let lockItem = null
      ipv4Arr && ipv4Arr.length && ipv4Arr.forEach(item => {
        if (item === status.podIP) lockItem = true
      })
      return (
        <div className="containerDetail" key={item.metadata.name}>
          {/*(<div className="selectIconTitle commonData">
            <Checkbox checked={this.checkedFunc(item.id)} onChange={()=>this.onchange(item.id)}></Checkbox>
          </div>)*/}
          <div className="name commonData" style={{ marginLeft: 24 }} >
            <Tooltip placement="topLeft" title={item.metadata.name}>
              <Link to={`/app_manage/container/${item.metadata.name}`}>
                {
                  isRollingUpdate &&
                  <Tag className={isNew ? 'new-tag' : 'old-tag'}>
                  {isNew ? 'new' : 'old'}
                  </Tag>
                }
                {item.metadata.name}
              </Link>
            </Tooltip>
            {
              (this.props.istioFlag.filter(({ name }) => name === item.metadata.name)[0] || {}).value &&
              <div style={{ paddingTop: 4 }}>
              <Tooltip title={'已开启服务网格'}>
              <TenxIcon type="mesh" style={{ color: '#2db7f5', height: '16px', width: '16px' }}/>
              </Tooltip>
              </div>
            }
          </div>
          <div className="status commonData">
            <ContainerStatus container={item} />
          </div>
          <div className="image commonData">
            <Tooltip placement="topLeft" title={images ? images : ""} >
              <span>{images || '-'}</span>
            </Tooltip>
          </div>
          <div className="address commonData">
            <span>内&nbsp;:&nbsp;{status.podIP}&nbsp;&nbsp;
            {
              lockItem ?
                <Tooltip placement="top" title="固定实例 IP，保持 IP 不变">
                  <Icon type="lock" />
                </Tooltip>
                : null
            }
            </span>
          </div>
          <div className="createTime commonData">
            {calcuDate(item.metadata.creationTimestamp || '')}
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    return (
      <div className="containerList">
        {items}
      </div>
    );
  }
})

class AppContainerList extends Component {
  constructor(props) {
    super(props);
    this.onchange = this.onchange.bind(this);
    this.allSelectedChecked = this.allSelectedChecked.bind(this);
    this.state = {
      selectedList: [],
      istioFlag: [],
    }
  }

  allSelectedChecked() {
    if (this.state.selectedList.length == testData.length) {
      return true;
    } else {
      return false;
    }
  }
  async componentDidMount() {
    this.loadIstioflag()
  }
  loadIstioflag = async () =>  {
    const res = await this.props.checkAPPInClusMesh(this.props.cluster,null,this.props.serviceName)
    const { result: { pods } = {} } = res.response
    const istioFlag = Object.entries(pods)
    .map(([key, value = {} ]) => ({ name: key,value: value.istioOn }))
    this.setState({ istioFlag })
  }
  onchange() {
    //select title checkbox
    let newList = new Array();
    if (this.state.selectedList.length == testData.length) {
      //had select all item,turn the selectedlist to null
      newList = [];
    } else {
      //select some item or nothing,turn the selectedlist to selecet all item
      for (let elem of testData) {
        newList.push(elem.id);
      }
    }
    this.setState({
      selectedList: newList
    });
  }

  render() {
    const { formatMessage } = this.props.intl
    const parentScope = this;
    const { containerList, loading, serviceName, serviceDetail } = this.props
    const containerNum = containerList && containerList.length
    const {appCenterChoiceHidden = false} = this.props
    return (
      <div id="AppContainerList">
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
          >
          {/*(<div className="operaBox">
          <div className="leftBox">
            <Button type="primary" size="large">
              <i className="fa fa-play"></i>
              启动
            </Button>
            <Button size="large">
              <i className="fa fa-stop"></i>
              停止
            </Button>
            <Button size="large">
              <i className="fa fa-trash"></i>
              删除
            </Button>
          </div>
          <div className="rightBox">
            <span>共&nbsp;{testData.length} 容器</span>
            <span>已选中的容器({this.state.selectedList.length}个)</span>
          </div>
          <div style={{ clear:"both" }}></div>
        </div>)*/}
          {
            serviceDetail.spec
              && <ContainerHeader
              serviceDetail={serviceDetail}
              onTabClick={this.props.onTabClick}
              containerNum={containerNum}
              appCenterChoiceHidden = {appCenterChoiceHidden}
              loadIstioflag={this.loadIstioflag}
            />
          }
          <Card className="dataBox">
            <div className="titleBox">
              {/*(<div className="selectIconTitle commonData">
              <Checkbox checked={this.allSelectedChecked() } onChange={()=>this.onchange()}></Checkbox>
              </div>)*/}
              <div className="name commonData" style={{ marginLeft: 24 }} >
                {formatMessage(ServiceCommonIntl.name)}
              </div>
              <div className="status commonData">
                {formatMessage(ServiceCommonIntl.status)}
              </div>
              <div className="image commonData">
                {formatMessage(ServiceCommonIntl.image)}
              </div>
              <div className="address commonData">
                {formatMessage(ServiceCommonIntl.address)}
              </div>
              <div className="createTime commonData">
                {formatMessage(AppServiceDetailIntl.createTime)}
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
            <MyComponent
              scope={parentScope}
              config={containerList}
              loading={loading}
              serviceName={serviceName}
              serviceDetail={serviceDetail}
              formatMessage={formatMessage}
              istioFlag = { this.state.istioFlag }
            />
          </Card>
        </QueueAnim>
      </div>
    )
  }
}

AppContainerList.propTypes = {
  cluster: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired,
  containerList: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
}

const mapStateToProps = (state) => {
  return {}
}
export default connect(mapStateToProps, {
  checkAPPInClusMesh: meshActions.checkAPPInClusMesh
})(injectIntl(AppContainerList, { withRef: true, }))
