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
import { parseCpuToNumber } from '../../../../../src/common/tools';
import { RESOURCES_DIY } from '../../../../../src/constants';
import merge from 'lodash/merge';

const APM_SERVICE_LABEL_KEY = 'system/apmService';
const TENX_SCHEMA_LBGROUP = 'system/lbgroup';
const TENX_SCHEMA_PORTNAME = 'tenxcloud.com/schemaPortname';
const PORT = 'port'; // 端口
const PORT_PROTOCOL = 'portProtocol'; // 端口协议(HTTP, TCP)
const MAPPING_PORTTYPE = 'mappingPortType'; // 映射服务端口类型(auto, special)

const MAPPING_PORT_AUTO = 'auto';

const MEMORY_ARRAY = [512, 1024, 2048, 4096, 8192];
const CPU_ARRAY = [
  {
    cpu: 0.2,
    limitsCpu: 1,
  },
  {
    cpu: 0.4,
    limitsCpu: 1,
  },
  {
    cpu: 0.8,
    limitsCpu: 1,
  },
  {
    cpu: 1,
    limitsCpu: 1,
  },
  {
    cpu: 2,
    limitsCpu: 2,
  },
];

const formatValues = values => {
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

/**
 * 判断是否为自定义配置
 *
 * @param {number} DIYMemory
 * @param {number} DIYCPU
 * @param {number} DIYMaxCPU
 * @return {boolean} is DIY
 */

const parseResourceIsDiy = (DIYMemory: number, DIYCPU, DIYMaxCPU): boolean => {
  if (!MEMORY_ARRAY.includes(DIYMemory)) {
    return true;
  }
  const memoryIndex = MEMORY_ARRAY.indexOf(DIYMemory);
  const matchCpuObj = CPU_ARRAY[memoryIndex];
  if (matchCpuObj.cpu !== DIYCPU || matchCpuObj.limitsCpu !== DIYMaxCPU) {
    return true;
  }
  return false;
};

const parseMemory = memory => {
  let newMemory = parseInt(memory, 10);
  if (memory.includes('Gi')) {
    newMemory *= 1024;
  }
  return newMemory;
};

/**
 * 解析资源配置
 *
 * @param containers
 * @return {object}
 */

const parseResource = containers => {
  const { resources } = containers;
  const { limits, requests } = resources;
  const { cpu: limitsCpu, memory: limitsMemory } = limits;
  const { cpu: requestsCpu, memory: requestsMemory } = requests;
  let resourceType: any;
  let DIYMemory: number = parseMemory(requestsMemory);
  let DIYCPU: number = parseCpuToNumber(requestsCpu);
  let DIYMaxMemory: number = parseMemory(limitsMemory);
  let DIYMaxCPU: number = parseCpuToNumber(limitsCpu);
  resourceType = DIYMemory;
  const result = parseResourceIsDiy(DIYMemory, DIYCPU, DIYMaxCPU);
  if (result) {
    resourceType = RESOURCES_DIY;
  }
  return {
    resourceType, // 容器配置
    DIYCPU, // 自定义配置-CPU
    DIYMaxCPU, // 自定义配置-最大CPU
    DIYMemory, // 自定义配置-内存
    DIYMaxMemory, // 自定义配置-最大内存
  };
};

const parseCommandArgs = containers => {
  const { args } = containers;
  let argsType = 'default';
  if (!args) {
    return { argsType };
  }
  argsType = 'DIY';
  const argsKeys = [];
  const argsParents = {};
  args.forEach((arg, index) => {
    argsKeys.push({
      value: index,
    });
    merge(argsParents, {
      [`args${index}`]: arg,
    });
  });

  return {
    argsType, // 启动命令类型 default | DIY
    argsKeys, // 命令keys
    ...argsParents, // 具体命令
  };
};

const parseTimeZone = constainer => {
  const { volumeMounts } = constainer;
  if (!volumeMounts) {
    return false;
  }
  const flag = volumeMounts.some(item => item.name === TENX_LOCAL_TIME_VOLUME.name);
  return flag;
};

const parseLogCollection = annotations => {
  const { applogs } = annotations;
  let sourceType = 'none';
  if (!applogs) {
    return { sourceType };
  }
  sourceType = 'directory';
  let logOpts = applogs.replace(/&#34;/g, '\"');
  logOpts = JSON.parse(logOpts);
  const { exregex, inregex, path } = logOpts[0];
  return {
    sourceType, // 日志采集-来源类型
    name, // 日志采集
    path, // 日志采集-日志目录
    inregex, // 日志采集-采集规则
    exregex, // 日志采集-排除规则
  };
};

/**
 * 解析模板详情中的 deployment
 *
 * @param deployment
 * @return {object}
 */

const parseDeployment = deployment => {
  const { metadata: outerMetadata, spec: outerSpec } = deployment;
  const { template, replicas } = outerSpec;
  const { spec: innerSpec, metadata: innerMetadata } = template;
  const { containers } = innerSpec;
  const { labels, annotations } = innerMetadata;
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
    ...parseResource(containers[0]),
    replicas, // 实例数量
    command: containers[0].command ? containers[0].command[0] : '', // 进入点
    ...parseCommandArgs(containers[0]),
    imagePullPolicy: containers[0].imagePullPolicy, // 重新部署时拉取镜像的方式(Always, IfNotPresent)
    timeZone: parseTimeZone(containers[0]), // 时区设置
    ...parseLogCollection(annotations),
  };
  return values;
};

/**
 * 解析映射端口
 *
 * @param annotations
 * @param spec
 */

const parseMappingPorts = (annotations, spec) => {
  const { ports } = spec;
  const portString = annotations[TENX_SCHEMA_PORTNAME];
  if (!portString) {
    return;
  }
  const portsArray = portString.includes(',') ? portString.split(',') : [portString];
  const portsKeys = [];
  const portsObjArray = portsArray.map((port, index) => {
    portsKeys.push({
      value: index,
    });
    const [name, protocol] = port.split('/');
    return {
      name,
      protocol,
    };
  });
  const newPorts = merge([], ports, portsObjArray);
  const portsParent = {};
  newPorts.forEach((port, index) => {
    merge(portsParent, {
      [`${PORT}${index}`]: port.port,
      [`${PORT_PROTOCOL}${index}`]: port.protocol,
    });
    if (port.protocol === 'TCP') {
      merge(portsParent, {
        [`${MAPPING_PORTTYPE}${index}`]: MAPPING_PORT_AUTO,
      });
    }
  });
  return {
    portsKeys, // 映射端口keys
    ...portsParent, // 端口以及协议
  };
};

/**
 * 解析模板详情中的 service
 * @param service
 * @return {object}
 */

const parseService = service => {
  const { metadata, spec } = service;
  const { annotations } = metadata;

  const values = {
    accessMethod: annotations[TENX_SCHEMA_LBGROUP], // 访问方式
    ...parseMappingPorts(annotations, spec),
  };
  return values;
};

/**
 * 解析模板详情
 *
 * @param templateDetail
 * @param chart
 * @return {object} 格式为form表单
 */

export const parseToFields = (templateDetail, chart) => {
  const { deployment, service } = templateDetail;
  const { name, version, description } = chart;
  const values = {
    templateName: name, // 模板名称
    templateVersion: version, // 模板版本
    templateDesc: description, // 模板描述
    ...parseDeployment(deployment),
    ...parseService(service),
  };
  return formatValues(values);
};
