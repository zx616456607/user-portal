import React from 'react'
import { Row, Card, Col } from 'antd'
import './style/BeginnerGuidance.less'
const BeginnerGuidance = () => {
  const images = [
    { src: require('../../../assets/img/tenantManage/tenatDetail.png') },
    { src: require('../../../assets/img/tenantManage/guide.png') },
  ]

  return <Row className="content" gutter={30}>
    <Col span={30}>
      <Card
        title="操作引导"
      >
        <div id= "beginer-guidance">
          <div className="tagItems" id="tagItems">
            <Row>
              <Col span={12}>
                <div className="tagImg">
                  <img src={images[0].src} alt="" />
                </div>
              </Col>
              <Col span={12}>
                <div className="tagDesc">
                  <div className="tagInfo">
                    <svg className="member commonImg">
                      <use xlinkHref="#member"></use>
                    </svg> &nbsp;
                    <span>成员：平台上的成员</span>
                  </div>
                  <div className="tagInfo">
                    <svg className="team commonImg">
                      <use xlinkHref="#team"></use>
                    </svg> &nbsp;
                    <span>团队：由n个成员组成</span>
                  </div>
                  <div className="tagInfo">
                    <svg className="authority commonImg">
                      <use xlinkHref="#authority"></use>
                    </svg> &nbsp;
                    <span>权限：平台上每个功能模块权限的细粒度划分</span>
                  </div>
                  <div className="tagInfo">
                    <div className="role"></div>
                    <span>角色：在项目中添加，由n个权限组成</span>
                  </div>
                  <div className="tagInfo">
                    <div className="project"></div>
                    <span>项目：实现哪些人在项目中可以使用哪些资源的权限</span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Card>
    </Col>
  </Row>
}
export default BeginnerGuidance
