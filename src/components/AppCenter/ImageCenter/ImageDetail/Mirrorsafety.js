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
import ReactEcharts from 'echarts-for-react'
import './style/MirrorSafety.less'
// import Safetybugtablebg from '../../../../assets/img/appCenter/safettbugbg.JPG'

const TabPane = Tabs.TabPane
const Step = Steps.Step
const Option = Select.Option

class MirrorSafety extends Component {
  constructor(props) {
    super(props);
    this.mirrorShow = this.mirrorShow.bind(this);
    this.safetybugShow = this.safetybugShow.bind(this);
    this.softwarePackageShow = this.softwarePackageShow.bind(this);
    this.basicscanShow = this.basicscanShow.bind(this);

    this.state = {
      tableextend: false,
      mirrorState: true,
      safetybugState: false,
      softwarePackageState: false,
      basicscanState: false,
      safetybugwidth: '99%',
      softwarepackageWidth: 0
    }
  }

  // 点击切换事件
  mirrorShow() {
    this.setState({
      mirrorState: true,
      safetybugState: false,
      softwarePackageState: false,
      basicscanState: false
    })
  }

  safetybugShow() {
    this.setState({
      mirrorState: false,
      safetybugState: true,
      softwarePackageState: false,
      basicscanState: false,
    })
    // 重新设置Echarts容器的宽度，让Echarts显现
    setTimeout(() => this.setState({ safetybugwidth: "100%" }))
  }

  softwarePackageShow() {
    this.setState({
      mirrorState: false,
      safetybugState: false,
      softwarePackageState: true,
      basicscanState: false
    })
    // 重新设置Echarts容器的宽度，让Echarts显现
    setTimeout(() => this.setState({ softwarepackageWidth: "100%" }))
  }

  basicscanShow() {
    this.setState({
      mirrorState: false,
      safetybugState: false,
      softwarePackageState: false,
      basicscanState: true
    })
  }

  // 镜像分层模板
  testContent() {
    return (
      <div className='safetytabitem'>
        <div className='safetytabitemleft'>1111111111111111111</div>
        <span className='safetytabitemtitle'>CMD</span>
        <div className='safetytabitemdescription'>
          dsadadadadddddddddddddddddddddddddddddddddddddd
					ddddddddddddddddddddddddddddddddddddddddddddddd
					ddddddddddddddddddddddddddddddddddddddddddddddd
				</div>
      </div>
    )
  }

  // 漏洞扫描table 子级
  tableSub() {
    // 表格数据结构
    const columns1 = [{
      title: '访问向量',
      // className: 'column-visite',
      dataIndex: 'name',
      key: 'name',
      width: '18%',
      render: text => (<span><i className="fa fa-circle" aria-hidden="true" style={{ marginRight: '6px', color: '#dbdbdb' }}></i><span>{text}</span></span>)
    }, {
      title: '访问的复杂性',
      // className:'column-indent',
      dataIndex: 'age',
      width: '18%',
      key: 'age',
      render: text => (<span><i className="fa fa-circle" aria-hidden="true" style={{ marginRight: '6px', color: '#dbdbdb' }}></i><span>{text}</span></span>)
    }, {
      title: '认证',
      // className:'column-indent',
      dataIndex: 'address',
      width: '15%',
      key: 'address',
      render: text => (<span><i className="fa fa-circle" aria-hidden="true" style={{ marginRight: '6px', color: '#dbdbdb' }}></i><span>{text}</span></span>)
    }, {
      title: '保密性的影响',
      // className:'column-indent',
      dataIndex: 'address1',
      width: '21%',
      key: 'address1',
      render: text => (<span><i className="fa fa-circle" aria-hidden="true" style={{ marginRight: '6px', color: '#dbdbdb' }}></i><span>{text}</span></span>)
    }, {
      title: '完整性的影响',
      // className:'column-fontSize',
      dataIndex: 'address2',
      key: 'address2',
      width: '21%',
      render: text => (<span><i className="fa fa-circle" aria-hidden="true" style={{ marginRight: '6px', color: '#dbdbdb' }}></i><span>{text}</span></span>)
    }]

    // 表格数据
    const dataSource1 = [{
      key: '1',
      name: '网络',
      age: '低',
      address: '没有',
      address1: '完成',
      address2: '完成',
      // description:[<div>这是额外信息一<div>这是额外信息二</div></div>]
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
        <div className='tablesubtitlefooteritem' title="babadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;lj">babadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;ljbabadfsfklsfsjgldfhgsjflksjfrueiwhegdsgkldjflwepruijwfjedklshgkldhjslskdfjas;lj</div>
      </div>
    )
  }

  // 为 canvas 重新定义高度
  componentDidUpdate() {
    return 100 + '%'
  }
  // 基础扫描table 子级
  basicscantableSub() {
    return (
      <div className='basicscantableSub' style={{ background: 'white', padding: '10px 0' }}>
        <div style={{ lineHeight: '26px', fontSize: '16px', width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title="12321313123131231aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
          aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
          aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa">
        <i className="fa fa-minus" aria-hidden="true" style={{ marginRight: '8px' }}></i>
        12321313123131231aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
	        aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
	        aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
        </div>
      <div style={{ lineHeight: '26px', fontSize: '16px' }} title="12321313123131231"><i className="fa fa-minus" aria-hidden="true" style={{ marginRight: '8px' }}></i>12321313123131231</div>
      </div >
    )
  }

  render() {
    const EchartsWidth = '100%'
    // 镜像扫描 表格数据格式
    const mirrorColumns = [
      {
        title: '第一列',
        key: 'firstColumns',
        dataIndex: 'firstColumns',
        render: text => <span className='safetycontentitem'>{text}</span>,
        width: '104px'
      }, {
        title: '第二列',
        key: 'sescondColumns',
        dataIndex: 'sescondColumns',
        render: text => <span><Steps direction='vertical'><Step icon="info-circle" /></Steps>{text}</span>,
        width: '34px'
      }, {
        title: '第三列',
        key: 'thirdColumns',
        dataIndex: 'thirdColumns',
        render: text => <span className='safetytabitemtitle' style={{ lineHeight: '20px' }}>{text}</span>,
        width: '82px'
      }, {
        title: '第四列',
        key: 'forthColumns',
        dataIndex: 'forthColumns',
        render: text => <span className='safetycontentitem'>{text}</span>,
        //width:'104px'
      }
    ]

    // 镜像扫描 表格数据
    const mirrorDatasource = [
      {
        key: '1',
        firstColumns: '111111111111111111111111111111111111111111',
        secondColumns: '111111111111111111111111111111111111111111',
        thirdColumns: 'CMD',
        forthColumns: '111111111111111111111111111111111111111111asdadasdasdsadwqeqwaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
      {
        key: '2',
        firstColumns: '111111111111111111111111111111111111111111',
        secondColumns: '111111111111111111111111111111111111111111',
        thirdColumns: 'CMD',
        forthColumns: '111111111111111111111111111111111111111111',
      },
      {
        key: '3',
        firstColumns: '111111111111111111111111111111111111111111',
        secondColumns: '111111111111111111111111111111111111111111',
        thirdColumns: 'CMD',
        forthColumns: '111111111111111111111111111111111111111111',
      },
      {
        key: '4',
        firstColumns: '111111111111111111111111111111111111111111',
        secondColumns: '111111111111111111111111111111111111111111',
        thirdColumns: 'CMD',
        forthColumns: '111111111111111111111111111111111111111111',
      },
      {
        key: '5',
        firstColumns: '111111111111111111111111111111111111111111',
        secondColumns: '111111111111111111111111111111111111111111',
        thirdColumns: 'CMD',
        forthColumns: '111111111111111111111111111111111111111111',
      }, {
        key: '6',
        firstColumns: '111111111111111111111111111111111111111111',
        secondColumns: '111111111111111111111111111111111111111111',
        thirdColumns: 'CMD',
        forthColumns: '111111111111111111111111111111111111111111',
      }, {
        key: '7',
        firstColumns: '111111111111111111111111111111111111111111',
        secondColumns: '111111111111111111111111111111111111111111',
        thirdColumns: 'CMD',
        forthColumns: '111111111111111111111111111111111111111111',
      },
    ]
    // 漏洞扫描 Option
    let safetybugOption = {
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
        data: [
          { value: 7, name: '高级别安全漏洞', selected: true },
          { value: 89, name: '中级别漏洞' },
          { value: 96, name: '低级别漏洞' },
          { value: 5, name: '可忽略级别的漏洞' }
        ],
        label: {
          normal: {
            position: 'center',
            show: false
          },
          emphasis: {
            show: false,
            position: 'center',
            formatter: '{b} : {c}',
            // formatter: function(param) {
            //   return param.percent.toFixed(0) + '%'
            // },
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
              const colorList = ['#fa4f55', '#f7a45e', '#fbc82f', '#c7eafe', '#2abd83'];
              return colorList[params.dataIndex]
            },
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          // emphasis: {
          //   borderWidth: 0,
          //   shadowBlur: 7,
          //   shadowOffsetX: 0,
          //   shadowColor: 'rgba(0, 0, 0, 0.5)'
          // }
        }
      }]
    }

    // 漏洞扫描 表格数据格式
    const columns = [{
      title: 'CVE',
      width: '15%',
      dataIndex: 'name',
      key: 'name',
      render: text => (<span><span style={{ marginRight: '6px' }}>{text}</span><i className="fa fa-link" aria-hidden="true" style={{ color: '#9dd8f8' }} ></i></span>)
    }, {
      title: '严重',
      width: '13%',
      dataIndex: 'age',
      key: 'age',
      render: text => (<span><i className="fa fa-exclamation-triangle" aria-hidden="true" style={{ marginRight: '8px', color: 'red' }}></i>{text}</span>),
      sorter: (a, b) => a.age - b.age,
    }, {
      title: '软件包',
      width: '11%',
      dataIndex: 'address',
      key: 'address',
    }, {
      title: '当前版本',
      width: '15%',
      dataIndex: 'address1',
      key: 'address1',
    }, {
      title: '修正版',
      width: '15%',
      dataIndex: 'address2',
      key: 'address2',
      render: text => (<span style={{ color: '#5bcea3' }}><i className="fa fa-arrow-circle-right" aria-hidden="true" style={{ marginRight: '2px' }}></i>{text}</span>),
    }, {
      title: '位于镜像层',
      width: '27%',
      dataIndex: 'address3',
      key: 'address3',
      render: text => (<div><span className='safetybugtablepoint'>RUN</span>文件：<span className=''>{text}</span><i className="fa fa-database softwarepicturelright" aria-hidden="true"></i></div>),
    }]

    // 漏洞扫描 表格数据
    const dataSource = [{
      key: '1',
      name: '胡彦斌',
      age: 32,
      address: '西湖区湖',
      address1: '1weqeqweqwadas111111111111111111111111111111',
      address2: '2eqweqdsvdfsdf111111111111111111111111111111',
      address3: '3fsfesfsuofjuisdf1111111111111111111111111111111111111111111111111111111111111111',
      description: this.tableSub()
    }, {
      key: '2',
      name: '胡彦祖胡彦祖胡彦祖胡彦祖胡彦祖胡彦祖',
      age: 42,
      address: '西湖区湖',
      address1: '1weqeqweqwadas',
      address2: '2eqweqdsvdfsdf',
      address3: '3fsfesfsuofjuisdf',
      description: this.tableSub()
    }, {
      key: '3',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖',
      address1: '1weqeqweqwadas',
      address2: '2eqweqdsvdfsdf',
      address3: '3fsfesfsuofjuisdf',
      description: this.tableSub()
    }, {
      key: '4',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖',
      address1: '1weqeqweqwadas',
      address2: '2eqweqdsvdfsdf',
      address3: '3fsfesfsuofjuisdf',
      description: this.tableSub()
    }, {
      key: '5',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖',
      address1: '1weqeqweqwadas',
      address2: '2eqweqdsvdfsdf',
      address3: '3fsfesfsuofjuisdf',
      description: this.tableSub()
    }]

    // 软件包 Option
    let softwareOption = {
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
        data: [
          { value: 7, name: '高级别安全漏洞', selected: true },
          { value: 89, name: '中级别漏洞' },
          { value: 96, name: '低级别漏洞' },
          { value: 5, name: '可忽略级别的漏洞' }
        ],
        label: {
          normal: {
            position: 'center',
            show: false
          },
          emphasis: {
            show: false,
            position: 'center',
            formatter: '{b} : {c}',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%'
            },
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
              const colorList = ['#f6565d', '#fea24c', '#f7c92d', '#c7e7fb', '#2abd83']
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

    // 软件包 表格数据格式
    const softwareColumns = [
      {
        title: '包名称',
        dataIndex: 'softwarename',
        key: 'softwarename',
        width: '13%'
      },
      {
        title: '包版本',
        dataIndex: 'softwareversions',
        key: 'softwareversions',
        width: "16%",
      },
      {
        title: '漏洞',
        dataIndex: 'softwarebug',
        key: 'softwarebug',
        width: "13%",
        render: text => (<div><i className="fa fa-exclamation-triangle" style={{ margin: '0 8px 0 2px ', color: '#f6565e' }} aria-hidden="true"></i>{text}</div>)
      },
      {
        title: '升级后的剩余',
        dataIndex: 'softwareremain',
        key: 'softwareremain',
        width: '16%',
        render: text => (<div><i className="fa fa-arrow-circle-right" aria-hidden="true" style={{ margin: '0 8px 0 1px', color: '#ffb56e' }}></i>{text}</div>)
      },
      {
        title: '升级的影响',
        dataIndex: 'softwareimpact',
        key: 'softwareimpact',
        width: '12%',
        render: text => (<div><i className="fa fa-signal" aria-hidden="true" style={{ color: '#53b552', marginLeft: '1px' }}></i></div>),
      },
      {
        title: '介绍了在图像',
        dataIndex: 'softwarepicture',
        key: 'softwarepicture',
        width: '30%',
        render: text => (<div><span className='softwarepicturelleft'>RUN</span>文件：<span>{text}</span><i className="fa fa-database softwarepicturelright" aria-hidden="true"></i></div>)
      }
    ]

    //	软件包数据
    const softwareData = [
      {
        key: "11",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }, {
        key: "22",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasda'
      }, {
        key: "33",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }, {
        key: "44",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }, {
        key: "55",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }, {
        key: "66",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }, {
        key: "1",
        softwarename: '123213131',
        softwareversions: '312313131',
        softwarebug: '123123131',
        softwareremain: 'fsdfsfsafsffads',
        softwareimpact: 'dssafsdfasfsafs',
        softwarepicture: 'dasdadadasdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }
    ]

    //	基础扫描 数据格式
    const basicscanColumns = [{
      dataIndex: 'aaaa',
      key: "AAAA",
      className: 'basicscanColumns'
    }]

    //	基础扫描 数据
    const basicscanData = [
      {
        key: '1',
        aaaa: 'asdasdadadadaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        description: this.basicscantableSub()
      }, {
        key: '2',
        aaaa: 'asdasdadadad',
        description: this.basicscantableSub()
      }, {
        key: '3',
        aaaa: 'asdasdadadad',
        description: this.basicscantableSub()
      }, {
        key: '4',
        aaaa: 'asdasdadadad',
        description: this.basicscantableSub()
      }, {
        key: '5',
        aaaa: 'asdasdadadad',
        description: this.basicscantableSub()
      }
    ]

    return (
      <div id='mirrorsafety'>
        <div className='safetyselect'>
          <Select className='safetyselectson' placeholder='选择镜像版本，查看安全报告'>
            <Option value='1111'>选择镜像版本，查看安全报告</Option>
            <Option value='2222'>选择镜像版本，查看安全报告</Option>
            <Option value='3333'>选择镜像版本，查看安全报告</Option>
          </Select>
        </div>
        <div className='safetytabcontainer'>
          {/* 选择按钮 */}
          <ul className='safetytab'>
            <li className={this.state.mirrorState ? 'safetytabpane safetytabpaneradius1 safetytabpaneselected' : 'safetytabpane safetytabpaneradius1'} onClick={this.mirrorShow}><i className="fa fa-database safetytabIcon" aria-hidden="true"></i>镜像分层</li>
            <li className={this.state.safetybugState ? 'safetytabpane safetytabpaneselected' : 'safetytabpane'} onClick={this.safetybugShow}><i className="fa fa-bug safetytabIcon" aria-hidden="true"></i>漏洞扫描</li>
            <li className={this.state.softwarePackageState ? 'safetytabpane safetytabpaneselected' : 'safetytabpane'} onClick={this.softwarePackageShow}><i className="fa fa-android safetytabIcon" aria-hidden="true"></i>软件包</li>
            <li className={this.state.basicscanState ? 'safetytabpane safetytabpaneradius2 safetytabpaneselected' : 'safetytabpane safetytabpaneradius2'} onClick={this.basicscanShow}><i className="fa fa-crosshairs safetytabIcon" aria-hidden="true"></i>基础扫描</li>
          </ul>

          {/* 镜像分层 */}
          <div className={this.state.mirrorState ? '' : 'mirror'}>
            <div className='safetycontent'>
              <Steps direction="vertical" current={2} className='safetycontentmian'
              >
                <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
                <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
                <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
                <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
                <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
                <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
                <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
                <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
              </Steps>
            </div>
          </div>

          {/* 漏洞扫描 */}
          <div className={this.state.safetybugState ? 'safetybug' : 'safetybugdis'}>
            <div className='safetybugEcharts'>
              <div style={{ width: this.state.safetybugwidth }}>
                <ReactEcharts
                  option={safetybugOption}
                  style={{ height: '220px' }}
                />
              </div>

              <div className='safetybugEchartslegend'>
                <div className='safetybugEchartslegendtitle'>镜像安全扫描到190个漏洞，补丁为134个漏洞</div>
                <table>
                  <tbody>
                    <tr className='safetybugEchartslegendcontent'>
                      <td className='safetybugEchartslegendcontentleft'><i className="fa fa-square iconmargin highcolor" aria-hidden="true"></i>高级别安全漏洞</td>
                      <td className='safetybugEchartslegendcontentright'><span className='highcolor rightmargin'>7</span>&nbsp;个</td>
                    </tr>
                    <tr className='safetybugEchartslegendcontent'>
                      <td className='safetybugEchartslegendcontentleft'><i className="fa fa-square iconmargin middlecolor" aria-hidden="true"></i>中级别安全漏洞</td>
                      <td className='safetybugEchartslegendcontentright'><span className='middlecolor rightmargin'>89</span>&nbsp;个</td>
                    </tr>
                    <tr className='safetybugEchartslegendcontent'>
                      <td className='safetybugEchartslegendcontentleft'><i className="fa fa-square iconmargin lowcolor" aria-hidden="true"></i>低级别安全漏洞</td>
                      <td className='safetybugEchartslegendcontentright'><span className='lowcolor rightmargin'>96</span>&nbsp;个</td>
                    </tr>
                    <tr className='safetybugEchartslegendcontent'>
                      <td className='safetybugEchartslegendcontentleft'><i className="fa fa-square iconmargin ignorecolor" aria-hidden="true"></i>可忽略级别安全漏洞</td>
                      <td className='safetybugEchartslegendcontentright'><span className='ignorecolor rightmargin'>5</span>&nbsp;个</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/*镜像漏洞*/}
            <div className='safetybugmirror'>
              <div className='safetybugmirrortitle'>
                <div className='safetybugmirrortitleleft'>
                  镜像漏洞
								</div>
                <div className="safetybugmirrortitleright">
                  <Checkbox style={{ float: 'left', width: '120px', marginTop: '6px' }}>只显示可修复</Checkbox>
                  <Input.Group style={{ float: 'left', width: '200px' }}>
                    <Select
                      combobox
                      notFoundContent=""
                      filterOption={false}
                      placeholder='Filter Vulnerabilities'
                      style={{ width: '180px', height: '30px', borderRadius: '3px 0 0 3px' }}
                    >
                      <Option value="0">请选择1</Option>
                      <Option value="1">请选择1</Option>
                      <Option value="2">请选择2</Option>
                    </Select>
                    <div className="ant-input-group-wrap" style={{ display: 'inline-block', verticalAlign: 'top', marginLeft: '5px' }}>
                      <Button>
                        <Icon type="search" />
                      </Button>
                    </div>
                  </Input.Group>
                </div>
              </div>
              <div className="safetybugtable">
                <Table
                  columns={columns}
                  dataSource={dataSource}
                  pagination={false}
                  expandedRowRender={record => <span>{record.description}</span>}
                >
                </Table>
              </div>
            </div>
          </div>

          {/* 软件包*/}
          <div className={this.state.softwarePackageState ? 'softwarePackage' : 'softwarebugdis'}>
            <div className='softwarePackageEcharts' style={{ width: this.state.softwarepackageWidth }}>
              <ReactEcharts
                option={softwareOption}
                style={{ height: '220px', margin: '0 0' }}
              />
              <div className='softwarePackageLegend'>
                <div className='softwarePackageLegendmain'>
                  <table style={{ fontSize: '14px' }}>
                    <tbody>
                      <tr>
                        <td className='softwarePackageLegendheader' colSpan="3">镜像安全扫描器已经认识150包</td>
                      </tr>
                      <tr>
                        <td className='softwarePackageLegendmain1'><i className="fa fa-book" aria-hidden="true" style={{ color: '#f35860' }}></i></td>
                        <td className='softwarePackageLegendmain2'>7封装</td>
                        <td>高级别安全漏洞</td>
                      </tr>
                      <tr>
                        <td className='softwarePackageLegendmain1'><i className="fa fa-book" aria-hidden="true" style={{ color: '#fda34d' }}></i></td>
                        <td className='softwarePackageLegendmain2'>89封装</td>
                        <td>中级别漏洞</td>
                      </tr>
                      <tr>
                        <td className='softwarePackageLegendmain1'><i className="fa fa-book" aria-hidden="true" style={{ color: '#f7cb2e' }}></i></td>
                        <td className='softwarePackageLegendmain2' style={{ align: 'right' }}>96封装</td>
                        <td>低级别漏洞</td>
                      </tr>
                      <tr>
                        <td className='softwarePackageLegendmain1'><i className="fa fa-book" aria-hidden="true" style={{ color: '#c6e9fc' }}></i></td>
                        <td className='softwarePackageLegendmain2'>1封装</td>
                        <td>可忽略级别漏洞</td>
                      </tr>
                      <tr>
                        <td className='softwarePackageLegendmain1'><i className="fa fa-book" aria-hidden="true" style={{ color: '#2abe84' }}></i></td>
                        <td colSpan="2">108封装没有漏洞</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className='softwarePackageTable'>
              <div className='softwarePackageTableTitle'>
                <div className='softwarePackageTableTitleleft'>
                  镜像所含软件包
								</div>
                <div className='softwarePackageTableTitleright'>
                  <Input.Group style={{ width: '200px', marginRight: '35px' }}>
                    <Select
                      combobox
                      notFoundContent=""
                      filterOption={false}
                      placeholder='Filter Vulnerabilities'
                      style={{ width: '180px', height: '30px', borderRadius: '3px 0 0 3px' }}
                    >
                      <Option value="0">请选择1</Option>
                      <Option value="1">请选择1</Option>
                      <Option value="2">请选择2</Option>
                    </Select>
                    <div className="ant-input-group-wrap" style={{ display: 'inline-block', verticalAlign: 'top', marginLeft: '5px' }}>
                      <Button>
                        <Icon type="search" />
                      </Button>
                    </div>
                  </Input.Group>
                </div>
              </div>
              <div className='softwarePackageTableContent'>
                <Table
                  columns={softwareColumns}
                  dataSource={softwareData}
                  pagination={false}
                >
                </Table>
              </div>
            </div>
          </div>

          {/* 基础扫描*/}
          <div className={this.state.basicscanState ? "basicscan" : 'basicscandis'}>
            <div className='basicscantitle alertRow'>
              镜像的安全扫描，这里提供的是一个静态的扫描，能检测出镜像的诸多安全问题，例如：端口暴露异常、是否提供了SSH Daemon等等安全相关。（注：请注意每个镜像的不同版本，安全报告可能会不同）
						</div>
            <div className="basicscanmain">
              <div className='basicscanmaintitle'>
                <span className='basicscanmaintitleitem'>基础扫描结果</span>
              </div>
              <div className='basicscanmaintable'>
                <Table
                  columns={basicscanColumns}
                  dataSource={basicscanData}
                  pagination={false}
                  showHeader={null}
                  expandedRowRender={record => (<div>{record.description}</div>)}
                >
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default (injectIntl(MirrorSafety, {
  withRef: true,
}));