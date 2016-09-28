/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/23
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import { Row,Col,Modal,Button,Icon,Badge,Table,Input } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import CheckContainer from './ServiceCheckContainer'

class ConfigFile extends Component {
  constructor (props) {
    super(props)
    this.state = {
      checkConfigFile: false,
      editConfigGroup: false
    }
    this.checkConfigFile = this.checkConfigFile.bind(this)
    this.editConfigGroup = this.editConfigGroup.bind(this)
    
  }
  checkConfigFile(checkConfigFile) {
    this.setState({ checkConfigFile })
  }
  editConfigGroup(editConfigGroup) {
    this.setState({ editConfigGroup })
  }
  RendFileState(configFile) {
    let containerList = configFile.container
    if(containerList.length > 3){
      return (
        <td style={{padding:"0 30px"}}>
          <div className="check">
            <Button type="primary" onClick={() => this.checkConfigFile(true)}>
              <Icon type="eye-o" />
              查看
            </Button>
            {/*查看更多-start*/}
            <Modal
              title={`配置文件 ${configFile.fileName}`}
              wrapClassName="server-check-modal"
              visible={this.state.checkConfigFile}
              onOk={() => this.checkConfigFile(false)}
              onCancel={() => this.checkConfigFile(false)}
            >
              <div className="check-config">
                {/*查看更多-关联容器列表-start*/}
                <CheckContainer containerList={containerList} />
                {/*查看更多-关联容器列表*-end*/}
              </div>
            </Modal>
            {/*查看更多-end*/}
          </div>
        </td>
      )
    } else if (containerList.length == 0){
      return (
        <td>
          <div style={{textAlign: 'center' ,width: "128px"}}>
            暂无挂载
          </div>
        </td>
      )
    } else {
      return (
        <td style={{display: 'none'}}></td>
      )
    }
  }
  
  render () {
    const { configFile } = this.props
    let containerList = configFile.container
    let RendfileList = containerList.slice(0,3).map((containerItem) => {
      return (
        <td>
          <div className="relate">
            {containerItem.containerName}
          </div>
          <div className="path">
            {containerItem.pointPath}
          </div>
        </td>
      )
    })
    return (
      <Row className="file-item">
        <div className="line"></div>
        <table>
          <tbody>
          <tr>
            <td style={{padding: "0 10px"}}>
              <Icon type="file-text" style={{marginRight: "10px"}} />
              {configFile.fileName}
            </td>
            <td style={{padding: "0 10px"}}>
              <Button type="primary"
                      style={{with: "30px",height: "30px",padding: "0 9px",marginRight: "5px"}}
                      onClick={() => this.editConfigGroup(true)}>
                <Icon type="edit" />
              </Button>
              
              {/*修改配置组-弹出层-start*/}
              <Modal
                title="修改配置组"
                wrapClassName="server-create-modal"
                visible={this.state.editConfigGroup}
                onOk={() => this.editConfigGroup(false)}
                onCancel={() => this.editConfigGroup(false)}
              >
                <div className="create-conf-g">
                  <span>名称 : </span>
                  <Input type="text" placeholder={`${configFile.fileName}`}/>
                </div>
              </Modal>
              {/*修改配置组-弹出层-end*/}
              
              <Button type="primary" style={{with: "30px",height: "30px",padding: "0 9px",
                backgroundColor: "#fff"}} className="config-cross">
                <Icon type="cross" />
              </Button>
            </td>
            <td>
              <div className="relate">
                关联容器
                <Badge count={`${containerList.length}`}
                       style={{backgroundColor: "#5fb761",marginLeft: "20px"}} />
              </div>
              <div className="path">挂载路径</div>
            </td>
            
            {RendfileList}
            
            {this.RendFileState(configFile)}
            
          </tr>
          </tbody>
        </table>
      </Row>
    )
  }
}

ConfigFile.propTypes = {
  configFile: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}
export default injectIntl(ConfigFile,{
  withRef: true,
})