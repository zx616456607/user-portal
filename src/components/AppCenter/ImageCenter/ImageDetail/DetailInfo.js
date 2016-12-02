/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * DetailInfo component
 *
 * v0.1 - 2016-10-09
 * @author BaiYu
 */
import React, { Component } from 'react'
import { Card , Button, Icon} from 'antd'
import './style/DetailInfo.less'
import DockFileEditor from '../../../Editor/DockerFile'

export default class DetailInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editor: false
    }
  }
  handEdit() {
    console.log(this)
    this.setState({
      editor: true
    })
  }
  onChangeDockerFile(e) {
    //this functio for the editor ccallback
    this.setState({
      dockerfiles: e
    })
  }
  updateImageInfo() {
    console.log(this)
    const { updateImageinfo } = this.props.scope
    // updateImageinfo()
  }
  render() {
    let detailMarkdown  = this.props.detailInfo
    if (detailMarkdown == '' || !detailMarkdown) {
      detailMarkdown = '还没有添加详细信息'
    }
    console.log('sfjlsd', this.props)
    const editorOptions = {
      readOnly: false
    }
    return (
      <Card className="imageDetailInfo markdown">
        {(this.props.isOwner && !this.state.editor)?
        <Button style={{float:'right'}} onClick={()=> this.handEdit()}><Icon type="edit" />&nbsp;编辑</Button>
        : null
        }
        {this.state.editor ? 
        <div className="editInfo">
          <DockFileEditor title="基本信息" value={this.state.dockerfiles} callback={this.onChangeDockerFile.bind(this)} options={editorOptions} />
          <div style={{float: 'right', lineHeight:'50px'}}>
            <Button size="large" type="ghost" onClick={()=> this.setState({editor: false})} style={{marginRight:'10px'}}>取消</Button>
            <Button size="large" type="primary" onClick={()=>this.updateImageInfo()}>确定</Button>
          </div>
        </div>
        :
        <div dangerouslySetInnerHTML={{__html:detailMarkdown}}></div>
        }
      </Card>
    )
  }
}

DetailInfo.propTypes = {
  //
}
