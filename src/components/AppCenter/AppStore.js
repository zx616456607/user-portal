/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * app store component
 *
 * v0.1 - 2016-10-10
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Input ,Modal} from 'antd'
import QueueAnim from 'rc-queue-anim'
import ScrollAnim from 'rc-scroll-anim'
import Animate from 'rc-animate'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadAppStore , loadStackDetail } from '../../actions/app_center'
import DetailBox from './StoreDetail'
import { DEFAULT_REGISTRY, TIMESTRAP } from '../../constants'

import "./style/ImageStore.less"

// const InputGroup = Input.Group;
// const SubMenu = Menu.SubMenu;
// const MenuItemGroup = Menu.ItemGroup;
// const Link = ScrollAnim.Link;
const Element = ScrollAnim.Element;
// const ScrollOverPack = ScrollAnim.OverPack;
// const EventListener = ScrollAnim.Event;


const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  showDetail(id) {
    console.log('id is', id)
    const parentScope = this.props.scope
    const {loadStackDetail} = parentScope.props
    loadStackDetail(id, {
      success: {
        func: (res) => {
          parentScope.setState({
            detailModal: true,
            detailContent: res.data.data
          })
        }
      }
    })
    // this.props.scope.setState({
    //   detailModal: true
    // })
  },
  render: function () {
    const { scope } = this.props;
    let config = this.props.config;
    let items = config.map((item, index) => {
      return (
        <div className={"moduleDetail store" + index} key={item + "" + index}>
          <div className="bigTitle">
            {item.title}
          </div>
          <div className="imageBox">
            {item.imageList.map((imageDetail) => {
              return (
                <Card className="imageDetail">
                  <div className="imgBox" onClick={()=>this.showDetail(imageDetail.id)}>
                    <img src={`${imageDetail.imageUrl}?_=${TIMESTRAP}`} />
                  </div>
                  <div className="intro">
                    <span className="span7 textoverflow">{imageDetail.name}</span>
                    <span className="span2"><Link to={`/app_manage/app_create/compose_file?templateid=${imageDetail.id}`} ><Button className="btn-deploy">部署</Button></Link></span>
                  </div>
                </Card>
              )
            }
            )}
            <div style={{ clear: "both" }}></div>
          </div>
        </div>
      );
    });
    return (
      <div className="storeBody" style={{ transform: "none !important" }}>
        {/* <div className="topSearch">
          <InputGroup className="ant-search-input-wrapper">
          <Input placeholder="搜索应用"  onChange={this.handleInputChange}
             onPressEnter={this.handleSearch}
          />
          <div className="ant-input-group-wrap">
            <Button icon="search"  className="" onClick={this.handleSearch} />
          </div>
        </InputGroup>
        </div>
        */}
        {items}
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      </div>
    );
  }
});

class AppStore extends Component {
  constructor(props) {
    super(props);
    super(...arguments);
    this.windowScroll = this.windowScroll.bind(this);
    this.state = {
      current: "1",
      scrollTop: 0,
      ElemPaused: true,
      ElemReverse: false,
      ElemMoment: null,
      detailContent: false
    }
  }

  componentWillMount() {
    document.title = '应用商店 | 时速云'
    const { loadAppStore } = this.props
    loadAppStore(DEFAULT_REGISTRY)
  }

  windowScroll(e) {
    //this function for user scroll the window
    let moduleList = document.getElementsByClassName("moduleDetail");
    let rootElement = document.getElementsByClassName("ImageStoreBox");
    let rootHeight = rootElement[0].clientHeight;
    let parentHeight = moduleList[0].parentElement.clientHeight;
    let temp = new Array();
    let scroll = e.target.scrollTop;//it's mean the big box scroll height
    for (let i = 0; i < moduleList.length; i++) {
      let offetset = moduleList[i].offsetTop;
      let itemClient = moduleList[i].clientHeight;
      if (scroll > (offetset - 150) && scroll < (offetset + 150)) {
        //it's mean user scroll the box and the little module's head apart from the top end in -150px~150px
        //and the nav will be underscore
        this.setState({
          current: i + 1
        });
      }
      if ((scroll + rootHeight - itemClient) > (offetset + 350) && i == moduleList.length - 1) {
        //it's mean when the box sroll to the bottom ,and the last module apart from the top end bigger than 150px
        //so that the current will be change to the last one
        this.setState({
          current: i + 1
        });
      }
    }
  }

  scrollElem(index) {
    let moduleList = document.getElementsByClassName("moduleDetail");
    let rootElement = document.getElementsByClassName("ImageStoreBox");
    let offetset = moduleList[index].offsetTop;
    //    rootElement[0].srcollTop = offetset;
    let domElem = this.refs.ImageStoreBox;
    domElem.Animate({ scrollTop: offetset }, 500)
    // console.log(domElem)
    // return
    //    domElem.srcollTop = offetset;
  }

  render() {
    const { current } = this.state;
    const { formatMessage } = this.props.intl;
    const scope = this;
    const {appStoreList} = this.props
    if (!appStoreList || appStoreList.length === 0) {
      return (<div className="imageNoData">暂无应用，请联系管理员进行初始化</div>)
    }
    const storeList = appStoreList.map((list, index) => {
      return (
        <span>
          <div className={current == index + 1 ? "currentNav navItem" : "navItem"} onClick={() => this.scrollElem(index)}>
            <i className={current == index + 1 ? "fa fa-star" : "fa fa-star-o"}></i>&nbsp;&nbsp;
              {list.title}
          </div>
          {(appStoreList.length - 1 > index) ? [<div className="line"></div>] : null}
        </span>
      )
    })
    return (
      <QueueAnim className="ImageStoreBox"
        type="right"
        onScroll={this.windowScroll.bind(this)}
        ref="ImageStoreBox"
        key="ImageStoreBox"
        >
        <div className="nav">
          {storeList}
        </div>
        <MyComponent key="ImageStoreBox-component" scope={scope} config={this.props.appStoreList} />
        <Modal
          visible={this.state.detailModal}
          className="AppServiceDetail"
          transitionName="move-right"
          onCancel={()=> {this.setState({detailModal: false}) }}
          >
          {/* right detail box  */}
          <DetailBox scope={scope} data={this.state.detailContent} />
        </Modal>
      </QueueAnim>
    )
  }
}

AppStore.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  const defaultPrivateImages = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    appStoreList: [],

  }
  const { stackCenter } = state.images
  const { appStoreList, isFetching, registry } = stackCenter[DEFAULT_REGISTRY] || defaultPrivateImages

  return {
    appStoreList,
    isFetching,
    registry,
  }
}

export default connect(mapStateToProps, {
  loadAppStore,
  loadStackDetail
})(injectIntl(AppStore, {
  withRef: true,
}))