/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * DetailInfo component
 *
 * v0.1 - 2016-10-19
 * @author BaiYu
 */

import React, { Component } from 'react'
import { Card , Spin , Button ,Icon} from 'antd'
import DockerFileEditor from '../../../Editor/DockerFile'
import cloneDeep from 'lodash/cloneDeep'

let editorOptions = {
    readOnly: true
}
export default class Dockerfile extends Component {
  constructor(props) {
    super(props);
    const bakDockerfile = cloneDeep(this.props.detailInfo.dockerfile)
    this.state ={
      eitor: false,
      dockerfile: this.props.detailInfo.dockerfile,
      bakDockerfile
    }

  }
  componentWillReceiveProps(nextProps) {
    const prevImage = this.props.detailInfo.name
    const selfImage = nextProps.detailInfo.name
    const bakDockerfile = cloneDeep(nextProps.detailInfo.dockerfile)
    if (prevImage !== selfImage) {
      this.setState({
        dockerfile:　nextProps.detailInfo.dockerfile,
        bakDockerfile
      })
    }
  }
  handEdit(status) {
    this.setState({
      editor: status
    })
    editorOptions = {
      readOnly: !status
    }
    if (!status) {
      const { bakDockerfile } = this.state
      this.setState({
        dockerfile: bakDockerfile
      })
    }
  }
  onChangeDockerFile(e) {
    //this functio for the editor ccallback
    this.setState({
      dockerfile: e
    })
  }
  updateImageInfo() {
    const { updateImageinfo } = this.props.scope.props
    const image = this.props.detailInfo.name
    const _this = this
    const config = {
      image,
      registry: this.props.registry,
      body: { dockerfile: this.state.dockerfile }
    }
    const scope = this.props.scope
    updateImageinfo(config, {
      success: {
        func: (res)=> {
          editorOptions = {readOnly: true}
          _this.setState({
            editor: false
          })
        },
        isAsync: true
      },
      failed: {
        func: (res)=> {
          message.error('更新失败！')
          editorOptions = {readOnly: true}
          _this.setState({
            editor: false,
            dockerfile: this.state.bakDockerfile
          })
        }

      }
    })
  }
  render() {
    const isFetching = this.props.isFetching

    if (isFetching) {
      return (
        <Card className="dockerfile">
          <div className="loadingBox">
          <Spin size="large" />
          </div>
        </Card>
      )
    }
    // if (!this.state.editor || dockerfile == '') {
    //   return (
    //     <Card className="dockerfile">
    //       Not Dockerfile
    //       {(this.props.isOwner && !this.state.editor)?
    //       <Button style={{float:'right'}} onClick={()=> this.handEdit()}><Icon type="edit" />&nbsp;编辑</Button>
    //       : null
    //       }
    //     </Card>
    //   )
    // }
    return (
      <Card className="dockerfile">
        <DockerFileEditor value={this.state.dockerfile} callback={this.onChangeDockerFile.bind(this)} options={editorOptions} />
        {this.props.isOwner && this.state.editor ?

        <div style={{lineHeight:'50px'}} className="text-center">
          <Button size="large" type="ghost" onClick={()=> this.handEdit(false)} style={{marginRight:'10px'}}>取消</Button>
          <Button size="large" type="primary" onClick={()=>this.updateImageInfo()}>确定</Button>
        </div>
        :
        <div style={{lineHeight:'50px'}} className="text-center">
          <Button size="large" onClick={()=> this.handEdit(true)}>编辑</Button>
        </div>
        }
      </Card>
    )
  }
}
