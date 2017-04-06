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
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ReactEcharts from 'echarts-for-react'
import './style/MirrorSafetyBug.less'

const TabPane = Tabs.TabPane
const Step = Steps.Step
const Option = Select.Option

class MirrorSafetyBug extends Component {
  constructor(props){
    super(props)
    this.tableDatasource = this.tableDatasource.bind(this)
    this.tableSeverityColor = this.tableSeverityColor.bind(this)
    this.state = {
      Unknown: 0,
      Negligible: 0,
      Low: 0,
      Medium: 0,
      High: 0,
      Total: 0,
      PatchTotal: 0
    }
  }

  tableDatasource(){
    const { mirrorsafetyClair, mirrorLayeredinfo } = this.props
    if(!mirrorsafetyClair.mirrorchairinfo || !mirrorsafetyClair.mirrorchairinfo.result){
      return
    }
    const clairVulnerabilities = mirrorsafetyClair.mirrorchairinfo.result.report.vulnerabilities
    const clairFeatures = mirrorsafetyClair.mirrorchairinfo.result.report.features
    const clairFixedIn = mirrorsafetyClair.mirrorchairinfo.result.report.fixedIn
    let tabledatasource = []
    let index = 1
    //let CVEobj = {}
    //let software = ''
    //let CVersion = ''
    //let RVersion = ''
    //let data = {}
    //let softwareID = ''
    //let Command = {}
    // Echarts 数据
    let EchartsUnknownNum = 0
    let EchartsNegligibleNum = 0
    let EchartsLowNum = 0
    let EchartsMediumNum = 0
    let EchartsHighNum = 0
    let EchartsNoneNum = 0
    let EchartsFixedIn = 0

    if(Object.keys(clairVulnerabilities).length == 0){
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
          for(let keyFix in clairFixedIn){
            let RVersionStr = keyVulner + software[0].substring(0,1).toUpperCase()+software[0].replace(/-/g, '').substring(1,software[0].length)
            if(RVersionStr == keyFix){
              RVersion = clairFixedIn[keyFix]
              EchartsFixedIn++
              break
            }
            if(RVersion == '' ){
              RVersion = '暂无修正版'
            }
          }

          // 位于镜像
          for(let i = 0; i < mirrorLayeredinfo.length; i++){
            if(softwareID == mirrorLayeredinfo[i].iD){
              Command = mirrorLayeredinfo[i].command
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
          for(let keyFix in clairFixedIn){
            let RVersionStr = keyVulner + software[0].substring(0,1).toUpperCase()+software[0].replace(/-/g, '').substring(1,software[0].length)
            if(RVersionStr == keyFix){
              RVersion = clairFixedIn[keyFix]
              EchartsFixedIn++
              break
            }
            if(RVersion == '' ){
              RVersion = '暂无修正版'
            }
          }
          // 位于镜像
          for(let i = 0; i < mirrorLayeredinfo.length; i++){
            if(softwareID == mirrorLayeredinfo[i].iD){
              Command = mirrorLayeredinfo[i].command
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
          //CVEobj = {}
          //CVersion = ''
          //RVersion = ''
          //softwareID = ''
          //data = {}
        }
      }
      return {
        tabledatasource,
        EchartsDate:{
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

  componentDidMount() {
    const EchartsDate = this.tableDatasource().EchartsDate
    this.setState({
      Unknown: EchartsDate.EchartsUnknownNum,
      Negligible: EchartsDate.EchartsNegligibleNum,
      Low: EchartsDate.EchartsLowNum,
      Medium: EchartsDate.EchartsMediumNum,
      High: EchartsDate.EchartsHighNum,
      Total : (EchartsDate.EchartsUnknownNum + EchartsDate.EchartsNegligibleNum + EchartsDate.EchartsLowNum + EchartsDate.EchartsMediumNum + EchartsDate.EchartsHighNum),
      PatchTotal:　EchartsDate.EchartsFixedIn
    })
    //console.log(this.state)
  }

  componentWillReceiveProps(){

  }

  handleGetBackLayer(text){
    const { callBack } = this.props
    let getBackInfo = {
      ActiveKey:2,
      LayerCommandParameters:text
    }
    callBack(getBackInfo)
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


  // 漏洞扫描table 子级
  tableSubNo(str){
    return(
      <div className='tableSUBnNo'>
        {str}
      </div>
    )

  }

  tableSub(object){
    const data = object || {}

    const accessVectorArr = ['','网络','相邻网络','本地']
    function accessVectorFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = accessVectorArr[data.accessVector]
        if( value == '网络' && value == text){
          return 'red'
        }
        if(value == '相邻网络' && value == text){
          return 'orange'
        }
        if(value == '本地' && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }

    const accessComplexityArr = ['','低','中','高']
    function accessComplexityFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = accessComplexityArr[data.accessComplexity]
        if( value == '低' && value == text){
          return 'red'
        }
        if(value == '中' && value == text){
          return 'orange'
        }
        if(value == '高' && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }

    const authenticationArr = ['','没有','单','多']
    function authenticationFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = authenticationArr[data.authentication]
        if( value == '没有' && value == text){
          return 'red'
        }
        if(value == '单' && value == text){
          return 'orange'
        }
        if(value == '多' && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }

    const confidentialityImpactArr = ['','完成','局部','没有']
    function confidentialityImpactFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = confidentialityImpactArr[data.confidentialityImpact]
        if( value == '完成' && value == text){
          return 'red'
        }
        if(value == '局部' && value == text){
          return 'orange'
        }
        if(value == '没有' && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }

    const integrityImpactArr = ['','完成','局部','没有']
    function integrityImpactFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = integrityImpactArr[data.integrityImpact]
        if( value == '完成' && value == text){
          return 'red'
        }
        if(value == '局部' && value == text){
          return 'orange'
        }
        if(value == '没有' && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }
    const columns1 = [{
      title: '访问向量',
      dataIndex: 'name',
      key: 'name',
      width: '18%',
      render: text => (<span style={{color:accessVectorFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span >{text}</span></span>)
    }, {
      title: '访问的复杂性',
      dataIndex: 'age',
      width: '18%',
      key: 'age',
      render: text => (<span style={{color: accessComplexityFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span >{text}</span></span>)
    }, {
      title: '认证',
      dataIndex: 'address',
      width: '15%',
      key: 'address',
      render: text => (<span style={{color:authenticationFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span>{text}</span></span>)
    }, {
      title: '保密性的影响',
      dataIndex: 'address1',
      width: '21%',
      key: 'address1',
      render: text => (<span style={{color:confidentialityImpactFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span>{text}</span></span>)
    }, {
      title: '完整性的影响',
      dataIndex: 'address2',
      key: 'address2',
      width: '21%',
      render: text => (<span style={{color:integrityImpactFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span >{text}</span></span>)
    }]

    // 表格数据
    const dataSource1 = [{
      key: '1',
      name: '网络',
      age: '低',
      address: '没有',
      address1: '完成',
      address2: '完成',
    }, {
      key: '2',
      name: '相邻网络',
      age: '中',
      address: '单',
      address1: '局部',
      address2: '局部',
    }, {
      key: '3',
      name: '本地',
      age: '高',
      address: '多',
      address1: '没有',
      address2: '没有',
    }]

    return (
      <div className='tablesub'>
        <div className='tablesubtitle'>矢量</div>
        <div className='tablesubbody'>
          <Table
            columns={columns1}
            dataSource={dataSource1}
            pagination={false}
            size="small"
          >
          </Table>
        </div>
        <div className='tablesubtitlefooter'>描述</div>
        <div className='tablesubtitlefooteritem'>
          {data.des}
        </div>
      </div>
    )
  }

  render(){
    const { Unknown, Negligible, Low, Medium, High }=this.state
    function EchartsGapTemplate(num){
      let str = num.toString()
      switch(str.length){
        case 1 :
        default:
          return '   '+ '    ' + num +'  封装' + '      '
        case 2 :
          return '   '+ '  ' + num + '  封装' + '      '
        case 3 :
          return '   '+ num + '  封装' + '      '
      }
    }
    let safetybugOption = {
      title: {
        text: '镜像安全扫描检测到 ' + this.state.Total + ' 个漏洞，补丁为 '+this.state.PatchTotal+' 个漏洞',
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
          data: ['高级别安全漏洞', '中级别安全漏洞', '低级别安全漏洞', '可忽略级别的漏洞', '未知的漏洞'],
          formatter: function (name) {
            if (name == '高级别安全漏洞') {
              return EchartsGapTemplate(High) + name
            }
            if (name == '中级别安全漏洞') {
              return EchartsGapTemplate(Medium) + name
            }
            if (name == '低级别安全漏洞') {
              return EchartsGapTemplate(Low) + name
            }
            if (name == '可忽略级别的漏洞') {
              return EchartsGapTemplate(Negligible) + name
            }
            if (name == '未知的漏洞') {
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
          {value: this.state.High, name: '高级别安全漏洞', selected: true},
          {value: this.state.Medium, name: '中级别安全漏洞'},
          {value: this.state.Low, name: '低级别安全漏洞'},
          {value: this.state.Negligible, name: '可忽略级别的漏洞'},
          {value: this.state.Unknown, name: '未知的漏洞' }
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

    const columns = [{
      title: 'CVE',
      width: '15%',
      dataIndex: 'CVE',
      key: 'CVE',
      render: text => (
        <span className='CVE'><span className='CVEspan'>{text.name}</span><a href={text.link} target="_blank"><i className="fa fa-link CVEi" aria-hidden="true"></i></a></span>)
    }, {
      title: '严重',
      width: '13%',
      dataIndex: 'severity',
      key: 'severity',
      render: text => (<span className={this.tableSeverityColor(text)}><i className="fa fa-exclamation-triangle severityi" aria-hidden="true"></i><span>{text}</span></span>),
      sorter: (a, b) => a.age - b.age,
    }, {
      title: '软件包',
      width: '11%',
      dataIndex: 'software',
      key: 'software',
    }, {
      title: '当前版本',
      width: '15%',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
    }, {
      title: '修正版',
      width: '15%',
      dataIndex: 'reversion',
      key: 'reversion',
      render: text => (<span className='reversion' style={{color: text == '暂无修正版' ? 'red' : '#5bcea3' }}><i className="fa fa-arrow-circle-right reversioni" aria-hidden="true"></i>{text}</span>),
    }, {
      title: '位于镜像层',
      width: '27%',
      dataIndex: 'layerInfo',
      key: 'layerInfo',
      render: text => (<div className='layerInfo'><span className='safetybugtablepoint'>{text.action}</span><Tooltip title={text.parameters}><span className='textoverflow layerInfospan'>{text.parameters}</span></Tooltip><i className="fa fa-database softwarepicturelright" aria-hidden="true" onClick={this.handleGetBackLayer.bind(this,text.parameters)}></i></div>),
    }]

    const softwarePagination = {
      total: this.tableDatasource().length,
      showSizeChanger: true,
    }
    return (
      <div id="MirrorSafetyBug">
        <div className='safetybugEcharts'>
          <div style={{width: '100%'}}>
            <ReactEcharts
              option={safetybugOption}
              style={{height: '220px'}}
            />
          </div>
        </div>
        <div className='safetybugmirror'>
          <div className='safetybugmirrortitle'>
            <div className='safetybugmirrortitleleft'>
              镜像漏洞
            </div>
            {/*<div className="safetybugmirrortitleright">*/}
              {/*<Checkbox style={{float: 'left', width: '120px', marginTop: '6px'}}>只显示可修复</Checkbox>*/}
              {/*<Input.Group style={{float: 'left', width: '200px'}}>*/}
                {/*<Select*/}
                  {/*combobox*/}
                  {/*notFoundContent=""*/}
                  {/*filterOption={false}*/}
                  {/*placeholder='Filter Vulnerabilities'*/}
                  {/*style={{width: '180px', height: '30px', borderRadius: '3px 0 0 3px'}}*/}
                {/*>*/}
                  {/*<Option value="0">请选择1</Option>*/}
                  {/*<Option value="1">请选择1</Option>*/}
                  {/*<Option value="2">请选择2</Option>*/}
                {/*</Select>*/}
                {/*<div className="ant-input-group-wrap"*/}
                     {/*style={{display: 'inline-block', verticalAlign: 'top', marginLeft: '5px'}}>*/}
                  {/*<Button>*/}
                    {/*<Icon type="search"/>*/}
                  {/*</Button>*/}
                {/*</div>*/}
              {/*</Input.Group>*/}
            {/*</div>*/}
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

export default (injectIntl(MirrorSafetyBug, {
  withRef: true,
}));
