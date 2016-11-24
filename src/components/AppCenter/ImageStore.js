/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageStore component
 *
 * v0.1 - 2016-10-10
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom';
import { Menu, Button, Card, Input } from 'antd'
import QueueAnim from 'rc-queue-anim'
import ScrollAnim from 'rc-scroll-anim';
import TweenOne from 'rc-tween-one';
import Animate from 'rc-animate';
import { connect } from 'react-redux'
import $ from 'n-zepto'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/ImageStore.less"

const InputGroup = Input.Group;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const Link = ScrollAnim.Link;
const Element = ScrollAnim.Element;
const ScrollOverPack = ScrollAnim.OverPack;
const EventListener = ScrollAnim.Event;

let appStoreImages = [
  {
    "title": "持续集成与部署",
    "imageList": [
      {
        "id": "1001",
        "intro": "Jenkins 持续集成",
        "imgUrl": "/img/appstore/jenkins.svg"
      }, {
        "id": "1002",
        "intro": "Sonar 代码分析",
        "imgUrl": "/img/appstore/sonar.png"
      }, {
        "id": "1003",
        "intro": "Gitlab 代码托管",
        "imgUrl": "/img/appstore/gitlab.svg"
      }
    ]
  }, {
    "title": "项目管理、协作",
    "imageList": [
      {
        "id": "2001",
        "intro": "Confluence",
        "imgUrl": "/img/appstore/conflunt.png"
      }, {
        "id": "2002",
        "intro": "Jira",
        "imgUrl": "/img/appstore/jira.jpg"
      }
    ]
  }, {
    "title": "开发环境(内置SSH)",
    "imageList": [
      {
        "id": "3001",
        "intro": "Java + Maven + Tomcat",
        "imgUrl": "/img/appstore/tomcat.svg"
      }, {
        "id": "3002",
        "intro": "Java + Ant",
        "imgUrl": "/img/appstore/tomcat.svg"
      }, {
        "id": "3003",
        "intro": "Python + Django",
        "imgUrl": "/img/appstore/python.png"
      }, {
        "id": "3004",
        "intro": "Node.js",
        "imgUrl": "/img/appstore/node.png"
      }, {
        "id": "3005",
        "intro": "PHP + Apache",
        "imgUrl": "/img/appstore/php.jpg"
      }, {
        "id": "3006",
        "intro": "Golang",
        "imgUrl": "/img/appstore/golang.png"
      }
    ]
  }, {
    "title": "Web 服务器",
    "imageList": [
      {
        "id": "4001",
        "intro": "Tomcat",
        "imgUrl": "/img/appstore/tomcat.svg"
      }, {
        "id": "4002",
        "intro": "JBoss",
        "imgUrl": "/img/appstore/jboss.png"
      }, {
        "id": "4003",
        "intro": "Weblogic",
        "imgUrl": "/img/appstore/weblogic12.svg"
      }
    ]
  }, {
    "title": "数据库与缓存(单节点)",
    "imageList": [
      {
        "id": "5001",
        "intro": "MySQL",
        "imgUrl": "/img/appstore/mysql.svg"
      }, {
        "id": "5002",
        "intro": "PostgreSQL",
        "imgUrl": "/img/appstore/mysql.svg"
      }, {
        "id": "5003",
        "intro": "Redis",
        "imgUrl": "/img/appstore/redis.svg"
      }, {
        "id": "5004",
        "intro": "Mongodb",
        "imgUrl": "/img/appstore/mongo.svg"
      }, {
        "id": "5005",
        "intro": "Mariadb",
        "imgUrl": "/img/appstore/mariadb.png"
      }, {
        "id": "5006",
        "intro": "Zookeeper",
        "imgUrl": "/img/appstore/zookeeper.svg"
      }
    ]
  }, {
    "title": "测试工具",
    "imageList": [
      {
        "id": "6001",
        "intro": "Selenium",
        "imgUrl": "/img/appstore/selenium.jpg"
      }
    ]
  }, {
    "title": "大数据处理",
    "imageList": [
      {
        "id": "7001",
        "intro": "Spark",
        "imgUrl": "/img/appstore/spark.svg"
      }, {
        "id": "7002",
        "intro": "Storm",
        "imgUrl": "/img/appstore/storm.png"
      }
    ]
  }
]

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
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
                  <div className="imgBox">
                    <img src={imageDetail.imgUrl} />
                  </div>
                  <div className="intro">
                    <span className="span7 textoverflow">{imageDetail.intro}</span>
                    <span className="span2"><Button className="btn-deploy">部署</Button></span>
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
//<div id="ImageStore" key="ImageStoreBox">
class ImageStore extends Component {
  constructor(props) {
    super(props);
    super(...arguments);
    this.windowScroll = this.windowScroll.bind(this);
    this.scrollElem = this.scrollElem.bind(this);
    this.state = {
      current: "1",
      scrollTop: 0,
      ElemPaused: true,
      ElemReverse: false,
      ElemMoment: null
    }
  }

  componentDidMount() {

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
    domElem.animate({ scrollTop: offetset }, 500)
    //    domElem.srcollTop = offetset;
  }

  render() {
    const { current } = this.state;
    const { formatMessage } = this.props.intl;
    const scope = this;
    return (
      <QueueAnim className="ImageStoreBox"
        type="right"
        onScroll={this.windowScroll.bind(this)}
        ref="ImageStoreBox"
        >
        <div className="nav">
          <div className={current == "1" ? "currentNav navItem" : "navItem"} onClick={this.scrollElem.bind(this, 0)}>
            <i className={current == "1" ? "fa fa-star" : "fa fa-star-o"}></i>&nbsp;&nbsp;
            持续集成
          </div>
          <div className="line"></div>
          <div className={current == "2" ? "currentNav navItem" : "navItem"} onClick={this.scrollElem.bind(this, 1)}>
            <i className={current == "2" ? "fa fa-star" : "fa fa-star-o"}></i>&nbsp;&nbsp;
            项目管理
          </div>
          <div className="line"></div>
          <div className={current == "3" ? "currentNav navItem" : "navItem"} onClick={this.scrollElem.bind(this, 2)}>
            <i className={current == "3" ? "fa fa-star" : "fa fa-star-o"}></i>&nbsp;&nbsp;
            开发环境
          </div>
          <div className="line"></div>
          <div className={current == "4" ? "currentNav navItem" : "navItem"} onClick={this.scrollElem.bind(this, 3)}>
            <i className={current == "4" ? "fa fa-star" : "fa fa-star-o"}></i>&nbsp;&nbsp;
            Web 服务器
          </div>
          <div className="line"></div>
          <div className={current == "5" ? "currentNav navItem" : "navItem"} onClick={this.scrollElem.bind(this, 4)}>
            <i className={current == "5" ? "fa fa-star" : "fa fa-star-o"}></i>&nbsp;&nbsp;
            数据库与缓存
          </div>
          <div className="line"></div>
          <div className={current == "6" ? "currentNav navItem" : "navItem"} onClick={this.scrollElem.bind(this, 5)}>
            <i className={current == "6" ? "fa fa-star" : "fa fa-star-o"}></i>&nbsp;&nbsp;
            测试工具
          </div>
          <div className="line"></div>
          <div className={current == "7" ? "currentNav navItem" : "navItem"} onClick={this.scrollElem.bind(this, 6)}>
            <i className={current == "7" ? "fa fa-star" : "fa fa-star-o"}></i>&nbsp;&nbsp;
            大数据
          </div>
        </div>
        <MyComponent key="ImageStoreBox" scope={scope} config={appStoreImages} />
      </QueueAnim>
    )
  }
}

ImageStore.propTypes = {
  intl: PropTypes.object.isRequired
}

export default connect()(injectIntl(ImageStore, {
  withRef: true,
}))