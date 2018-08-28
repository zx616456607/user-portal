/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * select Stack Modal component
 *
 * v0.1 - 2016-12-1
 * @author Bai Yu
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Tabs, Spin } from 'antd'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadMyStack, loadStack, searchStack, loadStackDetail } from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import './style/AppAddStackModal.less'
import IntlMessage from '../../../containers/Application/intl'

const TabPane = Tabs.TabPane

class PrivateComponent extends Component {
  constructor(props) {
    super(props)
  }
  deployStack(item) {
    const { parentScope } = this.props
    parentScope.props.loadStackDetail(item.id, {
      success: {
        func: (res) => {
          parentScope.setState({
            templateName: item.name,
            appDescYaml: res.data.data.content,
            modalShow: false
          })
        }
      }
    })
  }
  render() {
    const { data, scope, isFetching, intl } = this.props
    if (isFetching) {
      return <div className="loadingBox">
        <Spin size="large"/>
      </div>
    }
    const itemList = data.map(list => {
      return (
        <div className="list" key={`private-`+list.name}>
          <svg className="imgUrl">
            {/*@#gear*/}
            <use xlinkHref='#server' />
          </svg>
          <div className="infoBox">
            <div className="textoverflow">{intl.formatMessage(IntlMessage.name)}：{list.name} </div>
            <div className="textoverflow">{intl.formatMessage(IntlMessage.description)}：{list.description}</div>
          </div>
          <div className="deployBtn">
            <Button type="primary" onClick={()=> this.deployStack(list)}>
              <FormattedMessage {...IntlMessage.deploy}/>
              &nbsp;&nbsp;
              <i className="fa fa-arrow-circle-o-right"></i>
            </Button>
          </div>
        </div>
      )
    })
    return (
      <div className="boxList">
        {itemList}
      </div>
    )
  }
}

class PublicComponent extends Component {
  constructor(props) {
    super(props)
  }
  componentWillMount() {
    const { loadStack } = this.props.scope.props
    loadStack(DEFAULT_REGISTRY)
  }
  deployStack(item) {
    const {parentScope} = this.props
    parentScope.props.loadStackDetail(item.id, {
      success: {
        func: (res) => {
          parentScope.setState({
            templateName: item.name,
            appDescYaml: res.data.data.content,
            modalShow: false
          })
        }
      }
    })
  }
  render() {
    const { stackList, isFetching } = this.props
    if (isFetching) {
      return <div className="loadingBox">
        <Spin size="large"/>
      </div>
    }
    const itemList = stackList.map(list => {
      return (
        <div className="list" key={`public`+ list.name}>
          <svg className="imgUrl">
            {/*@#gear*/}
            <use xlinkHref='#server' />
          </svg>
          <div className="infoBox">{list.name}</div>
          <div className="deployBtn">
            <Button type="primary" onClick={() => this.deployStack(list)}>
              <FormattedMessage {...IntlMessage.deploy}/>
              &nbsp;
              <i className="fa fa-arrow-circle-o-right"></i>
            </Button>
          </div>
        </div>
      )
    })
    return (
      <div className="boxList">
        {itemList}
      </div>
    )
  }
}
PublicComponent.propTypes = {
  intl: PropTypes.object.isRequired,
  loadStack: PropTypes.func.isRequired
}

class AppAddStackModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentImageType: 'private-stack',
      privateStack: []
    }
  }

  componentWillMount() {
    this.props.loadMyStack(DEFAULT_REGISTRY,{ filter:'owned' },{
      success:{
        func: (res)=> {
          let privateStack = []
          try {
            privateStack = res.data.data.templates
          } catch (error) {
          }
          this.setState({privateStack})
        }
      }
    })
  }
  changeType(type) {
    document.getElementById('stackName').focus()
    this.setState({
      currentImageType: type
    })
  }
  gosearchStack() {
    const stackType = this.state.currentImageType
    const { myStackList } = this.props
    const config = {
      stackType,
      registry: DEFAULT_REGISTRY,
      imageName: document.getElementById('stackName').value
    }
    if (stackType === 'private-stack') {
      if (config.imageName =='') {
        this.setState({privateStack: myStackList.templates })
        return
      }
      let privateStack = myStackList.templates.filter((list)=> {
        const search = new RegExp(config.imageName)
        if (search.test(list.name)) {
          return true
        }
        return false
      })
      this.setState({privateStack})
      return
    }
    this.props.searchStack(config)
  }
  render() {
    const parentScope = this.props.scope
    const { intl } = this.props
    return (
      <div id="AppAddStackModal" key="AppAddStackModal">
        <div className="operaBox">
          {/* <Button type={this.state.currentImageType == "primary" ? "primary" : "ghost"} size="large" onClick={this.selectImageType.bind(this, "privary")}>
            公有
          </Button>
          <Button size="large" type={this.state.currentImageType == "public" ? "primary" : "ghost"} onClick={this.selectImageType.bind(this, "public")}>
            私有
          </Button>
         */}
          <div className="inputBox">
            <Input size="large" style={{paddingRight: '28px'}} placeholder="按名称搜索" onPressEnter={() => this.gosearchStack()} id="stackName"/>
            <i className="fa fa-search" onClick={()=> this.gosearchStack()}></i>
          </div>
        </div>
        <Tabs defaultActiveKey="1" onChange={(e) => this.changeType(e)}>
          <TabPane tab={intl.formatMessage(IntlMessage.private)} key="private-stack">
            <PrivateComponent
              scope={this}
              intl={intl}
              parentScope= { parentScope }
              data={this.state.privateStack}
              isFetching={this.props.isFetching}
            />
          </TabPane>
          <TabPane tab={intl.formatMessage(IntlMessage.public)} key="public-stack">
            <PublicComponent
              scope={this}
              intl={intl}
              parentScope= { parentScope }
              stackList={this.props.stackList.templates || []}
              isFetching={this.props.isFetching}
            />
          </TabPane>
        </Tabs>


      </div>
    )
  }

}


AppAddStackModal.propTypes = {
  intl: PropTypes.object.isRequired,
  loadMyStack: PropTypes.func.isRequired
}
function mapStateToProps(state, props) {
  const defaultPrivateImages = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    myStackList: {templates:[]},
    stackList: {templates:[]}
  }
  const { stackCenter } = state.images
  const { myStackList, isFetching, registry, stackList} = stackCenter[DEFAULT_REGISTRY] || defaultPrivateImages

  return {
    myStackList: myStackList || {},
    isFetching,
    registry,
    stackList: stackList || {}
  }
}

export default connect(mapStateToProps, {
  loadMyStack,
  loadStack,
  searchStack,
  loadStackDetail
})(injectIntl(AppAddStackModal, {
  withRef: true,
}))
