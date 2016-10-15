/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppStore component
 *
 * v0.1 - 2016-09-21
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Input, Modal, Checkbox, Button, Card, Menu } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppStore.less"

const testData = [{
  id: "1",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "2",
  imageName: "Mysql",
  resource: "/img/test/mysql.jpg",
}, {
  id: "3",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "4",
  imageName: "Oracle",
  resource: "/img/test/oracle.jpg",
}, {
  id: "5",
  imageName: "Mysql",
  resource: "/img/test/mysql.jpg",
}, {
  id: "6",
  imageName: "Php",
  resource: "/img/test/php.jpg",
}, {
  id: "7",
  imageName: "Oracle",
  resource: "/img/test/oracle.jpg",
}, {
  id: "8",
  imageName: "Oracle",
  resource: "/img/test/oracle.jpg",
}, {
  id: "9",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "10",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "11",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "12",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "13",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "14",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "15",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "16",
  imageName: "Oracle",
  resource: "/img/test/oracle.jpg",
}, {
  id: "17",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "18",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "19",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "20",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "21",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "22",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "23",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "24",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "25",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "26",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "27",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "28",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "29",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}, {
  id: "30",
  imageName: "Github",
  resource: "/img/test/github.jpg",
}];

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  checkedFunc: function (e) {
    //check this item selected or not
    const {scope} = this.props;
    let oldList = scope.state.selectedList;
    if (oldList.includes(e)) {
      return true;
    } else {
      return false;
    }
  },
  onSelect: function (e) {
    //single item selected function
    const {scope} = this.props;
    let oldList = scope.state.selectedList;
    if (oldList.includes(e)) {
      let index = oldList.indexOf(e);
      oldList.splice(index, 1);
    } else {
      oldList.push(e);
    }
    scope.setState({
      selectedList: oldList
    });
  },
  render: function () {
    let config = this.props.config;
    let items = config.map((item) => {
      return (
        <div key={item.id} className={this.checkedFunc(item.id) ? "selectedApp AppDetail" : "AppDetail"}
          onClick={this.onSelect.bind(this, item.id)}
          >
          <Card className="imgBox">
            <img src={item.resource} />
            <i className="selectIcon fa fa-check-circle"></i>
          </Card>
          <span>{item.imageName}</span>
        </div>
      );
    });
    return (
      <div className="AppList">
        {items}
      </div>
    );
  }
});

export default class AppStore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedList: []
    }
  }

  render() {
    const parentScope = this
    return (
      <QueueAnim id="AppStore"
        type="right"
        >
        <div className="AppStore" key="AppStore">
          <div className="operaBox">
            <div className="line"></div>
            <span>选择应用</span>
            <Input placeholder="搜索你的本命应用~" size="large" />
            <Button>
              <i className="fa fa-search"></i>
            </Button>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            <MyComponent config={testData} scope={parentScope} />
          </div>
          <div className="btnBox">
            <Link to={`/app_manage/app_create`}>
              <Button type="primary" size="large">
                上一步
	          </Button>
            </Link>
            <Link to={`/app_manage/app_create/compose_file`}>
              <Button type="primary" size="large">
                下一步
	          </Button>
            </Link>
          </div>
        </div>
      </QueueAnim>
    )
  }
}

AppStore.propTypes = {
  selectedList: React.PropTypes.array
}
