/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * MirrorSafetyBug component
 *
 * v0.1 - 2017-3-22
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Card, Spin, Icon, Select, Tabs, Button, Steps, Checkbox, Input, Table, Tooltip } from 'antd'
import { injectIntl } from 'react-intl'
import ReactEcharts from 'echarts-for-react'
import './style/MirrorSafetyBug.less'
import { loadMirrorSafetyScan, loadMirrorSafetyChairinfo } from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { connect } from 'react-redux'
import NotificationHandler from '../../../../components/Notification'
import safetyBugImg from '../../../../assets/img/appCenter/mirrorSafety/safetybug.png'
import mirrorSafetyBugIntl from './intl/mirrorSafetyBugIntl'
import detailIndexIntl from './intl/detailIndexIntl'

const TabPane = Tabs.TabPane
const Step = Steps.Step
const Option = Select.Option

class TableTemplate extends Component{
  constructor(props){
    super(props)
    this.tableDatasource = this.tableDatasource.bind(this)
    this.tableSeverityColor = this.tableSeverityColor.bind(this)
    this.tableSubNo = this.tableSubNo.bind(this)
    this.tableSubNo = this.tableSubNo.bind(this)
    this.state = {
      Unknown: 0,
      Negligible: 0,
      Low: 0,
      Medium: 0,
      High: 0,
      Total: 0,
      PatchTotal: 0,
      echarts : true,
    }
  }

  componentDidMount() {
    const EchartsDate = this.tableDatasource().EchartsDate
    if(EchartsDate){
      this.setState({
        Unknown: EchartsDate.EchartsUnknownNum ,
        Negligible: EchartsDate.EchartsNegligibleNum,
        Low: EchartsDate.EchartsLowNum,
        Medium: EchartsDate.EchartsMediumNum,
        High: EchartsDate.EchartsHighNum,
        Total : (EchartsDate.EchartsUnknownNum + EchartsDate.EchartsNegligibleNum + EchartsDate.EchartsLowNum + EchartsDate.EchartsMediumNum + EchartsDate.EchartsHighNum),
        PatchTotal:　EchartsDate.EchartsFixedIn
      })
    }
  }

  componentWillReceiveProps(nextProps){
    const mirrorsafetyClair = nextProps.mirrorsafetyClair
    const imageName = nextProps.imageName
    const tag = nextProps.tag
    if(tag == this.props.tag || nextProps.inherwidth !== 1){
      this.setState({
        echarts : true
      })
    }
    if(tag !== this.props.tag || nextProps.inherwidth !== 1){
      this.setState({
        echarts : false
      })
    }
    if(tag !== this.props.tag || nextProps.inherwidth == 1){
      setTimeout(()=> {
        this.setState({
          echarts : true
        })
      })
    }
    if(tag !== this.props.tag && nextProps.inherwidth == 1){
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
      const clairVulnerabilities = result.vulnerabilities
      const clairFeatures = result.features
      const clairFixedIn = result.fixedIn
      // Echarts 数据
      let EchartsUnknownNum = 0
      let EchartsNegligibleNum = 0
      let EchartsLowNum = 0
      let EchartsMediumNum = 0
      let EchartsHighNum = 0
      let EchartsNoneNum = 0
      let EchartsFixedIn = 0
      if(!clairVulnerabilities || Object.keys(clairVulnerabilities).length == 0){
        return
      }
      for(let keyVulner in clairVulnerabilities){
        let software = clairVulnerabilities[keyVulner].features
        if(software.length > 1){
          for(let keyFix in clairFixedIn){
            let RVersionStr = keyVulner + software[0].substring(0,1).toUpperCase()+software[0].replace(/-/g, '').substring(1,software[0].length)
            if(RVersionStr == keyFix){
              EchartsFixedIn++
              break
            }
          }
          switch(clairVulnerabilities[keyVulner].severity){
            case "High" :
              EchartsHighNum++;
              break;
            case "Medium" :
              EchartsMediumNum++;
              break;
            case "Low" :
              EchartsLowNum++;
              break;
            case "Negligible" :
              EchartsNegligibleNum++;
              break;
            case "Unknown" :
            default :
              EchartsUnknownNum++;
              break;
          }
        }else{
          for(let keyFix in clairFixedIn){
            let RVersionStr = keyVulner + software[0].substring(0,1).toUpperCase()+software[0].replace(/-/g, '').substring(1,software[0].length)
            if(RVersionStr == keyFix){
              EchartsFixedIn++
              break
            }
          }

          switch(clairVulnerabilities[keyVulner].severity){
            case "High" :
              EchartsHighNum++;
              break;
            case "Medium" :
              EchartsMediumNum++;
              break;
            case "Low" :
              EchartsLowNum++;
              break;
            case "Negligible" :
              EchartsNegligibleNum++;
              break;
            case "Unknown" :
            default :
              EchartsUnknownNum++;
              break;
          }
        }
      }

      this.setState({
        Unknown: EchartsUnknownNum ,
        Negligible: EchartsNegligibleNum,
        Low: EchartsLowNum,
        Medium: EchartsMediumNum,
        High: EchartsHighNum,
        Total : (EchartsUnknownNum + EchartsNegligibleNum + EchartsLowNum + EchartsMediumNum + EchartsHighNum),
        PatchTotal: EchartsFixedIn})
    }
  }

  tableDatasource(){
    const { mirrorsafetyClair, mirrorLayeredinfo, imageName, tag } = this.props
    const { formatMessage } = this.props.intl
    let tabledatasource = []
    if(!mirrorsafetyClair[imageName] || !mirrorsafetyClair[imageName][tag] || !mirrorsafetyClair[imageName][tag].result || Object.keys(mirrorsafetyClair[imageName][tag].result.report).length == 0 || !mirrorLayeredinfo[imageName][tag].result){
      return tabledatasource = []
    }
    const result =  mirrorsafetyClair[imageName][tag].result.report
    const clairVulnerabilities =result.vulnerabilities
    const clairFeatures = result.features
    const clairFixedIn = result.fixedIn
    const layerInfo = mirrorLayeredinfo[imageName][tag].result
    let index = 1
    // Echarts 数据
    let EchartsUnknownNum = 0
    let EchartsNegligibleNum = 0
    let EchartsLowNum = 0
    let EchartsMediumNum = 0
    let EchartsHighNum = 0
    let EchartsNoneNum = 0
    let EchartsFixedIn = 0

    if(!clairVulnerabilities || Object.keys(clairVulnerabilities).length == 0){
      return tabledatasource = []
    }else{
      for(let keyVulner in clairVulnerabilities){
        let CVEobj = {}
        let CVersion = ''
        let RVersion = ''
        let softwareID = ''
        let software = ''
        let Command = {}
        let data = {}
        software = clairVulnerabilities[keyVulner].features
        if(software.length > 1){
          // CVE
          CVEobj = {
            name:clairVulnerabilities[keyVulner].name,
            link:clairVulnerabilities[keyVulner].link
          }
          // 当前版本
          for(let keyFea in clairFeatures){
            if(clairVulnerabilities[keyVulner].features[0] == clairFeatures[keyFea].name){
              CVersion = clairFeatures[keyFea].version
              softwareID = clairFeatures[keyFea].layerID
              break
            }
          }

          // 修正版
          if(!clairFixedIn){
            RVersion = formatMessage(mirrorSafetyBugIntl.noRevision)
          }else{
            for(let keyFix in clairFixedIn){
              let RVersionStr = keyVulner + software[0].substring(0,1).toUpperCase()+software[0].replace(/-/g, '').substring(1,software[0].length)
              if(RVersionStr == keyFix){
                RVersion = clairFixedIn[keyFix]
                EchartsFixedIn++
                break
              }
              if(RVersion == '' ){
                RVersion = formatMessage(mirrorSafetyBugIntl.noRevision)
              }
            }
          }

          // 位于镜像
          for(let i = 0; i < layerInfo.length; i++){
            if(softwareID == layerInfo[i].iD){
              Command = layerInfo[i].command
              break
            }
          }

           //漏洞数量统计
          switch(clairVulnerabilities[keyVulner].severity){
            case "High" :
              EchartsHighNum++;
              break;
            case "Medium" :
              EchartsMediumNum++;
              break;
            case "Low" :
              EchartsLowNum++;
              break;
            case "Negligible" :
              EchartsNegligibleNum++;
              break;
            case "Unknown" :
            default :
              EchartsUnknownNum++;
              break;
          }
          for(let i = 0; i < software.length; i++){
            data = {
              key: index,
              CVE: CVEobj,
              severity: clairVulnerabilities[keyVulner].severity,
              software: software[i],
              currentVersion: CVersion,
              reversion: RVersion,
              layerInfo: Command,
              description: this.tableSub()
            }
            tabledatasource.push(data)
            index++
            data = {}
          }
        }else{
          // CVE
          CVEobj = {
            name:clairVulnerabilities[keyVulner].name,
            link:clairVulnerabilities[keyVulner].link
          }
          // 当前版本
          for(let keyFea in clairFeatures){
            if(clairVulnerabilities[keyVulner].features[0] == clairFeatures[keyFea].name){
              CVersion = clairFeatures[keyFea].version
              softwareID = clairFeatures[keyFea].layerID
              break
            }
          }

          // 修正版
          if(!clairFixedIn){
            RVersion = formatMessage(mirrorSafetyBugIntl.noRevision)
          }else{
            for(let keyFix in clairFixedIn){
              let RVersionStr = keyVulner + software[0].substring(0,1).toUpperCase()+software[0].replace(/-/g, '').substring(1,software[0].length)
              if(RVersionStr == keyFix){
                RVersion = clairFixedIn[keyFix]
                EchartsFixedIn++
                break
              }
              if(RVersion == '' ){
                RVersion = formatMessage(mirrorSafetyBugIntl.noRevision)
              }
            }
          }

          // 位于镜像
          for(let i = 0; i < layerInfo.length; i++){
            if(softwareID == layerInfo[i].iD){
              Command = layerInfo[i].command
              break
            }
          }

          // 漏洞数量统计
          switch(clairVulnerabilities[keyVulner].severity){
            case "High" :
              EchartsHighNum++;
              break;
            case "Medium" :
              EchartsMediumNum++;
              break;
            case "Low" :
              EchartsLowNum++;
              break;
            case "Negligible" :
              EchartsNegligibleNum++;
              break;
            case "Unknown" :
            default :
              EchartsUnknownNum++;
              break;
          }
          if(clairVulnerabilities[keyVulner].cVSSv2 && Object.keys(clairVulnerabilities[keyVulner].cVSSv2).length !== 0){
            clairVulnerabilities[keyVulner].cVSSv2.des = clairVulnerabilities[keyVulner].description
            data = {
              key: index,
              CVE: CVEobj,
              severity: clairVulnerabilities[keyVulner].severity,
              software: software[0],
              currentVersion: CVersion,
              reversion: RVersion,
              layerInfo: Command,
              description: this.tableSub(clairVulnerabilities[keyVulner].cVSSv2)
            }
          }else{
            let des = clairVulnerabilities[keyVulner].description
            data = {
              key: index,
              CVE: CVEobj,
              severity: clairVulnerabilities[keyVulner].severity,
              software: software[0],
              currentVersion: CVersion,
              reversion: RVersion,
              layerInfo: Command,
              description: this.tableSubNo(des)
            }
          }
          tabledatasource.push(data)
          index++
        }
      }
      return {
        tabledatasource,
        EchartsDate: {
          EchartsUnknownNum,
          EchartsNegligibleNum,
          EchartsLowNum,
          EchartsMediumNum,
          EchartsHighNum,
          EchartsFixedIn
        }
      }
    }
  }

  tableSeverityColor(severity){
    if(!severity){
      return
    }
    switch(severity){
      case 'High':
        return 'severityHigh'
      case 'Medium':
        return 'severityMedium'
      case 'Low':
        return 'severityLow'
      case 'Negligible':
        return 'severityNegligible'
      case 'Unknown':
      default:
        return 'severityUnknown'
    }
  }

  tableSubNo(str){
    return(
      <div className='tableSUBnNo'>
        {str}
      </div>
    )
  }

  tableSub(object){
    const data = object || {}
    const { formatMessage } = this.props.intl
    const accessVectorArr = ['',formatMessage(mirrorSafetyBugIntl.accessVectorArr2),formatMessage(mirrorSafetyBugIntl.accessVectorArr3),formatMessage(mirrorSafetyBugIntl.accessVectorArr4)]
    function accessVectorFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = accessVectorArr[data.accessVector]
        if( value == formatMessage(mirrorSafetyBugIntl.accessVectorArr2) && value == text){
          return 'red'
        }
        if(value == formatMessage(mirrorSafetyBugIntl.accessVectorArr3) && value == text){
          return 'orange'
        }
        if(value == formatMessage(mirrorSafetyBugIntl.accessVectorArr4) && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }
    const accessComplexityArr = ['',formatMessage(mirrorSafetyBugIntl.accessComplexityArr2),formatMessage(mirrorSafetyBugIntl.accessComplexityArr3),formatMessage(mirrorSafetyBugIntl.accessComplexityArr4)]
    function accessComplexityFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = accessComplexityArr[data.accessComplexity]
        if( value == formatMessage(mirrorSafetyBugIntl.accessComplexityArr2) && value == text){
          return 'red'
        }
        if(value == formatMessage(mirrorSafetyBugIntl.accessComplexityArr3) && value == text){
          return 'orange'
        }
        if(value == formatMessage(mirrorSafetyBugIntl.accessComplexityArr4) && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }

    const authenticationArr = ['',formatMessage(mirrorSafetyBugIntl.authenticationArr2),formatMessage(mirrorSafetyBugIntl.authenticationArr3),formatMessage(mirrorSafetyBugIntl.authenticationArr4)]
    function authenticationFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = authenticationArr[data.authentication]
        if( value == formatMessage(mirrorSafetyBugIntl.authenticationArr2) && value == text){
          return 'red'
        }
        if(value == formatMessage(mirrorSafetyBugIntl.authenticationArr3) && value == text){
          return 'orange'
        }
        if(value == formatMessage(mirrorSafetyBugIntl.authenticationArr4) && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }

    const confidentialityImpactArr = ['',formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr2),
      formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr3),
      formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr4)]
    function confidentialityImpactFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = confidentialityImpactArr[data.confidentialityImpact]
        if( value == formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr2) && value == text){
          return 'red'
        }
        if(value == formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr3) && value == text){
          return 'orange'
        }
        if(value == formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr4) && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }

    const integrityImpactArr = ['',formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr2),formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr3),formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr4)]
    function integrityImpactFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = integrityImpactArr[data.integrityImpact]
        if( value == formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr2) && value == text){
          return 'red'
        }
        if(value == formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr3) && value == text){
          return 'orange'
        }
        if(value == formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr4) && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }
    const columns1 = [{
      title: formatMessage(mirrorSafetyBugIntl.visit),
      dataIndex: 'name',
      key: 'name',
      width: '18%',
      render: text => (<span style={{color:accessVectorFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span >{text}</span></span>)
    }, {
      title: formatMessage(mirrorSafetyBugIntl.complex),
      dataIndex: 'age',
      width: '18%',
      key: 'age',
      render: text => (<span style={{color: accessComplexityFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span >{text}</span></span>)
    }, {
      title: formatMessage(mirrorSafetyBugIntl.authentication),
      dataIndex: 'address',
      width: '15%',
      key: 'address',
      render: text => (<span style={{color:authenticationFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span>{text}</span></span>)
    }, {
      title: formatMessage(mirrorSafetyBugIntl.privacy),
      dataIndex: 'address1',
      width: '21%',
      key: 'address1',
      render: text => (<span style={{color:confidentialityImpactFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span>{text}</span></span>)
    }, {
      title: formatMessage(mirrorSafetyBugIntl.completeness),
      dataIndex: 'address2',
      key: 'address2',
      width: '21%',
      render: text => (<span style={{color:integrityImpactFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span >{text}</span></span>)
    }]

    // 表格数据
    const dataSource1 = [{
      key: '1',
      name: formatMessage(mirrorSafetyBugIntl.accessVectorArr2),
      age: formatMessage(mirrorSafetyBugIntl.accessComplexityArr2),
      address: formatMessage(mirrorSafetyBugIntl.authenticationArr2),
      address1:  formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr2),
      address2:  formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr2),
    }, {
      key: '2',
      name: formatMessage(mirrorSafetyBugIntl.accessVectorArr3),
      age: formatMessage(mirrorSafetyBugIntl.accessComplexityArr3),
      address: formatMessage(mirrorSafetyBugIntl.authenticationArr3),
      address1: formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr3),
      address2: formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr3),
    }, {
      key: '3',
      name: formatMessage(mirrorSafetyBugIntl.accessVectorArr4),
      age: formatMessage(mirrorSafetyBugIntl.accessComplexityArr4),
      address: formatMessage(mirrorSafetyBugIntl.authenticationArr4),
      address1:formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr4),
      address2:formatMessage(mirrorSafetyBugIntl.confidentialityImpactArr4),
    }]

    return (
      <div className='tablesub'>
        <div className='tablesubtitle'>{formatMessage(mirrorSafetyBugIntl.vector)}<span style={{marginLeft:'8px',fontSize:'12px'}}>{formatMessage(mirrorSafetyBugIntl.currentScore, {score: data.score})}</span></div>
        <div className='tablesubbody'>
          <Table
            columns={columns1}
            dataSource={dataSource1}
            pagination={false}
            size="small"
          >
          </Table>
        </div>
        <div className='tablesubtitlefooter'>{formatMessage(mirrorSafetyBugIntl.describe)}</div>
        <div className='tablesubtitlefooteritem'>
          {data.des}
        </div>
      </div>
    )
  }

  handleGetBackLayer(text){
    const { callback } = this.props
    let getBackInfo = {
      ActiveKey:2,
      LayerCommandParameters:text
    }
    callback(getBackInfo)
  }

  render(){
    const { formatMessage } = this.props.intl
    const { Unknown, Negligible, Low, Medium, High, echarts }=this.state
    const { mirrorsafetyClair, imageName, tag } = this.props
    function EchartsGapTemplate(num){
      let str = num.toString()
      switch(str.length){
        case 1:
        default:
          return formatMessage(mirrorSafetyBugIntl.echartsGapTemplateHigh, {num, name: imageName})
        case 2:
          return formatMessage(mirrorSafetyBugIntl.echartsGapTemplateMedium, {num, name: imageName})
        case 3:
          return formatMessage(mirrorSafetyBugIntl.echartsGapTemplateLow, {num, name: imageName})
        case 4:
          return formatMessage(mirrorSafetyBugIntl.echartsGapTemplateNegligible, {num, name: imageName})
        case 5:
          return formatMessage(mirrorSafetyBugIntl.echartsGapTemplateUnknown, {num, name: imageName})
      }
    }

    let safetybugOption = {
      title: {
        text: formatMessage(mirrorSafetyBugIntl.foundBug, {total: this.state.Total,patchTotal: this.state.PatchTotal}),
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
          data: [formatMessage(mirrorSafetyBugIntl.high),
            formatMessage(mirrorSafetyBugIntl.medium),
            formatMessage(mirrorSafetyBugIntl.low),
            formatMessage(mirrorSafetyBugIntl.negligible),
            formatMessage(mirrorSafetyBugIntl.unknown)]
        ,
          formatter: function (name) {
            if (name == formatMessage(mirrorSafetyBugIntl.high)) {
              return EchartsGapTemplate(High) + name
            }
            if (name == formatMessage(mirrorSafetyBugIntl.medium)) {
              return EchartsGapTemplate(Medium) + name
            }
            if (name == formatMessage(mirrorSafetyBugIntl.low)) {
              return EchartsGapTemplate(Low) + name
            }
            if (name == formatMessage(mirrorSafetyBugIntl.negligible)) {
              return EchartsGapTemplate(Negligible) + name
            }
            if (name == formatMessage(mirrorSafetyBugIntl.unknown)) {
              return EchartsGapTemplate(Unknown) + name
            }
        },
        textStyle: {
          fontSize: 14,
          color: '#666'
        },
      },
      tooltip: {
        formatter: '{b} : {c}'
      },
      series: [{
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 5,
        radius: ['50', '70'],
        center: ['25%', '50%'],
        minAngle:'5',
        data: [
          {value: this.state.High, name: formatMessage(mirrorSafetyBugIntl.high), selected: true},
          {value: this.state.Medium, name: formatMessage(mirrorSafetyBugIntl.medium)},
          {value: this.state.Low, name: formatMessage(mirrorSafetyBugIntl.low)},
          {value: this.state.Negligible, name: formatMessage(mirrorSafetyBugIntl.negligible)},
          {value: this.state.Unknown, name: formatMessage(mirrorSafetyBugIntl.unknown) }
        ],
        label: {
          normal: {
            position: 'center',
            show: false
          },
          emphasis: {
            show: true,
            position: 'center',
            formatter: '{b} : {c}',
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            color: function(params){
              const colorList = ['#fa4f55', '#f7a45e', '#fbc82f', '#c7eafe', '#2abd83'];
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

    const severityLevel = {
      "High": 100,
      "Medium": 99,
      "Low": 98,
      "Negligible":97,
      "Unknown":96
    }

    function severitySort(s){
      if (!(s in severityLevel)) {
        return -100
      }
      return severityLevel[s]
    }

    function softwareSort(a,b){
      return a.localeCompare(b)
    }

    const columns = [{
      title: 'CVE',
      width: '15%',
      dataIndex: 'CVE',
      key: 'CVE',
      render: text => (
        <span className='CVE'><span className='CVEspan'>{text.name}</span><a href={text.link} target="_blank"><i className="fa fa-link CVEi" aria-hidden="true"></i></a></span>)
    }, {
      title: formatMessage(mirrorSafetyBugIntl.critical),
      width: '13%',
      dataIndex: 'severity',
      key: 'severity',
      render: text => (<span className={this.tableSeverityColor(text)}><i className="fa fa-exclamation-triangle severityi" aria-hidden="true"></i><span>{text}</span></span>),
      sorter: (a, b) => severitySort(a.severity) - severitySort(b.severity),
    }, {
      title: formatMessage(mirrorSafetyBugIntl.softwarePackage),
      width: '11%',
      dataIndex: 'software',
      key: 'software',
      sorter:(a, b) => softwareSort(a.software, b.software)
    }, {
      title: formatMessage(mirrorSafetyBugIntl.currentVersion),
      width: '15%',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
    }, {
      title:  formatMessage(mirrorSafetyBugIntl.revision),
      width: '15%',
      dataIndex: 'reversion',
      key: 'reversion',
      render: text => (<span className='reversion' style={{color: text == formatMessage(mirrorSafetyBugIntl.noRevision) ? 'red' : '#5bcea3' }}><i className="fa fa-arrow-circle-right reversioni" aria-hidden="true"></i>{text}</span>),
    }, {
      title: formatMessage(mirrorSafetyBugIntl.layerInfo),
      width: '27%',
      dataIndex: 'layerInfo',
      key: 'layerInfo',
      render: text => (<div className='layerInfo'><span className='safetybugtablepoint'>{text.action}</span><Tooltip title={text.parameters}><span className='textoverflow layerInfospan'>{text.parameters}</span></Tooltip><i className="fa fa-database softwarepicturelright" aria-hidden="true" onClick={this.handleGetBackLayer.bind(this,text.parameters)}></i></div>),
    }]

    const softwarePagination = {
      total: this.tableDatasource().length,
      showSizeChanger: true,
    }

    if(Object.keys(mirrorsafetyClair[imageName][tag].result.report).length == 0 || !mirrorsafetyClair[imageName][tag].result.report.vulnerabilities){
      return <div className='message'>
        <img src={safetyBugImg}/>
        <div>{formatMessage(mirrorSafetyBugIntl.thereIsNoBug)}</div>
      </div>
    }

    return (
      <div>
        <div className='safetybugEcharts'>
          <div style={{width: '100%',height:'220px'}}>
            {
              echarts
              ? <ReactEcharts
                  option={safetybugOption}
                  style={{height: '220px'}}
                />
              : <div style={{textAlign:'center',paddingTop:'100px'}}><Spin /></div>
            }
          </div>
        </div>
        <div className='safetybugmirror'>
          <div className='safetybugmirrortitle'>
            <div className='safetybugmirrortitleleft'>{formatMessage(mirrorSafetyBugIntl.imageBug)}</div>
          </div>
          <div className="safetybugtable">
            <Table
              columns={columns}
              dataSource={this.tableDatasource().tabledatasource}
              pagination={softwarePagination}
              expandedRowRender={record => <span>{record.description}</span>}
            >
            </Table>
          </div>
        </div>
      </div>
    )
  }
}
TableTemplate = injectIntl(TableTemplate, {withRef: true})
class MirrorSafetyBug extends Component {
  constructor(props){
    super(props)
    this.NodataTemplateSafetyBug = this.NodataTemplateSafetyBug.bind(this)
    this.handleclairStatus = this.handleclairStatus.bind(this)
    this.APIGetclairInfo = this.APIGetclairInfo.bind(this)
    this.APIFailedThenScan = this.APIFailedThenScan.bind(this)
    this.sendObjectToTop = this.sendObjectToTop.bind(this)
    this.handlemirrorScanstatusSatus = this.handlemirrorScanstatusSatus.bind(this)
    this.state = {
      Unknown: 0,
      Negligible: 0,
      Low: 0,
      Medium: 0,
      High: 0,
      Total: 0,
      PatchTotal: 0,
      loading:false,
      clairFailed: false
    }
  }
  NodataTemplateSafetyBug(){
    const { mirrorScanstatus, imageName, tag } = this.props
    return (
      <div className='message'>{mirrorScanstatus[imageName][tag].result.message}</div>
    )
  }

  APIGetclairInfo(){
    const { loadMirrorSafetyChairinfo, mirrorScanstatus, imageName, tag } = this.props
    const scanstatus = mirrorScanstatus[imageName][tag]
    const blob_sum = scanstatus.result.blobSum || ''
    const full_name = scanstatus.result.fullName
    this.setState({loading:true})
    loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag},{
      success:{
        func:() => {
          this.setState({loading:false})
        },
        isAsync: true
      },
      failed : {
        func : () => {
          this.setState({loading:false})
        },
        isAsync : true
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
    this.setState({clairFailed : true})
    if(mirrorSafetyScan[imageName] && mirrorSafetyScan[imageName][tag]){
      return loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag},{
        success: {
          func: () => {
            this.setState({clairFailed : false})
          },
          isAsync : true
        },
        failed:{
          func: () => {
            this.setState({clairFailed : false})
          },
          isAsync: true
        }
      })
    }
    return loadMirrorSafetyScan({...config}, {
      success: {
        func: () =>{
          loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag},{
            success: {
              func: () => {
                this.setState({clairFailed : false})
              },
              isAsync : true
            },
            failed:{
              func: () => {
                this.setState({clairFailed : false})
              },
              isAsync: true
            }
          })
        },
        isAsync : true
      },
      failed:{
        func: (res) => {
          this.setState({clairFailed : false})
          new NotificationHandler().error(formatMessage(detailIndexIntl.errMsg, {name: imageName, tag: tag, msg: formatErrorMessage(res)}))
          //scanFailed('failed')
        },
        isAsync: true
      }
    })
  }

  sendObjectToTop(obj){
    const { callback } = this.props
    callback(obj)
  }

  handleclairStatus(){
    const { mirrorsafetyClair, imageName, mirrorLayeredinfo, tag, inherwidth } = this.props
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
            <div className="top">{formatMessage(mirrorSafetyBugIntl.scanning)}</div>
            <Spin/>
            <div className='bottom'><Button onClick={this.APIGetclairInfo} loading={this.state.loading}>{formatMessage(mirrorSafetyBugIntl.reload)}</Button></div>
          </div>
        case 'finished':
          return <TableTemplate mirrorsafetyClair={mirrorsafetyClair} imageName={imageName} mirrorLayeredinfo={mirrorLayeredinfo} callback={this.sendObjectToTop} tag={tag} inherwidth={inherwidth}/>
        case 'failed':
          return <div className="BaseScanFailed" data-status="clair">
            <div className='top'>{formatMessage(mirrorSafetyBugIntl.scanFailure)}</div>
            <Button onClick={this.APIFailedThenScan} loading={this.state.clairFailed}>{formatMessage(mirrorSafetyBugIntl.reload)}</Button>
          </div>
        case 'nojob':
        default:
          return <div className="BaseScanFailed" data-status="nojob">
            <div className="top">{formatMessage(mirrorSafetyBugIntl.hasNotBeenScanned)}</div>
            <Button onClick={this.APIFailedThenScan} loading={this.state.clairFailed}>{formatMessage(mirrorSafetyBugIntl.toScan)}</Button>
          </div>
      }
    }
  }

  handlemirrorScanstatusSatus(status){
    const { formatMessage } = this.props.intl
    switch(status){
      case 'noresult':
        return <span>{formatMessage(mirrorSafetyBugIntl.hasNotAndReload)}</span>
      case 'different':
        return <span>{formatMessage(mirrorSafetyBugIntl.differentResult)}</span>
      case 'failed':
        return <span>{formatMessage(mirrorSafetyBugIntl.scanFailure)}</span>
      default:
        return <span></span>
    }
  }

  render(){
    const { imageName, tag, mirrorScanstatus, mirrorsafetyClair} = this.props
    const { formatMessage } = this.props.intl
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
    if(status == 'different' || status == 'failed'){
      if(!mirrorsafetyClair[imageName] || !mirrorsafetyClair[imageName][tag]){
        return (
          <div className='BaseScanFailed' data-status="scanstatus">
            <div className='top'>{this.handlemirrorScanstatusSatus(status)}</div>
            <Button onClick={this.APIFailedThenScan} loading={this.state.clairFailed}>{formatMessage(mirrorSafetyBugIntl.reScan)}</Button>
          </div>
        )
      }else{
        return (
          <div id="MirrorSafetyBug">
            {statusCode == 500 ? this.NodataTemplateSafetyBug() : this.handleclairStatus()}
          </div>
        )
      }
    }
    return (
      <div id="MirrorSafetyBug">
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
  let mirrorLayeredinfo = images.mirrorSafetyLayerinfo
  let mirrorScanstatus = images.mirrorSafetyScanStatus
  let mirrorSafetyScan = images.mirrorSafetyScan
  let cluster_id = entities.current.cluster.clusterID
  return {
    cluster_id,
    mirrorsafetyClair,
    mirrorSafetyScan,
    mirrorScanUrl,
    mirrorLayeredinfo,
    mirrorScanstatus,
  }
}

export default connect(mapStateToProps, {
  loadMirrorSafetyScan,
  loadMirrorSafetyChairinfo
})(injectIntl(MirrorSafetyBug, {withRef: true}))

//    {/*/!*<div className="safetybugmirrortitleright">*!/*/}
//    {/*/!*<Checkbox style={{float: 'left', width: '120px', marginTop: '6px'}}>只显示可修复</Checkbox>*!/*/}
//    {/*/!*<Input.Group style={{float: 'left', width: '200px'}}>*!/*/}
//    {/*/!*<Select*!/*/}
//    {/*/!*combobox*!/*/}
//    {/*/!*notFoundContent=""*!/*/}
//    {/*/!*filterOption={false}*!/*/}
//    {/*/!*placeholder='Filter Vulnerabilities'*!/*/}
//    {/*/!*style={{width: '180px', height: '30px', borderRadius: '3px 0 0 3px'}}*!/*/}
//    {/*/!*>*!/*/}
//    {/*/!*<Option value="0">请选择1</Option>*!/*/}
//    {/*/!*<Option value="1">请选择1</Option>*!/*/}
//    {/*/!*<Option value="2">请选择2</Option>*!/*/}
//    {/*/!*</Select>*!/*/}
//    {/*/!*<div className="ant-input-group-wrap"*!/*/}
//    {/*/!*style={{display: 'inline-block', verticalAlign: 'top', marginLeft: '5px'}}>*!/*/}
//    {/*/!*<Button>*!/*/}
//    {/*/!*<Icon type="search"/>*!/*/}
//    {/*/!*</Button>*!/*/}
//    {/*/!*</div>*!/*/}
//    {/*/!*</Input.Group>*!/*/}
//    {/*/!*</div>*!/*/}
//  {/*</div>*/}
