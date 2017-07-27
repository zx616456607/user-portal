/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Tenant management
 *
 * v0.1 - 2017-07-17
 * @author Zhaoyb
 */

import React, { PropTypes, Component } from 'react'
import {Link, browserHistory} from 'react-router'
import {Row, Card, Col, Alert, Button, Icon} from 'antd'
import './style/tenantManage.less'
import Title from '../Title'
import ReactEcharts from 'echarts-for-react'

export default class TenantManage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      memberNumber: 0,
      teamNumber: 0,
      projectNumber: 0,
      roleNumber: 0,
      btnLeft: 0,
      btnTop: 0,
      person: [],
      isIconShow: false
    }
  }

  /**
   * 渲染前
   */
  componentDidMount(){
    // let addBut = document.querySelector('.addBtn')[0];
    // let left = addBut.offsetLeft, top = addBut.offsetTop;
    // this.setState({
    //   btnLeft: left,
    //   btnTop: top
    // })
    this.handleLi()
  }
  /**
   *
   */
  handleLi(){
    let curLi = document.getElementById('tagItems').getElementsByTagName('li')
    let oDiv = document.getElementsByClassName('Items')[0].getElementsByTagName('div')

    for(let i =0; i< curLi.length; i++){
      (function(index){
        curLi[index].onclick = function(){
          debugger
          for (var i = 0; i < 4; i++) {
            curLi[i].className = oDiv[i].className = ''
          }
          curLi[index].className = 'active'
          oDiv[index].className = 'active'
        }
      })(i)
    }
  }

  handleNav(name, nav){
    switch(name){
      case 'member':
      this.setState({
        isIconShow: true
      })
      browserHistory.push('./Membermanagement/index.js')
      return
      case 'team':
      return browserHistory.push('')
      case 'project':
      return browserHistory.push('./ProjectManage/index.js')
      case 'role':
      return browserHistory.push('./RoleManagement/index.js')
    }
  }

  /**
   * @param person
   * @param type
   * @param fn
   */
  onEvent(person,type,fn){
    if(!person['self'+type]){
      person['self'+type] = []
    }
    let e = person['self']
    e.push(fn);
  }
  /**
   * @param person
   * @param type
   */
  onRun(person,type){
    let e = person['self'+type]
    for(let i=0; i<e.length; i++){
      e[i]();
    }
  }

  render() {
    let curCard = {

    }
    let memberOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '55%',
        top: 'middle',
        data: [{ name: '系统管理员' },  { name: '普通成员' }],
        formatter: function (name) {
          if (name === '系统管理员') {
            return name + '10 个'
          } else if (name === '普通成员') {
            return name + '3 个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 9,
        itemWidth: 6,
        itemHeight: 6,
      },
      color: ['#2db7f5', '#2abe84', '#B0E2FF'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['70', '0'],
        center: ['27%', '48%'],
        data: [
          { value: 50, name: '系统管理员' },
          { value: 10, name: '团队管理员' },
          { value: 10, name: '普通成员', selected: true },
        ],
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            // formatter: '{b}:{c}<br/>({d}%)',
            show: false,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';
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
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    let teamOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '55%',
        top: 'middle',
        data: [{ name: '我创建' }],
        formatter: function (name) {
          if (name === '我创建') {
            return name + '10 个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 9,
        itemWidth: 6,
        itemHeight: 6,
      },
      color: ['#2db7f5','#B0E2FF'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['70', '0'],
        center: ['27%', '48%'],
        data: [
          { value: 2, name: '我创建'},
          { value: 90,name: '剩余空间'},
        ],
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            // formatter: '{b}:{c}<br/>({d}%)',
            show: false,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';//param.percent.toFixed(0)
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
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    let projectOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '55%',
        top: 'middle',
        data: [{ name: '我创建' }],
        formatter: function (name) {
          if (name === '我创建') {
            return name + '10 个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 9,
        itemWidth: 6,
        itemHeight: 6,
      },
      color: ['#2db7f5','#B0E2FF'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['70', '0'],
        center: ['27%', '48%'],
        data: [
          { value: 20, name: '我创建'},
          { value: 90,name: '剩余空间'},
        ],
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            show: false,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';
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
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    let roleOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '55%',
        top: 'middle',
        data: [{ name: '系统默认' }, { name: '共创建' }, { name: '我创建' }],
        formatter: function (name) {
          if (name === '系统默认') {
            return name + '10 个'
          } else if (name === '共创建') {
            return name + '5 个'
          } else if (name === '我创建') {
            return name + '3 个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 9,
        itemWidth: 6,
        itemHeight: 6,
      },
      color: ['#2db7f5', '#2abe84', '#B0E2FF'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['70', '0'],
        center: ['27%', '48%'],
        data: [
          { value: 50, name: '系统默认' },
          { value: 10, name: '共创建' },
          { value: 10, name: '我创建', selected: true },
        ],
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            // formatter: '{b}:{c}<br/>({d}%)',
            show: false,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';
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
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }

    let btnStyle = {
      position: 'absolute',
      top: this.state.btnTop + 'px',
      left: this.state.btnLeft + 'px'
    }
    let images = [
      {src:require('../../assets/img/tenantManage/tenantGuide.jpg')},
      {src:require('../../assets/img/tenantManage/tenatNav.png')},
      {src:require('../../assets/img/tenantManage/tenatNavs.jpg')}
    ]
    return (
      <div id="tenantManage">
        <Title title="概览" />
        <Row className="title">
          控制权限概览
        </Row>
        <div className="alertRow">
          <span>此功能满足细粒度的多租户权限控制需求，帮助企业做好权限分配和管理，同时处理好授权方面的一些难题;
          按需为用户分配最小权限，从而降低企业的信息安全风险。</span>
        </div>
        <Row className="content" gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <Card title="成员" extra={<div><span>共</span><span>{this.state.memberNumber}</span><span>人</span></div>} bordered={false} bodyStyle={{ height: 180, padding: '0px'}}>
              <ReactEcharts
                notMerge={true}
                option={memberOption}
                style={{ height: '180px' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="团队" extra={<div><span>共</span><span>70</span><span>人</span></div>} bordered={false} bodyStyle={{ height: 180, padding: '0px' }}>
              <ReactEcharts
                notMerge={true}
                option={teamOption}
                style={{ height: '180px' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="项目" extra={<div><span>共</span><span>70</span><span>人</span></div>} bordered={false} bodyStyle={{ height: 180, padding: '0px' }}>
              <ReactEcharts
                notMerge={true}
                option={projectOption}
                style={{ height: '180px' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="角色" extra={<div><span>共</span><span>70</span><span>人</span></div>} bordered={false} bodyStyle={{ height: 180, padding: '0px' }}>
              <ReactEcharts
                notMerge={true}
                option={roleOption}
                style={{ height: '180px' }}
              />
            </Card>
          </Col>
        </Row>
         <Row className="content" gutter={30}>
          <Col span={30}>
            <Card
              title="操作引导"
            >
              <div className="tagItems" id="tagItems">
                <ul>
                  <li className="active">
                    <span style={{fontSize: 16}}>创建新成员</span>
                    <Icon className="Icon" type="check-circle-o" style={{margin: 10}} />
                  </li>
                  <li>
                    <span style={{fontSize: 16}}>创建团队并添加新成员</span>
                    <Icon className="Icon" type="check-circle-o" style={{ margin: 10}} />
                  </li>
                  <li>
                    <span style={{fontSize: 16}}>创建角色</span>
                    <Icon className="Icon" type="check-circle-o" style={{margin: 10}} />
                  </li>
                  <li>
                    <span style={{fontSize: 16}}>创建项目</span>
                    <Icon className="Icon" type="check-circle-o" style={{margin: 10}} />
                  </li>
                </ul>
              </div>
              <div className="Items">
                <div className="active">
                  <img className="Nav" src={images[1].src}/>
                  <img className="guide" src={images[2].src}/>
                  <p className="desc" style={{backgroundColor: '#2abe84',color: '#fff'}}>
                    <p className="words">成员是指公司内外共同协作管理和使用平台的人，每个成员创建后都会有
                    一个个的项目，可在项目中创建个人的资源</p>
                  </p>
                  <Button type='primary' size='large' className='addBtn'>
                    <i className='fa fa-plus' /> 创建新成员
                  </Button>
                </div>
                <div>
                  <img className="Nav" src={images[1].src}/>
                  <img className="guide" src={images[0].src}/>
                  <p className="desc" style={{backgroundColor: '#2abe84',color: '#fff'}}>
                    <p className="words">团队，由若干个成员组成的一个集体，可等效于公司的部门、小组、或子公司，以实现可将一批人统一管理，统一加到某个项目中并授予角色</p>
                  </p>
                  <Button type='primary' size='large' className='addBtn'>
                    <i className='fa fa-plus' /> 创建团队
                  </Button>
                </div>
                <div>
                  <img className="Nav" src={images[1].src}/>
                  <img className="guide" src={images[0].src}/>
                   <p className="desc" style={{backgroundColor: '#2abe84',color: '#fff'}}>
                    <p className="words">角色是指一组权限的集合，您可以创建一个有若干权限的角色，在某项目中添加角色并为该角色关联对象（成员或团队）</p>
                  </p>
                  <Button type='primary' size='large' className='addBtn'>
                    <i className='fa fa-plus' /> 创建角色
                  </Button>
                </div>
                <div>
                  <img className="Nav" src={images[1].src}/>
                  <img className="guide" src={images[0].src}/>
                   <p className="desc" style={{backgroundColor: '#2abe84',color: '#fff'}}>
                    <p className="words">项目之间是项目隔离的，通过创建项目实现按照角色关联对象（成员、团队），并根据授予的权限，使用项目中资源及功能</p>
                  </p>
                  <Button type='primary' size='large' className='addBtn'>
                    <i className='fa fa-plus' /> 创建项目
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}