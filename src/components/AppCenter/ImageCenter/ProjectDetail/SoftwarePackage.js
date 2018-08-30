/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * SoftwarePackage component
 *
 * v0.1 - 2017-3-22
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Spin, Select, Button, Table, Tooltip } from 'antd'
import { injectIntl } from 'react-intl'
import ReactEcharts from 'echarts-for-react'
import softwarePackage from './intl/softwarePackage'
import './style/SoftwarePackage.less'
import { loadMirrorSafetyScan, loadMirrorSafetyChairinfo } from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { connect } from 'react-redux'
import SignalFourRed from '../../../../assets/img/appCenter/mirrorSafety/signal4red.svg'
import SignalFouryellow from '../../../../assets/img/appCenter/mirrorSafety/signal4yellow.svg'
import SignalFourgreen from '../../../../assets/img/appCenter/mirrorSafety/signal4green.svg'
import SignalThreeRed from '../../../../assets/img/appCenter/mirrorSafety/signal3red.svg'
import SignalThreeyellow from '../../../../assets/img/appCenter/mirrorSafety/signal3yellow.svg'
import SignalThreegreen from '../../../../assets/img/appCenter/mirrorSafety/signal3green.svg'
import SignalTwoRed from '../../../../assets/img/appCenter/mirrorSafety/signal2red.svg'
import SignalTwoyellow from '../../../../assets/img/appCenter/mirrorSafety/signal2yellow.svg'
import SignalTwogreen from '../../../../assets/img/appCenter/mirrorSafety/signal2green.svg'
import SignalOneRed from '../../../../assets/img/appCenter/mirrorSafety/signal1red.svg'
import SignalOneyellow from '../../../../assets/img/appCenter/mirrorSafety/signal1yellow.svg'
import SignalOnegreen from '../../../../assets/img/appCenter/mirrorSafety/signal1green.svg'
import NotificationHandler from '../../../../components/Notification'

class TableTemplate extends Component{
  constructor(props){
    super(props)
    this.TableData = this.TableData.bind(this)
    this.handleImpactSorter = this.handleImpactSorter.bind(this)
    this.handleImpactSignal = this.handleImpactSignal.bind(this)
    this.handleImpactColor = this.handleImpactColor.bind(this)
    this.TempalteUpgradeImpact = this.TempalteUpgradeImpact.bind(this)
    this.TemplateTableIntroduceInLayer = this.TemplateTableIntroduceInLayer.bind(this)
    this.state = {
      Unknown: 0,
      Negligible: 0,
      Low: 0,
      Medium: 0,
      High: 0,
      None: 0,
      Total: 0,
      echarts : true,
    }
  }

  componentDidMount() {
    const newDate = this.TableData().newData
    if(newDate){
      this.setState({
        Unknown: newDate.EchartsUnknownNum,
        Negligible: newDate.EchartsNegligibleNum,
        Low: newDate.EchartsLowNum,
        Medium: newDate.EchartsMediumNum,
        High: newDate.EchartsHighNum,
        None: newDate.EchartsNoneNum,
        Total: newDate.index
      })
    }
  }

  componentWillReceiveProps(nextProps){
    const mirrorsafetyClair = nextProps.mirrorsafetyClair
    const imageName = nextProps.imageName
    const { formatMessage } = this.props.intl
    const tag = nextProps.tag
    if(tag !== this.props.tag || nextProps.inherwidth !== 3){
      this.setState({
        echarts : false
      })
    }
    if(tag !== this.props.tag || nextProps.inherwidth == 3){
      setTimeout(()=> {
        this.setState({
          echarts : true
        })
      })
    }
    if(tag !== this.props.tag && nextProps.inherwidth == 3){
      setTimeout(() => {
        this.setState({
          echarts : false
        })
      },100)
    }
    if(imageName !== this.props.imageName || mirrorsafetyClair !== this.props.mirrorsafetyClair || !nextProps.mirrorLayeredinfo[imageName]){
      if(!mirrorsafetyClair[imageName] || !mirrorsafetyClair[imageName][tag] || !mirrorsafetyClair[imageName][tag].result || Object.keys(mirrorsafetyClair[imageName][tag].result.report).length == 0){
        return
      }
      const result = mirrorsafetyClair[imageName][tag].result.report
      const features = result.features
      const vulnerabilities = result.vulnerabilities
      const fixedIn = result.fixedIn
      // Echarts 数据
      let EchartsUnknownNum = 0
      let EchartsNegligibleNum = 0
      let EchartsLowNum = 0
      let EchartsMediumNum = 0
      let EchartsHighNum = 0
      let EchartsNoneNum = 0
      let index =1
      for (let key in features) {
        let command = {}
        let arrBug = []
        let bugcell = [
          { sortNum: 0, High: 0 },
          { sortNum: 0, Medium: 0 },
          { sortNum: 0, Low: 0 },
          { sortNum: 0, Unknown: 0 },
          { sortNum: 0, Negligible: 0 },
          { sortNum: 0, Other: 0 }
        ]
        let bugcellObj = []
        let bugcellSlice = []
        let bugcellValue = {
          nameOne: '',
          valueOne: '',
          nameTwo: '',
          valueTwo: ''
        }
        let nameStr = ''
        let namevnlner = ''
        let nameIndex = ''
        let availableRepair = []
        let unavailableRepair = []
        let upgradeRemain = 0
        let upgradeImapct = {}

        // 漏洞数据获取
        // 找到当前包的漏洞信息，并将其存入一个数组
        if (features[key].vulnerabilities.length !== 0) {
          // 升级后的剩余
          nameStr = key.replace(/-/g, '')
          nameStr = nameStr.substring(0, 1).toUpperCase() + nameStr.substring(1, nameStr.length)
          for (let j = 0; j < features[key].vulnerabilities.length; j++) {
            let flag = false
            // 升级后的影响
            namevnlner = (features[key].vulnerabilities[j]).replace(/-/g, '')
            namevnlner = namevnlner.substring(0, 1).toLowerCase() + namevnlner.substring(1, namevnlner.length)
            nameIndex = namevnlner + nameStr
            // 遍历 fixedIn ， 判断当前漏洞是否可修复
            for (let fixed in fixedIn) {
              if (nameIndex == fixed) {
                availableRepair.push(fixedIn[fixed])
                flag = true
                break
              }
            }
            if(flag == false){
              unavailableRepair.push(features[key].vulnerabilities[j])
            }
            for (let k in vulnerabilities) {
              if (vulnerabilities[k].name == features[key].vulnerabilities[j]) {
                arrBug.push(vulnerabilities[k])
                break
              }
            }
          }
          upgradeRemain = unavailableRepair.length
        } else {
          EchartsNoneNum++
          upgradeRemain = 0
        }
        //升级的影响
        let impactArr = []
        let impactSeverityNum = [0,0,0,0,0,0]
        if(unavailableRepair.length == 0){
          impactArr = []
        }else{
          for(let i=0;i<unavailableRepair.length;i++){
            for(let j in vulnerabilities){
              if(unavailableRepair[i] == vulnerabilities[j].name){
                impactArr.push(vulnerabilities[j].severity)
                break
              }
            }
          }
        }
        if(impactArr.length == 0 ){
          impactSeverityNum = [0,0,0,0,0,0]
        }else{
          for(let i=0;i<impactArr.length;i++){
            switch(impactArr){
              case 'High' :
                impactSeverityNum[0]++
              case 'Medium' :
                impactSeverityNum[1]++
              case 'Low':
                impactSeverityNum[2]++
              case 'Negligible':
                impactSeverityNum[3]++
              case 'Other':
                impactSeverityNum[4]++
              case 'Unknown':
              default:
                impactSeverityNum[5]++
            }
          }
        }

        let severityMax = 0
        let severityMaxi = 0
        let severityCount = 0
        for (let i=0;i<impactSeverityNum.length;i++){
          if(impactSeverityNum[i] > severityMax){
            severityMax = impactSeverityNum[i]
            severityMaxi = i
            severityCount = severityCount + impactSeverityNum[i]
          }
        }

        if(severityCount == 0){
          upgradeImapct = {
            impactColor:5,
            impactSignal:0,
            impactSorterNum:this.handleImpactSorter(0,5)
          }
        }else{
          upgradeImapct = {
            impactColor:severityMaxi,
            impactSignal:severityMax/severityCount,
            impactSorterNum:this.handleImpactSorter(severityMax/severityCount,severityMaxi)
          }
        }

        // 遍历漏洞信息中的 安全等级，将安全等级信息存入一个数组中
        if (arrBug.length > 0) {
          for (var arr = 0; arr < arrBug.length; arr++) {
            switch (arrBug[arr]['severity']) {
              case "High":
                let HighNum = parseInt(bugcell[0]['High'])
                bugcell[0]['High'] = HighNum + 1
                bugcell[0]['sortNum'] = HighNum + 1
                EchartsHighNum = EchartsHighNum + 1
              case "Medium":
                let MediumNum = parseInt(bugcell[1]["Medium"])
                bugcell[1]["Medium"] = MediumNum + 1
                bugcell[1]["sortNum"] = MediumNum + 1
                EchartsMediumNum = EchartsMediumNum + 1
              case "Low":
                let LowNum = parseInt(bugcell[2]["Low"])
                bugcell[2]["Low"] = LowNum + 1
                bugcell[2]["sortNum"] = LowNum + 1
                EchartsLowNum = EchartsLowNum + 1
              case "Unknown":
                let UnknownNum = parseInt(bugcell[3]["Unknown"])
                bugcell[3]["Unknown"] = UnknownNum + 1
                bugcell[3]["sortNum"] = UnknownNum + 1
                EchartsUnknownNum = EchartsUnknownNum + 1
              case "Negligible":
                let NegligibleNum = parseInt(bugcell[4]["Negligible"])
                bugcell[4]["Negligible"] = NegligibleNum + 1
                bugcell[4]["sortNum"] = NegligibleNum + 1
                EchartsNegligibleNum = EchartsNegligibleNum + 1
              default:
                let OtherNum = parseInt(bugcell[5]["Other"])
                bugcell[5]["Other"] = OtherNum + 1
                bugcell[5]["sortNum"] = OtherNum + 1
                EchartsUnknownNum = EchartsUnknownNum + 1
            }
          }
        } else {
          bugcell = [
            { sortNum: 0, High: 0 },
            { sortNum: 0, Medium: 0 },
            { sortNum: 0, Low: 0 },
            { sortNum: 0, Unknown: 0 },
            { sortNum: 0, Negligible: 0 },
            { sortNum: 0, Other: 0 }
          ]
        }

        //将取到的漏洞状态进行排序
        let max = 0
        for (let a = 0; a < bugcell.length; a++) {
          for (let b = a + 1; b < bugcell.length; b++) {
            if (bugcell[a].sortNum > bugcell[b].sortNum) {
              max = bugcell[a]
              bugcell[a] = bugcell[b]
              bugcell[b] = max
            }
          }
        }

        //取出漏洞状态的前两位，准备传入table中
        if (bugcell.length >= 2) {
          bugcellSlice = bugcell.slice(4)
          if (bugcellSlice[0].sortNum == 0 && bugcellSlice[1].sortNum == 0) {
            bugcellValue.nameOne = formatMessage(softwarePackage.noDataText)
          } else {
            delete bugcellSlice[0].sortNum
            delete bugcellSlice[1].sortNum
            for (let d = 0; d < bugcellSlice.length; d++) {
              for (let e in bugcellSlice[d]) {
                bugcellObj.push(e)
                bugcellObj.push(bugcellSlice[d][e])
              }
            }
            bugcellValue.nameOne = bugcellObj[2]
            bugcellValue.valueOne = bugcellObj[3]
            bugcellValue.nameTwo = bugcellObj[0]
            bugcellValue.valueTwo = bugcellObj[1]
          }
        }
        let data = {
          key: index.toString(),
          softwarename: features[key].name,
          softwareversions: features[key].version,
          softwarebug: bugcellValue,
          softwareremain: upgradeRemain,
          softwareimpact: upgradeImapct,
          softwarepicture: command
        }
        index ++
      }

      this.setState({
        Unknown: EchartsUnknownNum,
        Negligible: EchartsNegligibleNum,
        Low: EchartsLowNum,
        Medium: EchartsMediumNum,
        High: EchartsHighNum,
        None: EchartsNoneNum,
        Total: index-1
      })
    }
  }

  TableData() {
    const { mirrorsafetyClair, mirrorLayeredinfo, imageName, tag } = this.props
    if (!mirrorsafetyClair[imageName] || !mirrorsafetyClair[imageName][tag] || !mirrorsafetyClair[imageName][tag].result || Object.keys(mirrorsafetyClair[imageName][tag].result.report).length == 0 || !mirrorLayeredinfo[imageName][tag].result) {
      return []
    }
    const result = mirrorsafetyClair[imageName][tag].result.report
    const features = result.features
    const vulnerabilities = result.vulnerabilities
    const fixedIn = result.fixedIn
    const layerInfo = mirrorLayeredinfo[imageName][tag].result
    let tableDataSource = []
    let index = 1
    // Echarts 数据
    let EchartsUnknownNum = 0
    let EchartsNegligibleNum = 0
    let EchartsLowNum = 0
    let EchartsMediumNum = 0
    let EchartsHighNum = 0
    let EchartsNoneNum = 0

    for (let key in features) {
      let command = {}
      let arrBug = []
      let bugcell = [
        { sortNum: 0, High: 0 },
        { sortNum: 0, Medium: 0 },
        { sortNum: 0, Low: 0 },
        { sortNum: 0, Unknown: 0 },
        { sortNum: 0, Negligible: 0 },
        { sortNum: 0, Other: 0 }
      ]
      let bugcellObj = []
      let bugcellSlice = []
      let bugcellValue = {
        nameOne: '',
        valueOne: '',
        nameTwo: '',
        valueTwo: ''
      }
      let nameStr = ''
      let namevnlner = ''
      let nameIndex = ''
      let availableRepair = []
      let unavailableRepair = []
      let upgradeRemain = 0
      let upgradeImapct = {}

      // 漏洞数据获取
      // 找到当前包的漏洞信息，并将其存入一个数组
      if (features[key].vulnerabilities.length !== 0) {
        // 升级后的剩余
        nameStr = key.replace(/-/g, '')
        nameStr = nameStr.substring(0, 1).toUpperCase() + nameStr.substring(1, nameStr.length)
        for (let j = 0; j < features[key].vulnerabilities.length; j++) {
          let flag = false
          // 升级后的影响
          namevnlner = (features[key].vulnerabilities[j]).replace(/-/g, '')
          namevnlner = namevnlner.substring(0, 1).toLowerCase() + namevnlner.substring(1, namevnlner.length)
          nameIndex = namevnlner + nameStr
          // 遍历 fixedIn ， 判断当前漏洞是否可修复
          for (let fixed in fixedIn) {
            if (nameIndex == fixed) {
              availableRepair.push(fixedIn[fixed])
              flag = true
              break
            }
          }
          if(flag == false){
            unavailableRepair.push(features[key].vulnerabilities[j])
          }
          for (let k in vulnerabilities) {
            if (vulnerabilities[k].name == features[key].vulnerabilities[j]) {
              arrBug.push(vulnerabilities[k])
              break
            }
          }
        }
        upgradeRemain = unavailableRepair.length
      } else {
        EchartsNoneNum++
        upgradeRemain = 0
      }
      //升级的影响
      let impactArr = []
      let impactSeverityNum = [0,0,0,0,0,0]
      if(unavailableRepair.length == 0){
        impactArr = []
      }else{
        for(let i=0;i<unavailableRepair.length;i++){
          for(let j in vulnerabilities){
            if(unavailableRepair[i] == vulnerabilities[j].name){
              impactArr.push(vulnerabilities[j].severity)
              break
            }
          }
        }
      }
      if(impactArr.length == 0 ){
        impactSeverityNum = [0,0,0,0,0,0]
      }else{
        for(let i=0;i<impactArr.length;i++){
          switch(impactArr){
            case 'High' :
              impactSeverityNum[0]++
            case 'Medium' :
              impactSeverityNum[1]++
            case 'Low':
              impactSeverityNum[2]++
            case 'Negligible':
              impactSeverityNum[3]++
            case 'Other':
              impactSeverityNum[4]++
            case 'Unknown':
            default:
              impactSeverityNum[5]++
          }
        }
      }

      let severityMax = 0
      let severityMaxi = 0
      let severityCount = 0
      for (let i=0;i<impactSeverityNum.length;i++){
        if(impactSeverityNum[i] > severityMax){
          severityMax = impactSeverityNum[i]
          severityMaxi = i
          severityCount = severityCount + impactSeverityNum[i]
        }
      }

      if(severityCount == 0){
        upgradeImapct = {
          impactColor:5,
          impactSignal:0,
          impactSorterNum:this.handleImpactSorter(0,5)
        }
      }else{
        upgradeImapct = {
          impactColor:severityMaxi,
          impactSignal:severityMax/severityCount,
          impactSorterNum:this.handleImpactSorter(severityMax/severityCount,severityMaxi)
        }
      }

      // 遍历漏洞信息中的 安全等级，将安全等级信息存入一个数组中
      if (arrBug.length > 0) {
        for (var arr = 0; arr < arrBug.length; arr++) {
          switch (arrBug[arr]['severity']) {
            case "High":
              let HighNum = parseInt(bugcell[0]['High'])
              bugcell[0]['High'] = HighNum + 1
              bugcell[0]['sortNum'] = HighNum + 1
              EchartsHighNum = EchartsHighNum + 1
            case "Medium":
              let MediumNum = parseInt(bugcell[1]["Medium"])
              bugcell[1]["Medium"] = MediumNum + 1
              bugcell[1]["sortNum"] = MediumNum + 1
              EchartsMediumNum = EchartsMediumNum + 1
            case "Low":
              let LowNum = parseInt(bugcell[2]["Low"])
              bugcell[2]["Low"] = LowNum + 1
              bugcell[2]["sortNum"] = LowNum + 1
              EchartsLowNum = EchartsLowNum + 1
            case "Unknown":
              let UnknownNum = parseInt(bugcell[3]["Unknown"])
              bugcell[3]["Unknown"] = UnknownNum + 1
              bugcell[3]["sortNum"] = UnknownNum + 1
              EchartsUnknownNum = EchartsUnknownNum + 1
            case "Negligible":
              let NegligibleNum = parseInt(bugcell[4]["Negligible"])
              bugcell[4]["Negligible"] = NegligibleNum + 1
              bugcell[4]["sortNum"] = NegligibleNum + 1
              EchartsNegligibleNum = EchartsNegligibleNum + 1
            default:
              let OtherNum = parseInt(bugcell[5]["Other"])
              bugcell[5]["Other"] = OtherNum + 1
              bugcell[5]["sortNum"] = OtherNum + 1
              EchartsUnknownNum = EchartsUnknownNum + 1
          }
        }
      } else {
        bugcell = [
          { sortNum: 0, High: 0 },
          { sortNum: 0, Medium: 0 },
          { sortNum: 0, Low: 0 },
          { sortNum: 0, Unknown: 0 },
          { sortNum: 0, Negligible: 0 },
          { sortNum: 0, Other: 0 }
        ]
      }

      //将取到的漏洞状态进行排序
      let max = 0
      for (let a = 0; a < bugcell.length; a++) {
        for (let b = a + 1; b < bugcell.length; b++) {
          if (bugcell[a].sortNum > bugcell[b].sortNum) {
            max = bugcell[a]
            bugcell[a] = bugcell[b]
            bugcell[b] = max
          }
        }
      }

      //取出漏洞状态的前两位，准备传入table中
      const { formatMessage } = this.props.intl
      if (bugcell.length >= 2) {
        bugcellSlice = bugcell.slice(4)
        if (bugcellSlice[0].sortNum == 0 && bugcellSlice[1].sortNum == 0) {
          bugcellValue.nameOne = formatMessage(softwarePackage.noDataText)
        } else {
          delete bugcellSlice[0].sortNum
          delete bugcellSlice[1].sortNum
          for (let d = 0; d < bugcellSlice.length; d++) {
            for (let e in bugcellSlice[d]) {
              bugcellObj.push(e)
              bugcellObj.push(bugcellSlice[d][e])
            }
          }
          bugcellValue.nameOne = bugcellObj[2]
          bugcellValue.valueOne = bugcellObj[3]
          bugcellValue.nameTwo = bugcellObj[0]
          bugcellValue.valueTwo = bugcellObj[1]
        }
      }

      // 介绍了图像
      for (let i = 0; i < layerInfo.length; i++) {
        if (layerInfo[i].iD == features[key].layerID) {
          command = layerInfo[i].command
        }
      }
      let data = {
        key: index.toString(),
        softwarename: features[key].name,
        softwareversions: features[key].version,
        softwarebug: bugcellValue,
        softwareremain: upgradeRemain,
        softwareimpact: upgradeImapct,
        softwarepicture: command
      }
      tableDataSource.push(data)

      index++
    }
    return {
      tableDataSource,
      newData: {
        EchartsUnknownNum,
        EchartsNegligibleNum,
        EchartsLowNum,
        EchartsMediumNum,
        EchartsHighNum,
        EchartsNoneNum,
        index:(index-1)
      }
    }
  }

  handleImpactSorter(arrx,arry){
    let arr = [
      [64,63,62,61],
      [74,73,72,71],
      [84,83,82,81],
      [94,93,92,91]
    ]
    let arrX = this.handleImpactSignal(arrx)
    let arrY = this.handleImpactColor(arry)
    return arr[arrX][arrY]
  }

  handleImpactSignal(singnal) {
    if (0 <= singnal && singnal < 0.25) {
      return 0
    }
    if (0.25 <= singnal && singnal < 0.5) {
      return 1
    }
    if (0.5 <= singnal && singnal < 0.75) {
      return 2
    }if (0.75 <= singnal && singnal <= 1) {
      return 3
    }
    return 0
  }

  handleImpactColor(color){
    switch(color){
      case 1:
        return 0
      case 2:
        return 1
      case 3:
      case 4:
      case 5:
      default:
        return 2
    }
  }

  TempalteUpgradeImpact(object){
    let arr = [
      [SignalOneRed, SignalOneyellow, SignalOnegreen],
      [SignalTwoRed, SignalTwoyellow, SignalTwogreen],
      [SignalThreeRed, SignalThreeyellow, SignalThreegreen],
      [SignalFourRed, SignalFouryellow, SignalFourgreen]
    ]
    let arrX = this.handleImpactSignal(object.impactSignal)
    let arrY = this.handleImpactColor(object.impactColor)
    return (<div>
        <span className='softwareimpactspan'>{object.impactSorterNum}</span>
        <img src={arr[arrX][arrY]} className='softwareimpactimg'/>
      </div>)

  }

  TemplateTableIntroduceInLayer(text){
    if(!text.parameters){
      return (
        <div>
          <span className='softwarepicturelleft'>{text.action}</span>
          <span className="textoverflow softwarepicturespan">{text.parameters}</span>
          <i className="fa fa-database softwarepicturelright" aria-hidden="true"></i>
        </div>
      )
    }
    return (
      <div>
        <span className='softwarepicturelleft'>{text.action}</span>
        <Tooltip title={text.parameters}><span className="textoverflow softwarepicturespan">{text.parameters}</span></Tooltip>
        <i className="fa fa-database softwarepicturelright" aria-hidden="true" onClick={this.handleGetBackLayer.bind(this,text.parameters)}></i>
      </div>
    )
  }

  handleGetBackLayerTop(text){
    const { callback } = this.props
    let getBackInfo = {
      ActiveKey:2,
      LayerCommandParameters:text
    }
    callback(getBackInfo)
  }

  render(){
    const { Unknown, Negligible, Low, Medium, High, None, echarts } = this.state
    const { mirrorsafetyClair, imageName, tag } = this.props
    const { formatMessage } = this.props.intl
    function softwarenameSort(a,b){
      return a.localeCompare(b)
    }
    const softwareColumns = [
      {
        title: formatMessage(softwarePackage.packageName),
        dataIndex: 'softwarename',
        key: 'softwarename',
        width: '13%',
        sorter: (a,b) => softwarenameSort(a.softwarename,b.softwarename)
      },
      {
        title: formatMessage(softwarePackage.packageVersion),
        dataIndex: 'softwareversions',
        key: 'softwareversions',
        width: "14%",
      },
      {
        title: formatMessage(softwarePackage.bug),
        dataIndex: 'softwarebug',
        key: 'softwarebug',
        width: "13%",
        render: text => (
          <div className='softwarebug'>
            <i className="fa fa-exclamation-triangle softwarebugi" aria-hidden="true"></i>
            <span className='softwarebugspan'>{text.nameOne}</span>
            <span className='softwarebugspan'>{text.valueOne}</span>
            <span className='softwarebugspan'>{text.nameTwo}</span>
            <span className='softwarebugspan'>{text.valueTwo}</span>
          </div>)
      },
      {
        title: formatMessage(softwarePackage.remain),
        dataIndex: 'softwareremain',
        key: 'softwareremain',
        width: '17%',
        render: text => (<div className='softwareremain'><i className="fa fa-arrow-circle-right softwareremainspan" aria-hidden="true"></i>{text}</div>),
        sorter:  (a,b) => a.softwareremain - b.softwareremain
      },
      {
        title: formatMessage(softwarePackage.impact),
        dataIndex: 'softwareimpact',
        key: 'softwareimpact',
        width: '17%',
        render: (text) => (
          <div className='softwareimpact'>
            {this.TempalteUpgradeImpact(text)}
          </div>
        ),
        sorter:(a,b) => a.softwareimpact.impactSorterNum - b.softwareimpact.impactSorterNum
      },
      {
        title: formatMessage(softwarePackage.picture),
        dataIndex: 'softwarepicture',
        key: 'softwarepicture',
        width: '20%',
        render: (text) => (<div className='softwarepicture'><span className='softwarepicturelleft'>{text.action}</span><Tooltip title={text.parameters}><span className="textoverflow softwarepicturespan">{text.parameters}</span></Tooltip><i className="fa fa-database softwarepicturelright" aria-hidden="true" onClick={this.handleGetBackLayerTop.bind(this,text.parameters)}></i>
          </div>)
      }
    ]

    const softwarePagination = {
      total: this.TableData().length,
      showSizeChanger: true,
    }

    function EchartsGapTemplate(num) {
      let str = num.toString()
      switch (str.length) {
        case 1:
        default:
          return formatMessage(softwarePackage.echartsGapTemplateHigh)
        case 2:
          return formatMessage(softwarePackage.echartsGapTemplateMedium)
        case 3:
          return formatMessage(softwarePackage.echartsGapTemplateLow)
        case 4:
          return formatMessage(softwarePackage.echartsGapTemplateNegligible)
        case 5:
          return formatMessage(softwarePackage.echartsGapTemplateUnknown)
      }
    }
    let softwareOption = {
      title: {
        text: formatMessage(softwarePackage.hasKnown, {total: this.state.Total}),
        textStyle: {
          fontWeight: 'normal'
        },
        left: '45%',
        top: '12%',
      },
      legend: {
        show: true,
        orient: 'vertical',
        height: 'auto',
        left: '45%',
        top: '30%',
        data: [formatMessage(softwarePackage.high),
          formatMessage(softwarePackage.medium),
          formatMessage(softwarePackage.low),
          formatMessage(softwarePackage.negligible),
          formatMessage(softwarePackage.unknown),
          formatMessage(softwarePackage.noBug)],
        formatter: function (name) {
          if (name == formatMessage(softwarePackage.high)) {
            return EchartsGapTemplate(High) + name
          }
          if (name == formatMessage(softwarePackage.medium)) {
            return EchartsGapTemplate(Medium) + name
          }
          if (name == formatMessage(softwarePackage.low)) {
            return EchartsGapTemplate(Low) + name
          }
          if (name == formatMessage(softwarePackage.negligible)) {
            return EchartsGapTemplate(Negligible) + name
          }
          if (name == formatMessage(softwarePackage.unknown)) {
            return EchartsGapTemplate(Unknown) + name
          }
          if (name == formatMessage(softwarePackage.noBug)) {
            return EchartsGapTemplate(None) + name
          }
        },
        textStyle: {
          fontSize: 14,
          color: '#666'
        },
      },
      tooltip: {
        formatter: '{b}:{c}'
      },
      series: [{
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 5,
        radius: ['50', '70'],
        center: ['25%', '50%'],
        minAngle: '5',
        data: [
          { value: this.state.High, name: formatMessage(softwarePackage.high), selected: true },
          { value: this.state.Medium, name: formatMessage(softwarePackage.medium) },
          { value: this.state.Low, name: formatMessage(softwarePackage.low) },
          { value: this.state.Negligible, name: formatMessage(softwarePackage.negligible) },
          { value: this.state.Unknown, name: formatMessage(softwarePackage.unknown) },
          { value: this.state.None, name: formatMessage(softwarePackage.noBug) }
        ],
        label: {
          normal: {
            position: 'center',
            show: false
          },
          emphasis: {
            show: true,
            position: 'center',
            formatter: '{b} {c}',
            //formatter: function (param) {
            //  return param.percent.toFixed(0) + '%'
            //},
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            color: function (params) {
              const colorList = ['#f6565d', '#fea24c', '#f7c92d', '#c7e7fb', 'grey', '#2abd83']
              return colorList[params.dataIndex]
            },
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 7,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]

    }

    if(Object.keys(mirrorsafetyClair[imageName][tag].result.report).length == 0){
      return <div className='message'>{formatMessage(softwarePackage.noSoftWare)}</div>
    }

    return(<div>
      <div className='softwarePackageTableContent'>
        <div className='softwarePackageEcharts' style={{ width: '100%' }}>
          {
            echarts
            ?<ReactEcharts
              option={softwareOption}
              style={{ height: '220px' }}
            />
            : <div style={{textAlign:'center',paddingTop:'100px'}}><Spin /></div>
          }
        </div>
        <div className='softwarePackageTable'>
          <div className='softwarePackageTableTitle'>
            <div className='softwarePackageTableTitleleft'>{formatMessage(softwarePackage.softWarePackage)}</div>
          </div>
          <div className='softwarePackageTableContent'>
            <Table
              columns={softwareColumns}
              dataSource={this.TableData().tableDataSource}
              pagination={softwarePagination}
            >
            </Table>
          </div>
        </div>
        </div>
    </div>)
  }
}

class SoftwarePackage extends Component {
  constructor(props) {
    super(props)
    this.handleclairStatus = this.handleclairStatus.bind(this)
    this.NodataTemplateSafetyBug = this.NodataTemplateSafetyBug.bind(this)
    this.APIFailedThenScan = this.APIFailedThenScan.bind(this)
    this.APIGetclairInfo = this.APIGetclairInfo.bind(this)
    this.handlemirrorScanstatusSatus = this.handlemirrorScanstatusSatus.bind(this)
    this.handleGetBackLayer = this.handleGetBackLayer.bind(this)
    this.state = {
      softpackageRunning : false,
      softpackageFailed: false,
    }
  }

  handleclairStatus(){
    const { mirrorsafetyClair, imageName, mirrorLayeredinfo, inherwidth, tag } = this.props
    if(!mirrorsafetyClair || !mirrorsafetyClair[imageName] || !mirrorsafetyClair[imageName][tag] || !mirrorsafetyClair[imageName][tag].result){
      return
    }
    const result = mirrorsafetyClair[imageName][tag].result
    const statusCode = result.statusCode
    const status = result.status
    const message = result.message
    const { formatMessage } = this.props.intl
    if(statusCode && statusCode == 500){
      return <div>{message}</div>
    }
    if (statusCode && statusCode == 200) {
      switch (status) {
        case 'running':
          return <div className='BaseScanRunning' data-status="running">
            <div className="top">{formatMessage(softwarePackage.scanning)}</div>
            <Spin/>
            <div className='bottom'><Button onClick={this.APIGetclairInfo} loading={this.state.softpackageRunning}>{formatMessage(softwarePackage.reload)}</Button></div>
          </div>
        case 'finished':
          return <TableTemplate mirrorsafetyClair={mirrorsafetyClair} imageName={imageName} mirrorLayeredinfo={mirrorLayeredinfo} inherwidth={inherwidth} tag={tag} callback={this.handleGetBackLayer}/>
        case 'failed':
          return <div className="BaseScanFailed" data-status="filed">
            <div className='top'>{formatMessage(softwarePackage.scanningFailure)}</div>
            <Button onClick={this.APIFailedThenScan} loading={this.state.softpackageFailed}>{formatMessage(softwarePackage.reload)}</Button>
          </div>
        case 'nojob':
        default:
          return <div className="BaseScanFailed" data-status="nojob">
            <div className="top">{formatMessage(softwarePackage.hasNotBeenScanned)}</div>
            <Button onClick={this.APIFailedThenScan} loading={this.state.softpackageFailed}>{formatMessage(softwarePackage.clickToScan)}</Button>
          </div>
      }
    }
  }

  NodataTemplateSafetyBug(){
    const { mirrorScanstatus, imageName, tag } = this.props
    return (
      <div className='nodata'>{mirrorScanstatus[imageName][tag].message}</div>
    )
  }

  handleGetBackLayer(text){
    const { callback } = this.props
    callback(text)
  }

  APIGetclairInfo(){
    const { loadMirrorSafetyChairinfo, mirrorScanstatus, imageName, tag } = this.props
    const scanstatus = mirrorScanstatus[imageName][tag]
    const blob_sum = scanstatus.result.blobSum || ''
    const full_name = scanstatus.result.fullName
    this.setState({softpackageRunning : true})
    loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag},{
      success:{
        func : () => {
          this.setState({softpackageRunning:false})
        },
        isAsync: true
      },
      failed : {
        func : () => {
          this.setState({softpackageFailed : false})
        },
        isAsync: true
      }
    })
  }

  APIFailedThenScan(){
    const { loadMirrorSafetyScan, loadMirrorSafetyChairinfo, cluster_id, imageName, tag, mirrorScanUrl, mirrorSafetyScan, mirrorScanstatus, scanFailed, formatErrorMessage } = this.props
    const registry = mirrorScanUrl
    const scanstatus = mirrorScanstatus[imageName][tag]
    const blob_sum = scanstatus.result.blobSum || ''
    const full_name = scanstatus.result.fullName
    const { formatMessage } = this.props.intl
    const config = {
      cluster_id,
      imageName,
      tag,
      registry,
      full_name
    }
    this.setState({softpackageFailed : true})
    if(mirrorSafetyScan[imageName] && mirrorSafetyScan[imageName][tag]){
      return loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag},{
        success : {
          func: () => {
            this.setState({softpackageFailed : false})
          },
          isAsync: true
        },
        failed : {
          func : () => {
            this.setState({softpackageFailed : false})
          },
          isAsync: true
        }
      })
    }
    return loadMirrorSafetyScan({...config}, {
      success: {
        func: () =>{
          loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag},{
            success : {
              func: () => {
                this.setState({softpackageFailed : false})
              },
              isAsync: true
            },
            failed : {
              func : () => {
                this.setState({softpackageFailed : false})
              },
              isAsync: true
            }
          })
        },
        isAsync : true
      },
      failed : {
        func : (res) => {
          this.setState({softpackageFailed : false})

          new NotificationHandler().error(formatMessage(softwarePackage.errMsg, {name: imageName, tag, msg: formatErrorMessage(res)}))
          //scanFailed('failed')
        },
        isAsync: true
      }
    })
  }

  handlemirrorScanstatusSatus(status){
    const { formatMessage } = this.props.intl
    switch(status){
      case 'noresult':
        return <span>{formatMessage(softwarePackage.hasNotAndReload)}</span>
      case 'different':
        return <span>{formatMessage(softwarePackage.differentResult)}</span>
      case 'failed':
        return <span>{formatMessage(softwarePackage.scanningFailure)}</span>
      default:
        return <span></span>
    }
  }

  render() {
    const { formatMessage } = this.props.intl
    const { imageName, tag, mirrorScanstatus, mirrorsafetyClair } = this.props
    let statusCode = 200
    let status = ''
    if(!mirrorScanstatus[imageName] || !mirrorScanstatus[imageName][tag] || !mirrorScanstatus[imageName][tag].result){
      return <div style={{textAlign:'center',paddingTop:'50px'}}><Spin /></div>
    }
    if(mirrorScanstatus[imageName][tag].result.status){
      status = mirrorScanstatus[imageName][tag].result.status
    }
    if(mirrorScanstatus[imageName][tag].result.statusCode == 500){
      statusCode == 500
    }
    if(status == 'different' || status == "failed"){
      if(!mirrorsafetyClair[imageName] || !mirrorsafetyClair[imageName][tag]){
        return (
          <div className='BaseScanFailed' data-status="scanstatus">
            <div className='top'>{this.handlemirrorScanstatusSatus(status)}</div>
            <Button onClick={this.APIFailedThenScan} loading={this.state.softpackageFailed}>{formatMessage(softwarePackage.clickToScan)}</Button>
          </div>
        )
      }else{
        return (
          <div id="SoftwarePackage">
            {statusCode == 500 ? this.NodataTemplateSafetyBug() : this.handleclairStatus()}
          </div>
        )
      }
    }
    return (
      <div id="SoftwarePackage">
        {statusCode == 500 ? this.NodataTemplateSafetyBug() : this.handleclairStatus()}
      </div>
    )
  }
}

function mapStateToProps(state,props){
  const { images, entities } = state
  const { imageType } = props
  let mirrorScanUrl = ''
  if (images[imageType][DEFAULT_REGISTRY] && images[imageType][DEFAULT_REGISTRY].server) {
    mirrorScanUrl = images[imageType][DEFAULT_REGISTRY].server
  }
  let mirrorsafetyClair = images.mirrorSafetyClairinfo
  let mirrorSafetyScan = images.mirrorSafetyScan
  let cluster_id = entities.current.cluster.clusterID
  let mirrorLayeredinfo = images.mirrorSafetyLayerinfo
  let mirrorScanstatus = images.mirrorSafetyScanStatus
  return {
    cluster_id,
    mirrorsafetyClair,
    mirrorSafetyScan,
    mirrorScanUrl,
    mirrorLayeredinfo,
    mirrorScanstatus
  }
}

export default connect(mapStateToProps, {
  loadMirrorSafetyScan,
  loadMirrorSafetyChairinfo
})(injectIntl(SoftwarePackage, {withRef: true}))

//  {/*<div className='softwarePackageTableTitleright'>*/}
//{/*<Input.Group style={{ width: '200px', marginRight: '35px' }}>*/}
//{/*<Select*/}
//{/*combobox*/}
//{/*notFoundContent=""*/}
//{/*filterOption={false}*/}
//{/*placeholder='Filter Vulnerabilities'*/}
//{/*style={{ width: '180px', height: '30px', borderRadius: '3px 0 0 3px' }}*/}
//{/*>*/}
//{/*<Option value="0">请选择1</Option>*/}
//{/*<Option value="1">请选择1</Option>*/}
//{/*<Option value="2">请选择2</Option>*/}
//{/*</Select>*/}
//{/*<div className="ant-input-group-wrap"*/}
//{/*style={{ display: 'inline-block', verticalAlign: 'top', marginLeft: '5px' }}>*/}
//{/*<Button>*/}
//{/*<Icon type="search" />*/}
//{/*</Button>*/}
//{/*</div>*/}
//{/*</Input.Group>*/}
//{/*</div>*/}
//</div>

//render: (text) => (
//  <div className='softwarepicture'><span className='softwarepicturelleft'>{text.action}</span><Tooltip title={text.parameters}><span className="textoverflow softwarepicturespan">{text.parameters}</span></Tooltip><i className="fa fa-database softwarepicturelright" aria-hidden="true" onClick={this.handleGetBackLayer.bind(this,text.parameters)}></i></div>)
