/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Image Table
 *
 * 2018-03-09
 * @author Zhangxuan
 */

import * as React from 'react';
import { connect } from 'react-redux';
import { Table, Radio, Button } from 'antd';
import CommonSearchInput from '../../../../../../components/SearchInput';
import * as harborActions from '../../../../../../../src/actions/harbor';
import * as AppStoreActions from '../../../../../../../src/actions/app_store';
import { DEFAULT_REGISTRY } from '../../../../../../../src/constants';
import { DEFAULT_PAGE_SIZE } from '../../../../../../../constants';
import { encodeImageFullname } from '../../../../../../../src/common/tools';
import NotificationHandler from '../../../../../../../src/components/Notification';
import './style/ImagePart.less';
import isEmpty from 'lodash/isEmpty';
import TenxIcon from '@tenx-ui/icon'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../../../../../src/containers/Application/intl'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const PUBLIC_IMAGES = 'publicImages';
const PRIVATE_IMAGES = 'privateImages';
const IMAGE_STORE = 'imageStore';

interface IProps {

}

interface IState {
  imageType: string;
}
class ImagePart extends React.Component<IProps, IState> {
  state = {
    imageType: PUBLIC_IMAGES,
    currentPage: 1,
  };

  componentWillMount() {
    this.loadImage();
  }

  loadImage = async () => {
    const { loadAllProject, clusterID, images, harbor, intl } = this.props;
    const { searchValue, imageType, currentPage } = this.state;
    const notify = new NotificationHandler();
    const query = {
      harbor,
    };
    if (searchValue) {
      Object.assign(query, { q: searchValue });
    }
    const result = await loadAllProject(DEFAULT_REGISTRY, query);
    if (result.error) {
      if (result.error.statusCode === 500) {
        notify.warn(intl.formatMessage(IntlMessage.requestFailure), intl.formatMessage(IntlMessage.imageStoreError));
      }
      return;
    }
  }

  loadImageStore() {
    const { getAppsList, intl } = this.props;
    const { searchValue, currentPage } = this.state;
    const notify = new NotificationHandler();
    let filter = 'type,2,publish_status,2';
    if (searchValue) {
      filter += `,file_nick_name,${searchValue}`;
    }
    const query = {
      form: (currentPage - 1) * 10,
      size: 10,
      filter,
    };
    getAppsList(query, {
      failed: {
        func: res => {
          if (res.statusCode === 500) {
            notify.warn(intl.formatMessage(IntlMessage.requestFailure),
                intl.formatMessage(IntlMessage.imageStoreError));
          }
        },
      },
    });
  }

  radioChange = e => {
    const { images, imageStoreList } = this.props;
    const imageType = e.target.value;

    this.setState({
      imageType,
    });
    if (imageType === IMAGE_STORE) {
      if (isEmpty(imageStoreList) || isEmpty(imageStoreList.apps)) {
        this.loadImageStore();
      }
      return;
    }
    if (isEmpty(images[imageType])) {
      this.loadImage();
    }
  }

  addImage = row => {
    const { selectPacket, images } = this.props;
    const { server } = images;
    selectPacket(row, server);
  }

  renderImageTable = () => {
    const { images, imageStoreList } = this.props;
    const { isFetching } = images;
    const { imageType, currentPage } = this.state;

    const imageList = images[imageType];
    if (imageType === IMAGE_STORE) {
      imageList = imageStoreList && imageStoreList.apps;
    }
    const columns = [{
      title: <FormattedMessage {...IntlMessage.imageName} />,
      dataIndex: imageType === IMAGE_STORE ? 'appName' : 'repositoryName',
      key: imageType === IMAGE_STORE ? 'appName' : 'repositoryName',
      render(text, row) {
        return (
          <div>
            <div className="imgUrl">
              <TenxIcon type="app-center-logo"/>
            </div>
            <div className="infoBox">
              <span className="name">{text}</span> <br />
              <span className="desc">{imageType !== IMAGE_STORE ? row.description : row.versions[0].description}</span>
            </div>
          </div>
        );
      },
    }, {
      title: <FormattedMessage {...IntlMessage.deploy} />,
      dataIndex: 'deploy',
      key: 'deploy',
      width: '10%',
      render: (text, row) => {
        // let str = row.repositoryName;
        // let server = images.server;
        // if (imageType === IMAGE_STORE) {
        //   server = row.resourceLink.split('/')[0];
        //   str = encodeImageFullname(row.resourceName);
        // }
        return (
          <div className="deployBox">
            <Button
              className="deployBtn"
              type="primary"
              size="large"
              onClick={() => this.addImage(row)}
            >
                <FormattedMessage {...IntlMessage.add} />&nbsp;
              <i className="fa fa-arrow-circle-o-right" />
            </Button>
          </div>
        );
      },
    }];
    const pagination = {
      simple: true,
      current: currentPage,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: current =>
        this.setState({ currentPage: current }, imageType === IMAGE_STORE ? this.loadImageStore() : this.loadImage()),
    };
    return (
      <Table
        rowKey={row => row.repositoryName}
        showHeader={false}
        pagination={pagination}
        className="imageList"
        dataSource={imageList}
        columns={columns}
        loading={isFetching}
      />
    );
  }
  render() {
    const { searchValue, imageType } = this.state;
    const { images, imageStoreList, intl } = this.props;
    let total = 0;
    if (imageType !== IMAGE_STORE) {
      total = images[imageType] ? images[imageType].length : 0;
    } else {
      total = imageStoreList ? imageStoreList.total : 0;
    }
    return (
      <div className="imagePart layout-content">
        <div className="imageHeader layout-content-btns">
          <span><FormattedMessage {...IntlMessage.selectImage} /></span>
          <span >
            <RadioGroup onChange={this.radioChange} size="large" value={imageType}>
              <RadioButton value={PUBLIC_IMAGES}><FormattedMessage {...IntlMessage.public} /></RadioButton>
              <RadioButton value={PRIVATE_IMAGES}><FormattedMessage {...IntlMessage.private} /></RadioButton>
              <RadioButton value={IMAGE_STORE}><FormattedMessage {...IntlMessage.imageStore} /></RadioButton>
            </RadioGroup>
          </span>
          <span >
            <CommonSearchInput
              value={searchValue}
              onChange={value => this.setState({ searchValue: value })}
              placeholder={intl.formatMessage(IntlMessage.imagePlaceholder)}
              size="large"
              style={{ width: 200 }}
              onSearch={() => imageType !== IMAGE_STORE ? this.loadImage() : this.loadImageStore()}
            />
          </span>
          <div className="page-box pageBox">
            <span className="total"><FormattedMessage {...IntlMessage.total} values={{ total }} /></span>
          </div>
        </div>
        <div style={{ clear: 'both' }}/>
        {this.renderImageTable()}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const register = DEFAULT_REGISTRY;
  const { entities, harbor: stateHarbor, appStore } = state;
  const { clusterID } = entities.current.cluster;
  const { harbor: harbors } = entities.current.cluster;
  const harbor = harbors && harbors[0]
  const { allProject } = stateHarbor;
  const { imagePublishRecord } = appStore;
  const { data: imageStoreList } = imagePublishRecord || { data: {} };
  return {
    clusterID,
    harbor,
    imageStoreList,
    images: allProject[register] || { isFetching: false, publicImages: [], privateImages: [] },
  };
};

export default connect(mapStateToProps, {
  loadAllProject: harborActions.loadAllProject,
  getAppsList: AppStoreActions.getAppsList,
})(injectIntl(ImagePart, { withRef: true }));
