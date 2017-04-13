/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * MirrorSafety component
 *
 * v0.1 - 2017-3-14
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Card, Spin, Icon, Select, Tabs, Button, Steps, Checkbox, Input, Table } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import MirrorLayered from './MirrorLayered'
import MirrorSafetyBug from './MirrorSafetyBug'
import SoftwarePackage from './SoftwarePackage'
import BaseScan from './BaseScan'
import './style/MirrorSafety.less'
import { loadMirrorSafetyLayerinfo, loadImageDetailTag, loadMirrorSafetyScanStatus, loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo, loadMirrorSafetyChairinfo } from '../../../../actions/app_center'
import { connect } from 'react-redux'

const TabPane = Tabs.TabPane
const Option = Select.Option

class MirrorSafety extends Component {
  constructor(props) {
    super(props);
    this.TemplateSelectOption = this.TemplateSelectOption.bind(this)
    this.handleSelectVesion = this.handleSelectVesion.bind(this)
    this.ScanstatusSwitch = this.ScanstatusSwitch.bind(this)
    this.APIScanStatusThenScanClair = this.APIScanStatusThenScanClair.bind(this)
    this.handleClair = this.handleClair.bind(this)
    this.APIScanStatusThenClair = this.APIScanStatusThenClair.bind(this)
    this.MirrorSafetyClairSwitchSoft = this.MirrorSafetyClairSwitchSoft.bind(this)
    this.handleSoftwarepackageToLayer = this.handleSoftwarepackageToLayer.bind(this)
    this.handleTabsSwitch = this.handleTabsSwitch.bind(this)
    this.state = {
      tag: '',
      ScanDisabled: false,
      TabsDisabled: true,
      imgTag: "",
      imageName: this.props.imageName,
      ActiveKey: '1',
      LayerCommandParameters: '',
      tagVersion: this.props.tagVersion
    }
  }

  componentWillMount() {
    const { registry, imageName, loadImageDetailTag, tagVersion } = this.props
    loadImageDetailTag(registry, imageName)
    if (tagVersion !== '') {
      this.setState({
        tag: tagVersion,
        TabsDisabled: false
      })
    }
  }

  componentWillReceiveProps(nextPorps) {
    const { registry, loadImageDetailTag } = this.props
    const imageName = nextPorps.imageName
    const tagVersion = nextPorps.tagVersion
    let ActiveKeyNext = '1'
    if (this.state.tagVersion !== tagVersion) {
      this.setState({
        tag: tagVersion,
        TabsDisabled: false
      })
    }
    if(this.state.imageName == imageName){
      ActiveKeyNext = this.state.ActiveKey
    }
    if (this.state.imageName !== imageName) {
      loadImageDetailTag(registry, imageName)
      this.setState({
        TabsDisabled: true,
        imageName,
        tag: null,
        ActiveKey:ActiveKeyNext
      })
    }
  }

  TemplateSelectOption() {
    const { imgTag } = this.props
    if (!imgTag) {
      return
    }
    const tags = imgTag.map((item, index) => {
      return (
        <Option value={item} key={index}>{item}</Option>
      )
    })
    return tags
  }

  handleSelectVesion(tag) {
    const { imageName, loadMirrorSafetyLayerinfo, loadMirrorSafetyScanStatus } = this.props
    const { mirrorScanstatus } = this.props
    loadMirrorSafetyScanStatus({ imageName, tag },{
      success: {
        func: (mirrorScanstatus) => {
          this.setState({
            tag: tag,
            TabsDisabled: false,
          })
          //if(mirrorScanstatus && mirrorScanstatus.blobSum && mirrorScanstatus.status == 'both'){
          //  let blob_sum = mirrorScanstatus.blobSum
          //  loadMirrorSafetyChairinfo({ imageName, blob_sum })
          //}
        },
        isAsync: true
      }
    })
    loadMirrorSafetyLayerinfo({ imageName, tag })
  }

  //ScanstatusSwitch() {
  //  const { mirrorScanstatus } = this.props
  //  const { loadMirrorSafetyChairinfo } = this.props
  //  if (mirrorScanstatus.statusCode && mirrorScanstatus.statusCode == 500) {
  //    return (<div>
  //      {mirrorScanstatus.message}
  //    </div>)
  //  }
  //  if (mirrorScanstatus.statusCode && mirrorScanstatus.statusCode == 200) {
  //    const blob_sum = mirrorScanstatus.blobSum
  //    switch (mirrorScanstatus.status) {
  //      case "noresult":
  //        return (<div className='textAlignStyle'>
  //          <span data-status="noresult">没有扫描过,请点击扫描</span>
  //          <div style={{ paddingTop: '10px' }}>
  //            <Button onClick={this.APIScanStatusThenScanClair}>点击扫描</Button>
  //          </div>
  //        </div>)
  //      case "running":
  //        return (<div>
  //          <Spin />
  //        </div>)
  //      case "lynis":
  //        return (<div className='textAlignStyle'>
  //          <span data-status="lynis">没有扫描过,请点击扫描</span>
  //          <div className='textAlignStyleDiv'>
  //            <Button onClick={this.APIScanStatusThenScanClair}>点击扫描</Button>
  //          </div>
  //        </div>)
  //      case "clair":
  //        //return loadMirrorSafetyChairinfo({ blob_sum })
  //        return (<div className='textAlignStyle'>
  //          <span data-status="clair">没有扫描过,请点击扫描</span>
  //          <div className='textAlignStyleDiv'>
  //            <Button onClick={this.APIScanStatusThenClair}>点击扫描</Button>
  //          </div>
  //        </div>)
  //      case "both":
  //        //return loadMirrorSafetyChairinfo({ blob_sum })
  //        return (<div className='textAlignStyle'>
  //          <span data-status="both">没有扫描过,请点击扫描</span>
  //          <div className='textAlignStyleDiv'>
  //            <Button onClick={this.APIScanStatusThenClair}>点击扫描</Button>
  //          </div>
  //        </div>)
  //      case "different":
  //        return (<div className='textAlignStyle'>
  //          <span data-status="different">没有扫描过,请点击扫描</span>
  //          <div className='textAlignStyleDiv'>
  //            <Button onClick={this.APIScanStatusThenScanClair}>点击扫描</Button>
  //          </div>
  //        </div>)
  //      case "failed":
  //      default:
  //        return (<div className='textAlignStyle'>
  //          <span data-status="failed">扫描失败，请点击扫描</span>
  //          <div className='textAlignStyleDiv'>
  //            <Button onClick={this.APIScanStatusThenScanClair}>重新扫描</Button>
  //          </div>
  //        </div>)
  //    }
  //  }
  //}
  ScanstatusSwitch(obj) {
    if( !obj){
      return
    }
    const mirrorScanstatus = obj
    if (mirrorScanstatus.statusCode && mirrorScanstatus.statusCode == 500) {
      return (<div>
        {mirrorScanstatus.message}
      </div>)
    }
    if (mirrorScanstatus.statusCode && mirrorScanstatus.statusCode == 200) {
      const blob_sum = mirrorScanstatus.blobSum
      switch (mirrorScanstatus.status) {
        case "noresult":
          return (<div className='textAlignStyle'>
            <span data-status="noresult">没有扫描过,请点击扫描</span>
            <div style={{ paddingTop: '10px' }}>
              <Button onClick={this.APIScanStatusThenScanClair}>点击扫描</Button>
            </div>
          </div>)
        case "running":
          return (<div>
            <Spin />
          </div>)
        case "lynis":
          return (<div className='textAlignStyle'>
            <span data-status="lynis">没有扫描过,请点击扫描</span>
            <div className='textAlignStyleDiv'>
              <Button onClick={this.APIScanStatusThenScanClair}>点击扫描</Button>
            </div>
          </div>)
        case "clair":
          //return loadMirrorSafetyChairinfo({ blob_sum })
          return (<div className='textAlignStyle'>
            <span data-status="clair">没有扫描过,请点击扫描</span>
            <div className='textAlignStyleDiv'>
              <Button onClick={this.APIScanStatusThenClair}>点击扫描</Button>
            </div>
          </div>)
        case "both":
          //return loadMirrorSafetyChairinfo({ blob_sum })
          return (<div className='textAlignStyle'>
            <span data-status="both">没有扫描过,请点击扫描</span>
            <div className='textAlignStyleDiv'>
              <Button onClick={this.APIScanStatusThenClair}>点击扫描</Button>
            </div>
          </div>)
        case "different":
          return (<div className='textAlignStyle'>
            <span data-status="different">没有扫描过,请点击扫描</span>
            <div className='textAlignStyleDiv'>
              <Button onClick={this.APIScanStatusThenScanClair}>点击扫描</Button>
            </div>
          </div>)
        case "failed":
        default:
          return (<div className='textAlignStyle'>
            <span data-status="failed">扫描失败，请点击扫描</span>
            <div className='textAlignStyleDiv'>
              <Button onClick={this.APIScanStatusThenScanClair}>重新扫描</Button>
            </div>
          </div>)
      }
    }
  }
  APIScanStatusThenClair() {
    const { loadMirrorSafetyChairinfo, mirrorScanstatus, imageName, mirrorLayeredinfo } = this.props
    const { tag } = this.state
    const blob_sum = mirrorScanstatus.blobSum
    loadMirrorSafetyChairinfo({ imageName, blob_sum })
    if (!mirrorLayeredinfo) {
      loadMirrorSafetyLayerinfo({ imageName, tag })
    }
  }

  APIScanStatusThenScanClair() {
    const { loadMirrorSafetyScan, loadMirrorSafetyChairinfo, mirrorLayeredinfo } = this.props
    const { imageName, mirrorScanUrl, mirrorScanstatus, cluster_id, mirrorSafetyScan } = this.props
    const { tag } = this.state
    const blob_sum = mirrorScanstatus.blobSum
    const config = {
      cluster_id,
      imageName,
      tag,
      registry: mirrorScanUrl
    }
    if(mirrorSafetyScan[imageName] && mirrorSafetyScan[imageName].result && mirrorSafetyScan[imageName].result.blobSum){
      loadMirrorSafetyLayerinfo({ imageName, tag })
    }else{
      loadMirrorSafetyScan(config, {
        success: {
          func: () => {
            loadMirrorSafetyChairinfo({ imageName, blob_sum })
            if (!mirrorLayeredinfo) {
              loadMirrorSafetyLayerinfo({ imageName, tag })
            }
          },
          isAsync: true
        }
      })
    }
  }

  handleClair() {
    const { mirrorsafetyClair, mirrorLayeredinfo, imageName } = this.props
    console.log(mirrorsafetyClair[imageName])
    if (!mirrorsafetyClair[imageName]) {
      return []
    }
    const statusCode = mirrorsafetyClair[imageName].result.statusCode
    const status = mirrorsafetyClair[imageName].result.status
    if (statusCode && statusCode == 500) {
      return (
        <div>
          <span>{mirrorsafetyClair[imageName].result.message}</span>
        </div>
      )
    }
    if (statusCode && statusCode == 200) {
      if (status) {
        switch (status) {
          case 'running':
            return (
              <div className='textAlignStyle'>
                <div>正在扫描尚未结束</div>
                <Spin />
                <div className='textAlignStyleDiv'>
                  <Button onClick={this.APIScanStatusThenClair}>点击重新扫描</Button>
                </div>
              </div>
            )
          case 'finished':
            return <MirrorSafetyBug mirrorsafetyClair={mirrorsafetyClair} mirrorLayeredinfo={mirrorLayeredinfo} callBack={this.handleSoftwarepackageToLayer} imageName={imageName}/>
          case 'nojob':
          default:
            return (
              <div className='textAlignStyle'>
                <div>镜像没有被扫描过</div>
                <div className='textAlignStyleDiv'>
                  <Button onClick={this.APIScanStatusThenScanClair}>点击扫描</Button>
                </div>
              </div>
            )
        }
      }
    }
  }

  MirrorSafetyClairSwitchSoft() {
    const { mirrorsafetyClair, mirrorLayeredinfo, imageName } = this.props
    if (!mirrorsafetyClair[imageName]) {
      return
    }
    const statusCode = mirrorsafetyClair[imageName].result.statusCode
    const status = mirrorsafetyClair[imageName].result.status
    if (statusCode && statusCode == 500) {
      return (
        <div>
          <span>{mirrorsafetyClair[imageName].result.message}</span>
        </div>
      )
    }
    if (statusCode && statusCode == 200) {
      if (status) {
        switch (status) {
          case 'running':
            return (
              <div className='textAlignStyle'>
                <div>正在扫描尚未结束</div>
                <Spin />
                <div className='textAlignStyleDiv'>
                  <Button onClick={this.APIScanStatusThenClair}>点击重新扫描</Button>
                </div>
              </div>
            )
          case 'finished':
            return <SoftwarePackage mirrorsafetyClair={mirrorsafetyClair} mirrorLayeredinfo={mirrorLayeredinfo} callBack={this.handleSoftwarepackageToLayer} imageName={imageName}/>
          case 'nojob':
          default:
            return (
              <div className='textAlignStyle'>
                <span>镜像没有扫描过</span>
                <div className='textAlignStyleDiv'>
                  <Button onClick={this.APIScanStatusThenScanClair}>点击扫描</Button>
                </div>
              </div>
            )
        }
      }
    }
  }

  handleSoftwarepackageToLayer(object) {
    if (!object) {
      return
    }
    this.setState({
      ActiveKey: object.ActiveKey.toString(),
      LayerCommandParameters: object.LayerCommandParameters
    })
  }

  handleTabsSwitch(key) {
    this.setState({
      ActiveKey: key
    })
  }

  render() {
    const { mirrorScanstatus, mirrorLayeredinfo, mirrorsafetyClair, imgTag, mirrorsafetyLyins, imageName, registry, mirrorSafetyScan } = this.props
    const mirrorchairinfo = mirrorsafetyClair[imageName]
    const { TabsDisabled, LayerCommandParameters } = this.state
    return (
      <div id='mirrorsafety'>
        <div className='safetyselect'>
          <Select showSearch
            className='safetyselectson'
            placeholder='选择镜像版本，查看安全报告'
            value={this.state.tag ? this.state.tag : '选择镜像版本，查看安全报告'}
            onChange={this.handleSelectVesion}
            VersionOption={imgTag}
            optionFilterProp="children"
            notFoundContent="无法找到"
          >
            {this.TemplateSelectOption()}
          </Select>
        </div>
        <div>
          <div className='safetytabcontainer'>
            <div className="safetytabbox">
              <Tabs onChange={this.handleTabsSwitch} activeKey={ TabsDisabled ? null : this.state.ActiveKey}>
                <TabPane tab={<span><i className="fa fa-bug safetytabIcon" aria-hidden="true"></i>漏洞扫描</span>} key="1" disabled={this.state.TabsDisabled} >
                  <MirrorSafetyBug ActiveKey={this.state.ActiveKey} imageName={imageName} mirrorScanstatus={mirrorScanstatus} tag={this.state.tag} mirrorSafetyScan={mirrorSafetyScan} mirrorLayeredinfo={mirrorLayeredinfo}/>
                </TabPane>
                <TabPane tab={<span><i className="fa fa-database safetytabIcon" aria-hidden="true"></i>镜像分层</span>} key="2" disabled={this.state.TabsDisabled}>
                  <MirrorLayered mirrorLayeredinfo={mirrorLayeredinfo} LayerCommandParameters={LayerCommandParameters} imageName={imageName} tag={this.state.tag} />
                </TabPane>
                <TabPane tab={<span><i className="fa fa-android safetytabIcon" aria-hidden="true"></i><span className='softspan'>软件包</span></span>} key="3" disabled={this.state.TabsDisabled}>
                  <SoftwarePackage imageName={imageName} mirrorScanstatus={mirrorScanstatus} tag={this.state.tag} mirrorSafetyScan={mirrorSafetyScan} mirrorLayeredinfo={mirrorLayeredinfo}/>
                </TabPane>
                <TabPane tab={<span><i className="fa fa-crosshairs safetytabIcon" aria-hidden="true"></i>基础扫描</span>} key="4" disabled={this.state.TabsDisabled}>
                  <BaseScan mirrorScanstatus={mirrorScanstatus} registry={registry} imageName={imageName} tag={this.state.tag} mirrorSafetyScan={mirrorSafetyScan} />
                </TabPane>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities, getImageTag, images } = state
  const { imageTag } = getImageTag
  const { imageInfo, registry, imageName } = props

  let imgTag = []
  if (imageTag[registry] && imageTag[registry][imageName]) {
    imgTag = imageTag[registry][imageName].tag || []
  }
  let mirrorScanUrl = ''
  if (images.publicImages[registry] && images.publicImages[registry].server) {
    mirrorScanUrl = 'http://' + images.publicImages[registry].server
  }
  let mirrorSafetyScan = images.mirrorSafetyScan || ''
  let cluster_id = entities.current.cluster.clusterID || ''
  //let mirrorScanstatus = images.mirrorSafetyScanStatus.mirrorScanstatusinfo || {}
  let mirrorScanstatus = images.mirrorSafetyScanStatus
  let mirrorLayeredinfo = images.mirrorSafetyLayerinfo.mirrorLayerinfo || []
  let mirrorsafetyClair = images.mirrorSafetyClairinfo
  let mirrorsafetyLyins = images.mirrorSafetyLyinsinfo
  return {
    cluster_id,
    imageInfo,
    registry,
    imgTag,
    mirrorLayeredinfo,
    mirrorScanstatus,
    mirrorScanUrl,
    mirrorSafetyScan,
    mirrorsafetyClair,
    mirrorsafetyLyins,
  }
}

export default connect(mapStateToProps, {
  loadMirrorSafetyLayerinfo,
  loadMirrorSafetyLyinsinfo,
  loadMirrorSafetyChairinfo,
  //当没有数据时，触发扫描
  loadMirrorSafetyScan,
  //请求镜像安全整体状况
  loadMirrorSafetyScanStatus,
  //请求镜像名称及版本
  loadImageDetailTag
})(MirrorSafety)