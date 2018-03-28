/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Parse template detail to fields
 *
 * 2018-03-27
 * @author Zhangxuan
 */

import constants from '../../../../../constants';
const TENX_LOCAL_TIME_VOLUME = constants.TENX_LOCAL_TIME_VOLUME;
const K8S_NODE_SELECTOR_KEY = constants.K8S_NODE_SELECTOR_KEY;
const APM_SERVICE_LABEL_KEY = 'system/apmService';

export const formatValues = values => {
  const newValues = {};
  for (let [key, value] of Object.entries(values)) {
    Object.assign(newValues, {
      [key]: {
        name: key,
        value,
      },
    });
  }
  return newValues;
};

export const parseDeployment = deployment => {
  const { metadata: outerMetadata, spec: outerSpec } = deployment;
  const { template } = outerSpec;
  const { spec: innerSpec, metadata: innerMetadata } = template;
  const { containers } = innerSpec;
  const { labels } = innerMetadata;
  const imageArray = containers[0].image.split(':');
  let imageUrl: string = imageArray[0];
  let imageTag: string = imageArray[1];
  if (imageArray.length > 2) {
    imageUrl = imageArray[1].split('//')[1];
    imageTag = imageArray[2];
  }
  const values = {
    serviceName: outerMetadata.name, // 服务名称
    imageUrl, // 镜像地址
    imageTag, // 镜像版本
    apm: labels[APM_SERVICE_LABEL_KEY] === 'pinpoint', // 是否开通 APM
    // resourceType,
  };
  return values;
};

export const parseToFields = (templateDetail, chart) => {
  const { deployment, service } = templateDetail;
  const { name, version, description } = chart;
  const values = {
    templateName: name, // 模板名称
    templateVersion: version, // 模板版本
    templateDesc: description, // 模板描述
    ...parseDeployment(deployment),
  };
  return formatValues(values);
};
