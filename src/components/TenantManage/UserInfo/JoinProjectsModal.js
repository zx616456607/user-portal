/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Join projects modal
 *
 * v0.1 - 2017-07-18
 * @author Zhangpc
 */

import React from 'react'
import { Modal, Transfer, Button, Menu, Row, Col, Checkbox } from 'antd'
import './style/JoinProjectsModal.less'

// const TabPane = Tabs.TabPane
const STEPS = [
  {
    step: 1,
    desc: '将成员添加到项目',
  },
  {
    step: 2,
    desc: '为成员授予在项目中的角色',
  },
]

export default class JoinProjectsModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 1,
      allProjects: [],
      projectTargetKeys: [],
    }
    this.handleProjectTransferChange = this.handleProjectTransferChange.bind(this)
    this.renderStep = this.renderStep.bind(this)
  }

  handleProjectTransferChange(projectTargetKeys) {
    this.setState({ projectTargetKeys })
  }

  renderStep() {
    const { step, allProjects, projectTargetKeys } = this.state
    if (step === 1) {
      return (
        <Transfer
          dataSource={allProjects}
          showSearch
          listStyle={{
            width: 250,
            height: 300,
          }}
          titles={['选择项目', '已选择项目']}
          operations={['添加', '移除']}
          targetKeys={projectTargetKeys}
          onChange={this.handleProjectTransferChange}
          render={item => item.teamName}
        />
      )
    }
    const a = [0,1,2,3,4,5,6,7,8,9,10]
    const r = [0,1,2,3,4,]
    return (
      <div>
        {/* <Tabs>
          {
            a.map(i => <TabPane tab={`选项卡${i}`} key={i}>选项卡{i}内容</TabPane>)
          }
        </Tabs> */}
        <Row gutter={16}>
          <Col span={6}>
            <div className="selectedProjects">
              <Menu mode="inline">
                {
                  a.map(i => (
                    <Menu.Item>
                      项目{i}
                    </Menu.Item>
                  ))
                }
              </Menu>
            </div>
          </Col>
          <Col span={18}>
            <div className="roles">
              {
                r.map(i => (
                  <div className="checkRole">
                    <Checkbox>
                      角色-{i}
                    </Checkbox>
                  </div>
                ))
              }
            </div>
          </Col>
        </Row>
      </div>
    )
  }

  render() {
    return (
      <Modal
        {...this.props}
        title="加入项目"
        wrapClassName="JoinProjectsModal"
      >
      <div className="topStep">
        {
          STEPS.map(step => (
            <span className={step.step <= this.state.step ? 'step active' : 'step'}>
              <span className="number">{step.step}</span>
              {step.desc}
            </span>
          ))
        }
      </div>
      {
        this.renderStep()
      }
      <Button onClick={() => this.setState({step: 1})}>上一步</Button>
      <Button onClick={() => this.setState({step: 2})}>下一步</Button>
      </Modal>
    )
  }
}
