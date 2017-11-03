/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Tenant management
 *
 * v0.1 - 2017-07-17
 * @author ZhaoYanBei
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { Row, Card, Col, Alert, Button, Icon } from 'antd'
import './style/tenantManage.less'
import Title from '../Title'
import { fetchinfoList } from '../../actions/tenant_overview'
import ReactEcharts from 'echarts-for-react'
import QueueAnim from 'rc-queue-anim'

class TenantManage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      member: 0,
      team: 0,
      project: 0,
      role: 0,
      user_supperUser: 0,
      user_commonUser: 0,
      project_createByUser: 0,
      role_allCreated: 0,
      role_createdByUser: 0,
      role_defaultSet: 0,
      team_createdByUser: 0,
      dataRow: '',
      iconState: true,
      classindex: 0,
    }
  }

  componentWillMount() {
    this.loadInfosList()
    if (localStorage.getItem('state')) {
      this.setState({
        iconState: localStorage.getItem('state') == 'true' ? true : false
      })
    }
  }

  loadInfosList() {
    const { fetchinfoList } = this.props
    fetchinfoList(null, {
      success: {
        func: res => {
          if (res.code === 200) {
            this.setState({
              member: res.data.user.total,
              team: res.data.team.total,
              project: res.data.project.total,
              role: res.data.role.total,
              user_supperUser: res.data.user.supperUser,
              user_commonUser: res.data.user.commonUser,
              project_createByUser: res.data.project.createByUser,
              role_allCreated: res.data.role.allCreated,
              role_createdByUser: res.data.role.createdByUser,
              role_defaultSet: res.data.role.defaultSet,
              team_createdByUser: res.data.team.createdByUser
            })
          }
        },
        isAsycn: true
      }
    })
  }

  handleOnLi(index) {
    let getS = [{ key: 'Menber' }, { key: 'Team' }, { key: 'Project' }, { key: 'Role' }]
    return localStorage.getItem(getS[index].key)
  }

  itemNav(index) {
    return index === this.state.classindex ? 'active' : '';
  }

  itemCon(index) {
    return index === this.state.classindex ? 'active' : '';
  }

  /**
   * 引导地址
   * @param {*} name
   */
  handleNav(e) {
    let id = e.currentTarget.getAttribute('data-index')
    switch (id) {
      case '0':
        localStorage.setItem('Menber', 'true')
        browserHistory.push('/tenant_manage/user')
        return
      case '1':
        localStorage.setItem('Team', 'true')
        browserHistory.push('tenant_manage/team')
        return
      case '2':
        localStorage.setItem('Project', 'true')
        browserHistory.push('tenant_manage/project_manage')
        return
      case '3':
        localStorage.setItem('Role', 'true')
        browserHistory.push('tenant_manage/rolemanagement')
        return
    }
  }

  /**
   * 引导
   */
  handleIco() {
    let is = this.state.iconState
    if (is) {
      this.setState({
        iconState: false
      })
      localStorage.setItem('state', false)
    } else {
      this.setState({
        iconState: true
      })
      localStorage.setItem('state', true)
    }
  }

  render() {
    const ListLi = [{
      id: 1,
      text: '创建新成员',
      itemName: '创建新成员',
      item: '成员是指公司内外共同协作管理和使用平台的人，每个成员创建后都会有一个个的项目，可在项目中创建个人的资源'
    }, {
      id: 2,
      text: '创建团队并添加成员',
      itemName: '创建团队',
      item: '团队，由若干个成员组成的一个集体，可等效于公司的部门、小组、或子公司，以实现可将一批人统一管理，统一加到某个项目中并授予角色'
    }, {
      id: 3,
      text: '创建角色',
      itemName: '创建角色',
      item: '角色是指一组权限的集合，您可以创建一个有若干权限的角色，在某项目中添加角色并为该角色关联对象（成员或团队）'
    }, {
      id: 4,
      text: '创建项目',
      itemName: '创建项目',
      item: '项目之间是项目隔离的，通过创建项目实现按照角色关联对象（成员、团队），并根据授予的权限，使用项目中资源及功能'
    }]
    const { user_supperUser, user_commonUser, project_createByUser, role_allCreated, role_createdByUser,
      role_defaultSet, team_createdByUser } = this.state
    let u_supperUser = user_supperUser, u_commonUser = user_commonUser
    let p_createByUser = project_createByUser
    let r_allCreated = role_allCreated, r_createdByUser = role_createdByUser, r_defaultSet = role_defaultSet
    let t_createdByUser = team_createdByUser
    let memberOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '55%',
        top: 'middle',
        data: [{ name: '系统管理员' }, { name: '普通成员' }],
        formatter: function (name) {
          if (name === '系统管理员') {
            return name + u_supperUser + '个'
          } else if (name === '普通成员') {
            return name + u_commonUser + '个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#2db7f5', '#2abe84', '#B0E2FF'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['60', '0'],
        center: ['30%', '48%'],
        data: [
          { value: u_supperUser, name: '系统管理员' },
          { value: u_commonUser, name: '普通成员', selected: true },
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
        data: ['我创建'],
        formatter: function (name) {
          if (name === '我创建') {
            return name + t_createdByUser + '个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#2db7f5', '#B0E2FF'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['60', '0'],
        center: ['30%', '48%'],
        data: [
          { value: t_createdByUser, name: '我创建' },
          { value: 100 - Number(t_createdByUser), name: '其他' },
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
        data: ['我创建'],
        formatter: function (name) {
          if (name === '我创建') {
            return name + p_createByUser + '个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#2db7f5', '#B0E2FF'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['60', '0'],
        center: ['30%', '48%'],
        data: [
          { value: p_createByUser, name: '我创建' },
          { value: 100 - Number(p_createByUser), name: '其他' },
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
            return name + r_defaultSet + '个'
          } else if (name === '共创建') {
            return name + r_allCreated + '个'
          } else if (name === '我创建') {
            return name + r_createdByUser + '个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#2db7f5', '#2abe84', '#B0E2FF'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['60', '0'],
        center: ['30%', '48%'],
        data: [
          { value: r_defaultSet, name: '系统默认' },
          { value: r_allCreated, name: '共创建' },
          { value: r_createdByUser, name: '我创建', selected: true },
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
      { src: require('../../assets/img/tenantManage/tenatDetail.png') },
      { src: require('../../assets/img/tenantManage/guide.png') },
    ]
    const btmStyle = {
      visibility: this.state.iconState ? 'inherit' : 'hidden'
    }
    const itemStyle = {
      visibility: this.state.iconState ? 'hidden' : 'inherit'
    }
    return (
      <QueueAnim>
      <div id="tenantManage" key='tenantManage'>
        <Title title="概览" />
        <Row className="title">
          控制权限概览
          <Button style={btmStyle} className="bGuide" onClick={this.handleIco.bind(this)}><img src={images[1].src} />操作引导</Button>
        </Row>
        <div className="alertRow">
          <span>租户管理满足细粒度的权限控制需求，帮助企业做好权限分配和管理，同时处理好授权方面的一些难题。按需为用户分配最小权限，从而降低企业的信息安全风险。</span>
        </div>
        <Row className="content" gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <Card title="成员" extra={<div><span>共</span><span>{this.state.member}</span><span>个</span></div>} bordered={false} bodyStyle={{ height: 180, padding: '0px' }}>
              <ReactEcharts
                notMerge={true}
                option={memberOption}
                style={{ height: '180px' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="团队" extra={<div><span>共</span><span>{this.state.team}</span><span>个</span></div>} bordered={false} bodyStyle={{ height: 180, padding: '0px' }}>
              <ReactEcharts
                notMerge={true}
                option={teamOption}
                style={{ height: '180px' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="项目" extra={<div><span>共</span><span>{this.state.project}</span><span>个</span></div>} bordered={false} bodyStyle={{ height: 180, padding: '0px' }}>
              <ReactEcharts
                notMerge={true}
                option={projectOption}
                style={{ height: '180px' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="角色" extra={<div><span>共</span><span>{this.state.role}</span><span>个</span></div>} bordered={false} bodyStyle={{ height: 180, padding: '0px' }}>
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
              style={itemStyle}
              extra={<div style={{ width: 20, height: 20 }}><Icon className="ico" style={{ fontSize: 23 }} type={this.state.iconState ? "circle-o-down" : "circle-o-up"} onClick={this.handleIco.bind(this)} /></div>}
            >
              <div className={this.state.iconState ? "itmsInfo" : "infos"}>
                <div className="tagItems" id="tagItems">
                  <Row>
                    <Col span={12}>
                      <div className="tagImg">
                        <img src={images[0].src} />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="tagDesc">
                        <div className="tagInfo">
                          <svg className='member commonImg'>
                            <use xlinkHref="#member"></use>
                          </svg> &nbsp;
                          <span>成员：平台上的成员</span>
                        </div>
                        <div className="tagInfo">
                          <svg className='team commonImg'>
                            <use xlinkHref="#team"></use>
                          </svg> &nbsp;
                          <span>团队：由n个成员组成</span>
                        </div>
                        <div className="tagInfo">
                          <svg className='authority commonImg'>
                            <use xlinkHref="#authority"></use>
                          </svg> &nbsp;
                          <span>权限：平台上每个功能模块权限的细粒度划分</span>
                        </div>
                        <div className="tagInfo">
                          <div className="role"></div>
                          <span>角色：在项目中添加，由n个权限组成</span>
                        </div>
                        <div className="tagInfo">
                          <div className="project"></div>
                          <span>项目：实现哪些人在项目中可以使用哪些资源的权限</span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  return {}
}

export default connect(mapStateToProps, {
  fetchinfoList
})(TenantManage)