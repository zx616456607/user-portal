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
import { Row,Col,Modal,Button,Icon,Badge,Table } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import CheckContainer from './ServiceCheckContainer'

class ConfigFile extends Component {
  constructor (props) {
    super(props)
    this.state = {
      checkConfigFile: false
    }
    this.checkConfigFile = this.checkConfigFile.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
  }
  checkConfigFile(checkConfigFile) {
    this.setState({ checkConfigFile })
  }
  handleEdit() {
    console.log('edit');
  }
  
  RendFileState(fileList) {
    console.log(fileList.length);
    console.log(this);
    if(fileList.length > 3){
      return (
        <div className="check">
          <Button type="primary" onClick={() => this.checkConfigFile(true)}>
            <Icon type="eye-o" />
            查看
          </Button>
          {/*查看更多-start*/}
          <Modal
            title={`配置文件 my_config_file`}
            wrapClassName="server-check-modal"
            visible={this.state.checkConfigFile}
            onOk={() => this.checkConfigFile(false)}
            onCancel={() => this.checkConfigFile(false)}
          >
            <div className="check-config">
              {/*查看更多-关联容器列表-start*/}
              <CheckContainer />
              {/*查看更多-关联容器列表*-end*/}
            </div>
          </Modal>
          {/*查看更多-end*/}
        </div>
      )
    } else if (fileList.length == 0){
      return (
        <div style={{textAlign: 'center'}}>
          暂无挂载
        </div>
      )
    } else if (configFile.length == 2) {
      return (
        <div style={{display: 'none'}}></div>
      )
    }
  }
  
  render () {
    const { configFile } = this.props
    let fileList = configFile.container
    let RendfileList = fileList.slice(0,3).map((fileItem) => {
      return (
        <td key={fileItem}>
          <div className="relate">
            {fileItem.containerName}
          </div>
          <div className="path">
            {fileItem.pointPath}
          </div>
        </td>
      )
    })
    
    return (
      <Row className="file-item">
        <div className="line"></div>
        <table>
          <tr>
            <td style={{padding: "0 10px"}}>
              <Icon type="file-text" style={{marginRight: "10px"}} />
              my_config_file1
            </td>
            <td style={{padding: "0 10px"}}>
              <Button type="primary"
                      style={{with: "30px",height: "30px",padding: "0 9px",marginRight: "5px"}}
                      onClick={() => this.handleEdit()}>
                <Icon type="edit" />
              </Button>
              <Button type="primary" style={{with: "30px",height: "30px",padding: "0 9px"}}>
                <Icon type="cross" />
              </Button>
            </td>
            <td>
              <div className="relate">
                关联容器
                <Badge count={11} style={{backgroundColor: "#5fb761",marginLeft: "20px"}} />
              </div>
              <div className="path">挂载路径</div>
            </td>
            
            {RendfileList}
            
            <td style={{padding:"0 30px"}}>
              {this.RendFileState(fileList)}
            </td>
          </tr>
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