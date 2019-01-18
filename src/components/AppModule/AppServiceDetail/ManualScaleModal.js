/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Manual scale modal
 *
 * v0.1 - 2016/10/27
 * @author ZhaoXueYu
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import './style/ManualScaleModal.less'
import { Row, Col, Slider, InputNumber, Modal, Icon, Button, Spin, message } from 'antd'
import { INSTANCE_MAX_NUM } from '../../../../constants'
import { UPGRADE_EDITION_REQUIRED_CODE } from '../../../constants'
import { manualScaleService, loadServiceContainerList } from '../../../actions/services'
import NotificationHandler from '../../../components/Notification'
import { isStorageUsed } from '../../../common/tools'
import ServiceCommonIntl, { AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl,  } from 'react-intl'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'

let maxInstance = null
class ManualScaleModal extends Component {
  constructor(props) {
    super(props)
    this.handleRealNum = this.handleRealNum.bind(this)
    this.handleModalOK = this.handleModalOK.bind(this)
    this.handleModalCancel = this.handleModalCancel.bind(this)
    this.getVolumeTypeInfo = this.getVolumeTypeInfo.bind(this)
    this.state = {
      realNum: 1,
    }
  }

  componentDidMount() {
    const { containerNum } = this.props
    if (containerNum) {
      this.setState({
        realNum: containerNum,
      })
    }
  }

  handleRealNum(value) {
    this.setState({
      realNum: value
    })
  }
  componentWillReceiveProps(nextProps) {
    const { service, visible } = nextProps
    if (!service) {
      return
    }
    if (!visible || visible == this.props.visible) {
      return
    }
    this.setState({
      realNum: service.spec.replicas,
    })

  }

  handleModalOK() {
    const { formatMessage }= this.props.intl
    const {
      parentScope,
      manualScaleService,
      cluster,
      appName,
      loadServiceList,
      service,
      loadServiceContainerList,
      projectName,
    } = this.props
    const { realNum } = this.state
    const serviceName = service.metadata.name
    let notification = new NotificationHandler()
    notification.spin(formatMessage(AppServiceDetailIntl.serviceflex, { serviceName }))
    manualScaleService(cluster, serviceName, { num: realNum }, {
      success: {
        func: () => {
          notification.close()
          notification.success(formatMessage(AppServiceDetailIntl.serviceflexObject, { serviceName, realNum }))
          if (parentScope) {
            const { serviceList } = parentScope.state
            serviceList.map(item => {
              if (item.metadata.name === serviceName) {
                item.status.phase = 'Scaling'
              }
            })
            parentScope.setState({
              manualScaleModalShow: false,
              serviceList
            })
            loadServiceList(cluster, appName)
          } else {
            this.props.handleChangeVisible()
            loadServiceList(cluster, appName, )
            loadServiceContainerList(cluster, serviceName, { projectName })
          }
        },
        isAsync: true
      },
      failed: {
        func: err => {
          notification.close()
          if(err.statusCode !== UPGRADE_EDITION_REQUIRED_CODE){
            notification.error(formatMessage(AppServiceDetailIntl.serviceflexFailure, { serviceName }))
          }
        }
      }
    })
  }

  handleModalCancel() {
    const { parentScope, handleChangeVisible } = this.props
    if (parentScope) {
      parentScope.setState({
        manualScaleModalShow: false
      })
    } else {
      handleChangeVisible()
    }
  }

  getVolumeTypeInfo(){
    const { service } = this.props
    const { volumeTypeList, volume } = service
    let incloudPrivate = false
    if (volume && volume.length) {
      volume.forEach(item => {
        if (item.srType === 'private') {
          incloudPrivate = true
        }
      })
    }
    if (!volumeTypeList) return incloudPrivate
    for(let i = 0; i < volumeTypeList.length; i++){
      if(volumeTypeList[i] == 'private'){
        incloudPrivate = true
        break
      }
    }
    return incloudPrivate
  }

  render() {
    const { service, visible } = this.props
    const { formatMessage }= this.props.intl
    const ipv4 = getDeepValue(service, [ 'spec', 'template', 'metadata', 'annotations', 'cni.projectcalico.org/ipAddrs' ])
    const isFixed = ipv4 && true || false
    maxInstance = ipv4 && JSON.parse(ipv4).length || null
    if (!visible) {
      return null
    }
    /*if(autoScale.isFetching) {
      return <div className="loadingBox">
          <Spin size="large"></Spin>
        </div>
    }*/
    const { realNum } = this.state
    const incloudPrivate = this.getVolumeTypeInfo()
    const modalFooter = [
      <Button
        key="back" type="ghost" size="large"
        onClick={this.handleModalCancel}>
        {formatMessage(ServiceCommonIntl.cancel)}
      </Button>,
      <Button
        key="submit" type="primary"
        size="large" loading={this.state.loading}
        disabled={incloudPrivate || this.props.disableScale}
        onClick={this.handleModalOK} >
        {formatMessage(ServiceCommonIntl.save)}
      </Button>
    ]
    return (
      <Modal
        visible={visible}
        title={formatMessage(AppServiceDetailIntl.manualScale)}
        footer={modalFooter}
        onCancel={this.handleModalCancel} >
        <div id="ManualScaleModal">
          <Row>
            <Col className='alertRow'>
              Tips： {!incloudPrivate ? formatMessage(AppServiceDetailIntl.changeObjectNumInfo) :
              formatMessage(AppServiceDetailIntl.independenceNoScale)}
            </Col>
          </Row>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'left' }}>服务名称</Col>
            <Col className="itemBody" span={20}>{service.metadata.name}</Col>
          </Row>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'left' }}>
              {formatMessage(AppServiceDetailIntl.obejctNum)}
              {/*<Tooltip title="默认最大10个实例，专业版及企业用户可申请更大配额"><Icon type="question-circle-o" /></Tooltip>*/}
            </Col>
            <Col className="itemBody" span={20}>
              <Row>
                <Col span={12}>
                  <Slider
                    min={1}
                    max={ isFixed ? maxInstance : INSTANCE_MAX_NUM }
                    defaultValue={service.spec.replicas}
                    onChange={this.handleRealNum}
                    value={realNum} />
                </Col>
                <Col span={12}>
                  <InputNumber
                    min={1}
                    max={ isFixed ? maxInstance : INSTANCE_MAX_NUM }
                    style={{ marginLeft: '16px' }}
                    value={realNum}
                    onChange={this.handleRealNum}
                    /> 个
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="cardItemPrompt">
            <Col span={4}></Col>
            <Col span={20} className="cardItemText">
              <Icon type="info-circle-o" />
              扩展实例数最大不会超过IP地址池实际可用数
            </Col>
          </Row>
        </div>
      </Modal>
    )
  }
}

ManualScaleModal.propTypes = {
  parentScope: PropTypes.object.isRequired,
  cluster: PropTypes.string.isRequired,
  appName: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  loadServiceList: PropTypes.func.isRequired,
  manualScaleService: PropTypes.func.isRequired,
}

function mapStateToProps(state, props) {

  // let autoScale = state.services.autoScale
  // if(!autoScale) {
  //   autoScale = {
  //     isFetching: true
  //   }
  // }
  // return {
  //   autoScale
  // }
  return props
}

export default injectIntl(connect(mapStateToProps, {
  manualScaleService,
  loadServiceContainerList
})(ManualScaleModal), { withRef: true, })