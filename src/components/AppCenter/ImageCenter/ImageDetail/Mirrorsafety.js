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
    this.SafetytabcontainerContent = this.SafetytabcontainerContent.bind(this)
    this.SelectVesion = this.SelectVesion.bind(this)
    this.TabsSelect = this.TabsSelect.bind(this)
    this.Safetybugcontainer = this.Safetybugcontainer.bind(this)
    this.SafetyBugclair = this.SafetyBugclair.bind(this)
    this.MirrorSafetyClairSwitch = this.MirrorSafetyClairSwitch.bind(this)
    this.ScanStatusClair = this.ScanStatusClair.bind(this)
    this.state = {
      tag: '',
      ScanDisabled: false,
      TabsDisabled: true,
      imgTag: "",
      imageName: this.props.imageName
    }
  }

  componentWillMount() {
    const { registry, imageName, loadImageDetailTag } = this.props
    loadImageDetailTag(registry, imageName)
  }

  componentWillReceiveProps(nextPorps) {
    const { registry, loadImageDetailTag } = this.props
    const imageName = nextPorps.imageName
    if (this.state.imageName !== imageName) {
      loadImageDetailTag(registry, imageName)
      this.setState({ TabsDisabled: true, imageName, tag: null })
    }
  }

  SelectOption() {
    const { imgTag } = this.props
    const tags = imgTag.map((item, index) => {
      return (
        <Option value={item} key={index}>{item}</Option>
      )
    })
    return tags
  }

  Safetybugcontainer() {
    const { mirrorScanstatus } = this.props
    if (mirrorScanstatus.statusCode && mirrorScanstatus.statusCode == 200) {
      switch (mirrorScanstatus.status) {
        case "noresult":
          return (<div>
            <span>noresult没有扫描过,请点击扫描</span>
            <Button onClick={this.SafetyBugclair}>点击扫描</Button>
          </div>)
        case "running":
          return (<div><Spin /></div>)
        case "lynis":
          return (<div><span>lynis没有扫描过,请点击扫描</span>
            <Button onClick={this.SafetyBugclair}>点击扫描</Button></div>)
        case "clair":
          return (<div>
            <span>clair没有扫描过,请点击扫描</span>
            <Button onClick={this.ScanStatusClair}>点击扫描</Button>
          </div>)
        case "both":
          return (<div><MirrorSafetyBug /></div>)
        case "different":
          return (<div>different同名同tag之前扫过，但与这次非同一镜像。下划线后为上次扫描时间戳（time.UnixNano()）<Button onClick={this.SafetyBugclair}>点击扫描</Button></div>)
        case "failed":
        default:
          return (<div>
            failed上次扫描失败
            <Button onClick={this.SafetyBugclair}>重新扫描</Button>
          </div>)
      }
    } else if (mirrorScanstatus.statusCode && mirrorScanstatus.statusCode == 500) {
      return (<div>{mirrorScanstatus.message}
      </div>)
    }
  }

  ScanStatusClair(){
    const { loadMirrorSafetyChairinfo,mirrorScanstatus } = this.props
    const { mirrorsafetyClair } = this.props
    const blob_sum = mirrorScanstatus.blobSum
    alert('clair请求已发送')
    loadMirrorSafetyChairinfo({ blob_sum })
  }

  //请求漏洞扫描数据
  SafetyBugclair() {
    const { loadMirrorSafetyScan, loadMirrorSafetyChairinfo, loadMirrorSafetyScanStatus } = this.props
    const { imageName, mirrorScanUrl, mirrorScanstatus } = this.props
    const { tag } = this.state
    const blob_sum = mirrorScanstatus.blobSum
    const cluster_id = 'CID-fe23111d77cb'
    const config = {
      cluster_id,
      imageName,
      tag,
      registry: mirrorScanUrl
    }
    //触发请求
    loadMirrorSafetyScan(config, {
      success: {
        func: () => {
          alert('success')
          //loadMirrorSafetyScanStatus({imageName, tag})
          console.log('第一次漏洞扫描的blobSum',blob_sum)
          loadMirrorSafetyChairinfo({ blob_sum })
          setTimeout(function () {
            alert('这是第二次请求！！')
            console.log('第二次漏洞扫描的blobSum',blob_sum)
            loadMirrorSafetyChairinfo({ blob_sum })
          }, 120000)
        },
        isAsync: true
      }
    })
  }

  SafetytabcontainerContent() {
    const { mirrorScanstatus } = this.props
    if (mirrorScanstatus.statusCode && mirrorScanstatus.statusCode == 200) {
      switch (mirrorScanstatus.status) {
        case "noresult":
          return (<div>
            <span>noresult没有扫描过,请点击扫描</span>
            <Button onClick={this.TriggerScan} disabled={this.state.ScanDisabled} >扫描</Button>
          </div>)
        case "running":
          return (<div>running正在扫描</div>)
        case "lynis":
          return (<div><span>noresult没有扫描过,请点击扫描</span>
            <Button onClick={this.SafetyBugclair} disabled={this.state.ScanDisabled}>点击扫描</Button></div>)
        case "clair":
          return (<div>clair已经扫描完</div>)
        case "both":
          return (<div>{this.Safetytabcontainer()}</div>)
        case "different":
          return (<div>different同名同tag之前扫过，但与这次非同一镜像。下划线后为上次扫描时间戳（time.UnixNano()）
          </div>)
        case "failed":
        default:
          return (<div>
            failed上次扫描失败
            <Button onClick={this.TriggerScan} disabled={this.state.ScanDisabled}>重新扫描</Button>
          </div>)
          return (<div>这里是默认的switch</div>)
      }
    } else if (mirrorScanstatus.statusCode && mirrorScanstatus.statusCode == 500) {
      return (<div>{mirrorScanstatus.message}
      </div>)
    }
  }

  SelectVesion(tag) {
    const { imageName, loadMirrorSafetyLayerinfo, loadMirrorSafetyScanStatus } = this.props
    loadMirrorSafetyLayerinfo({ imageName, tag })
    loadMirrorSafetyScanStatus({ imageName, tag })
    console.log('选择版本tag',tag)
    this.setState({
      tag: tag,
      TabsDisabled: false,
    })
  }

  TabsSelect(key) {
    const { loadMirrorSafetyScan,loadMirrorSafetyChairinfo, loadMirrorSafetyLayerinfo, loadMirrorSafetyLyinsinfo } = this.props
    const { imageName } = this.props
    const tag = this.state.tag
    console.log('滑动tabs是的state',this.state)
    console.log("滑动tabs是的imageName",imageName)
    //console.log("滑动tabs是的tab",tab)
    switch(key){
      case 1 :
        return console.log(1)
      case 2 :
        return loadMirrorSafetyLayerinfo({imageName, tag})
      case 3 :
        return console.log(2)
      case 4 :
      default:
        return console.log(3)
    }
  }

  MirrorSafetyClairSwitch() {
    const { mirrorsafetyClair } = this.props
    if (mirrorsafetyClair.result.statusCode && mirrorsafetyClair.result.statusCode == 200) {
      if (mirrorsafetyClair.result.status) {
        switch (mirrorsafetyClair.result.status) {
          case 'running':
            return (
              <div>正在扫描尚未结束</div>
            )
          case 'finished':
            return (
              <div>已经结束有结果</div>
            )
          case 'nojob':
          default:
            return (
              <div>没有被触发过</div>
            )
        }
      }
    } else if (mirrorsafetyClair.result.statusCode && mirrorsafetyClair.result.statusCode == 500) {
      console.log(mirrorsafetyClair.result.message)
      return (
        <div>
          statusCode == 500
        </div>
      )
    }
  }

  render() {
    const { mirrorLayeredinfo, mirrorsafetyClair, imgTag } = this.props
    return (
      <div id='mirrorsafety'>
        <div className='safetyselect'>
          <Select showSearch
            className='safetyselectson'
            placeholder='选择镜像版本，查看安全报告'
            value={this.state.tag}
            onChange={this.SelectVesion}
            VersionOption={imgTag}
            optionFilterProp="children"
            notFoundContent="无法找到"
          >
            {this.SelectOption()}
          </Select>
        </div>
        <div>
          <div className='safetytabcontainer'>
            <div className="safetytabbox">
              <Tabs onChange={this.TabsSelect}>
                <TabPane tab={<span><i className="fa fa-bug safetytabIcon" aria-hidden="true"></i>漏洞扫描</span>} key="1" disabled={this.state.TabsDisabled}>
                  {mirrorsafetyClair.result ? this.MirrorSafetyClairSwitch() : this.Safetybugcontainer()}
                </TabPane>
                <TabPane tab={<span><i className="fa fa-database safetytabIcon" aria-hidden="true"></i>镜像分层</span>} key="2" disabled={this.state.TabsDisabled}>
                  <MirrorLayered mirrorLayeredinfo={mirrorLayeredinfo}/>
                </TabPane>
                <TabPane tab={<span><i className="fa fa-android safetytabIcon" aria-hidden="true"></i>软件包</span>} key="3" disabled={this.state.TabsDisabled}>
                  <SoftwarePackage mirrorsafetyClair={mirrorsafetyClair} mirrorLayeredinfo={mirrorLayeredinfo}/>
                </TabPane>
                <TabPane tab={<span><i className="fa fa-crosshairs safetytabIcon" aria-hidden="true"></i>基础扫描</span>} key="4" disabled={this.state.TabsDisabled}>
                  <BaseScan />
                </TabPane>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props){
  const {entities, getImageTag, images} = state
  const {imageTag} = getImageTag
  const {imageInfo, registry, imageName} = props

  let imgTag = []
  if(imageTag[registry] && imageTag[registry][imageName]){
    imgTag = imageTag[registry][imageName].tag || []
  }
  let mirrorScanUrl = ''
  if(images.publicImages[registry] && images.publicImages[registry].server){
    mirrorScanUrl = ('http://' + images.publicImages[registry].server) || 'http://'
  }
  let mirrorSafetyScan = images.mirrorSafetyScan || ''
  let cluster_id = entities.current.cluster.clusterID || ''
  let mirrorScanstatus = images.mirrorSafetyScanStatus.mirrorScanstatusinfo || {}
  let mirrorLayeredinfo = images.mirrorSafetyLayerinfo.mirrorLayerinfo || []
  let mirrorsafetyClair = images.mirrorSafetyClairinfo
  //let mirrorsafetyClairFearures = images.mirrorSafetyClairinfo.result.report.features || {}
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
    //mirrorsafetyClairFearures
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