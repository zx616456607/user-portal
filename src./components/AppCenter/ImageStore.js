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
import { Menu, Button, Card } from 'antd'
import QueueAnim from 'rc-queue-anim'
import ScrollAnim from 'rc-scroll-anim';
import TweenOne from 'rc-tween-one';
import Animate from 'rc-animate';
import { connect } from 'react-redux'
import $ from 'n-zepto'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/ImageStore.less"

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const Link = ScrollAnim.Link;
const Element = ScrollAnim.Element;
const ScrollOverPack = ScrollAnim.OverPack;
const EventListener = ScrollAnim.Event;

let testData = [
  {
    "title": "持续集成与部署",
    "imageList": [
      {
        "id": "1001",
        "intro": "Jenkins 持续集成",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "1002",
        "intro": "Sonar 代码分析",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "1003",
        "intro": "Gitlab 代码托管",
        "imgUrl": "/img/test/github.jpg"
      }
    ]
  }, {
    "title": "项目管理、协作",
    "imageList": [
      {
        "id": "2001",
        "intro": "Confluence",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "2002",
        "intro": "Jira",
        "imgUrl": "/img/test/github.jpg"
      }
    ]
  }, {
    "title": "开发环境(内置SSH)",
    "imageList": [
      {
        "id": "3001",
        "intro": "Java + Maven + Tomcat",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "3001",
        "intro": "Java + Ant",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "3002",
        "intro": "Python + Django",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "3003",
        "intro": "Node.js",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "3004",
        "intro": "PHP + Apache",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "3005",
        "intro": "Golang",
        "imgUrl": "/img/test/github.jpg"
      }
    ]
  }, {
    "title": "Web 服务器",
    "imageList": [
      {
        "id": "4001",
        "intro": "Tomcat",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "5002",
        "intro": "JBoss",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "5003",
        "intro": "Weblogic",
        "imgUrl": "/img/test/github.jpg"
      }
    ]
  }, {
    "title": "数据库与缓存(单节点)",
    "imageList": [
      {
        "id": "6001",
        "intro": "MySQL",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "6002",
        "intro": "PostgreSQL",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "6003",
        "intro": "Redis",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "6004",
        "intro": "Mongodb",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "6005",
        "intro": "Mariadb",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "6005",
        "intro": "Zookeeper",
        "imgUrl": "/img/test/github.jpg"
      }
    ]
  }, {
    "title": "测试工具",
    "imageList": [
      {
        "id": "2001",
        "intro": "Selenium",
        "imgUrl": "/img/test/github.jpg"
      }
    ]
  }, {
    "title": "大数据处理",
    "imageList": [
      {
        "id": "8001",
        "intro": "Spark",
        "imgUrl": "/img/test/github.jpg"
      }, {
        "id": "8001",
        "intro": "Storm",
        "imgUrl": "/img/test/github.jpg"
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
                    <span>{imageDetail.intro}</span>
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
      <div style={{ transform: "none !important" }}>
        {items}
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
      if ((scroll + rootHeight - itemClient) > (offetset - 50) && i == moduleList.length - 1) {
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
            title1
          </div>
          <div className="line"></div>
          <div className={current == "2" ? "currentNav navItem" : "navItem"} onClick={this.scrollElem.bind(this, 1)}>
            <i className={current == "2" ? "fa fa-star" : "fa fa-star-o"}></i>&nbsp;&nbsp;
            title2
          </div>
          <div className="line"></div>
          <div className={current == "3" ? "currentNav navItem" : "navItem"} onClick={this.scrollElem.bind(this, 2)}>
            <i className={current == "3" ? "fa fa-star" : "fa fa-star-o"}></i>&nbsp;&nbsp;
            title3
          </div>
          <div className="line"></div>
          <div className={current == "4" ? "currentNav navItem" : "navItem"} onClick={this.scrollElem.bind(this, 3)}>
            <i className={current == "4" ? "fa fa-star" : "fa fa-star-o"}></i>&nbsp;&nbsp;
            title4
          </div>
        </div>
        <MyComponent key="ImageStoreBox" scope={scope} config={testData} />
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