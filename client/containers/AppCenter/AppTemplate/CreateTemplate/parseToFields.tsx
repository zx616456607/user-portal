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
import isEmpty from 'lodash/isEmpty';

const APM_SERVICE_LABEL_KEY = 'system/apmService';
const TENX_SCHEMA_LBGROUP = 'system/lbgroup';
const TENX_SCHEMA_PORTNAME = 'tenxcloud.com/schemaPortname';
const PORT = 'port'; // 端口
const PORT_PROTOCOL = 'portProtocol'; // 端口协议(HTTP, TCP)
const MAPPING_PORTTYPE = 'mappingPortType'; // 映射服务端口类型(auto, special)
const TEMPLATE_STORAGE = 'system/template'; // 模板存储
const NO_CLASSIFY = 'noClassify'; // 未分类配置组

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

/**
 * 转换为表单标准格式
 *
 * @param values
 */

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
 * 解析应用包
 * @param annotations
 */

const parseAppPkgID = annotations => {
  const { appPkgID } = annotations;
  if (!appPkgID) {
    return;
  }
  return { appPkgID };
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

/**
 * 内存格式转换
 *
 * @param memory
 * @return {number}
 */

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

/**
 * 启动命令
 *
 * @param containers
 */

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

/**
 * 时区
 *
 * @param constainer
 * @return {boolean}
 */

const parseTimeZone = constainer => {
  const { volumeMounts } = constainer;
  if (!volumeMounts) {
    return false;
  }
  const flag = volumeMounts.some(item => item.name === TENX_LOCAL_TIME_VOLUME.name);
  return flag;
};

/**
 * 日志采集
 *
 * @param annotations
 */

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
 * 格式化存储类型
 *
 * @param type
 * @return {string}
 */

const formatStorageType = type => {
  switch (type) {
    case 'ceph': return 'private';
    case 'nfs' : return 'share';
    case 'host' : return 'host';
    default: return '未知';
  }
};

/**
 * 解析存储
 *
 * @param annotations
 */

const parseStorage = annotations => {
  let serviceType: boolean = false;
  if (!annotations[TEMPLATE_STORAGE]) {
    return { serviceType };
  }
  serviceType = true;
  let storageOpts = annotations[TEMPLATE_STORAGE].replace(/&#34;/g, '\"');
  storageOpts = JSON.parse(storageOpts);
  let storageParent = {};
  const storageList: object[] = [];
  storageOpts.forEach(item => {
    const sourceType = item.name.split('-')[0];
    let type: string = formatStorageType(sourceType);

    storageList.push({
      ...item,
      volume: 'create',
      size: parseInt(item.storage, 10),
      type,
    });
  });
  return {
    serviceType, // 服务状态
    storageList, // 存储的配置列表
  };
};

/**
 * 解析高可用
 *
 * @param containers
 */

const parseLiveness = containers => {
  const { livenessProbe } = containers;
  let livenessProtocol: tring = 'none';
  if (!livenessProbe) {
    return { livenessProtocol };
  }
  const { initialDelaySeconds, timeoutSeconds, periodSeconds } = livenessProbe;
  let agreement: object;
  if (livenessProbe.httpGet) {
    livenessProtocol = 'HTTP';
    agreement = livenessProbe.httpGet;
  } else {
    livenessProtocol = 'TCP';
    agreement = livenessProbe.tcpSocket;
  }
  const { path, port } = agreement;
  return {
    livenessProtocol, // 高可用类型
    livenessPort: port, // 端口
    livenessPath: path, // 路径
    livenessInitialDelaySeconds: initialDelaySeconds, // 检查延时
    livenessTimeoutSeconds: timeoutSeconds, // 检查超时
    livenessPeriodSeconds: periodSeconds, // 检查间隔
  };
};

const parseConfigMap = (containers, volumes, annotations) => {
  const { volumeMounts } = containers;
  const wholeDir = annotations.wholeDir;
  let parseIsWholeDir: any;
  if (wholeDir) {
    parseIsWholeDir = wholeDir.replace(/&#34;/g, '\"');
    parseIsWholeDir = JSON.parse(parseIsWholeDir);
  }
  const mergeVolumes = merge([], volumeMounts, volumes);
  const configMapKeys: number[] = [];
  const secretConfigMapKeys: number[] = [];
  let configId = 0;
  let secretId = 0;
  if (isEmpty(mergeVolumes)) {
    return;
  }
  const configParent: object = {};
  mergeVolumes.forEach((item) => {
    const { name, mountPath, subPath, configMap } = item;
    const { name: innerName, items } = configMap || { name: '', items: [] };
    let configMapIsWholeDir: boolean = false;
    if (parseIsWholeDir) {
      configMapIsWholeDir = parseIsWholeDir[name];
    }
    if (item.name.includes('configmap')) {
      let classifyName = item.name.split('/')[0];
      let configMountPath: string = mountPath;
      const configMapSubPathValues: string[] = [];
      items.forEach(sub => {
        configMapSubPathValues.push(sub.key);
      });
      if (classifyName === NO_CLASSIFY) {
        classifyName = '未分类配置组';
      }
      let configGroupName: string[] = [classifyName, innerName];
      configMapKeys.push({
        value: ++ configId,
      });
      if (!configMapIsWholeDir) {
        const mountPathArray = mountPath.split('/');
        mountPathArray.pop();
        configMountPath = mountPathArray.join('/');
        // configMapSubPathValues.push(subPath);
      }
      merge(configParent, {
        [`configMapMountPath${configId}`]: configMountPath,
        [`configMapIsWholeDir${configId}`]: configMapIsWholeDir,
        [`configGroupName${configId}`]: configGroupName,
        [`configMapSubPathValues${configId}`]: configMapSubPathValues,
      });
    } else {
      secretConfigMapKeys.push({
        value: ++ secretId,
      });
    }
  });

  return {
    configMapKeys,
    secretConfigMapKeys,
    ...configParent,
  };
};

/**
 * 解析环境变量
 *
 * @param containers
 */

const parseAdvancedEnv = containers => {
  const { env } = containers;
  if (!env) {
    return;
  }
  const envKeys: number[] = [];
  const envParent: object = {};
  env.forEach((item, index) => {
    let envValue: string;
    if (item.value) {
      envValue = item.value;
    } else {
      const { name, key } = item.valueFrom.secretKeyRef;
      envValue = [name, key];
    }
    merge(envParent, {
      [`envName${index}`]: item.name,
      [`envValueType${index}`]: item.valueFrom ? 'secret' : 'normal',
      [`envValue${index}`]: envValue,
    });
    envKeys.push({
      value: index,
    });
  });

  return {
    envKeys,
    ...envParent,
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
  const { containers, volumes } = innerSpec;
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
    ...parseAppPkgID(annotations), // 应用包
    apm: labels[APM_SERVICE_LABEL_KEY] === 'pinpoint', // 是否开通 APM
    ...parseResource(containers[0]),
    replicas, // 实例数量
    command: containers[0].command ? containers[0].command[0] : '', // 进入点
    ...parseCommandArgs(containers[0]),
    imagePullPolicy: containers[0].imagePullPolicy, // 重新部署时拉取镜像的方式(Always, IfNotPresent)
    timeZone: parseTimeZone(containers[0]), // 时区设置
    ...parseLogCollection(annotations), // 日志
    ...parseStorage(annotations), // 存储
    ...parseLiveness(containers[0]), // 高可用
    ...parseConfigMap(containers[0], volumes, annotations), // 配置管理
    ...parseAdvancedEnv(containers[0]), // 环境变量
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
  if (!annotations || !annotations[TENX_SCHEMA_PORTNAME]) {
    return;
  }
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
  const { annotations, labels } = metadata;

  const values = {
    accessMethod: annotations && annotations[TENX_SCHEMA_LBGROUP] || 'none', // 访问方式
    originalName: labels.name, // 服务的原始名称
    ...parseMappingPorts(annotations, spec),
  };
  return values;
};

const parseIngress = ingress => {
  let accessType = 'netExport';
  if (!ingress) {
    return { accessType };
  }
  accessType = 'loadBalance';
  let loadBalance: string;
  let lbKeys: Array = [];
  let ingressParent: object = {};
  ingress.forEach((item, index) => {
    const {
      controllerInfo, displayName, lbAlgorithm, sessionSticky,
      sessionPersistent, protocol, items, path, healthCheck,
    } = item;
    if (!loadBalance) {
      loadBalance = controllerInfo.name;
    }
    lbKeys.push(index);
    const [ host, ...path ] = path.split('/');
    const hostValue = isEmpty(path[0]) ? host : host + '/' + path.join('/');
    const ingressOptions = {
      host: hostValue,
      lbAlgorithm,
      displayName,
      port: items[0].servicePort,
    };
    if (sessionSticky) {
      merge(ingressOptions, {
        sessionSticky,
        sessionPersistent: parseInt(sessionPersistent, 10),
      });
    }
    if (healthCheck) {
      merge(ingressOptions, {
        healthCheck,
      });
    }
    merge(ingressParent, {
      [`displayName-${index}`]: displayName, // 监听器名称
      [`lbAlgorithm-${index}`]: lbAlgorithm, // 调度算法
      [`sessionPersistent-${index}`]: sessionSticky ? `已启用(${sessionPersistent}s)` : '未启用', // 会话保持
      [`sessionSticky-${index}`]: sessionSticky, // 会话保持是否开启
      [`protocol-${index}`]: protocol, // 监听协议
      [`port-${index}`]: items[0].servicePort, // 服务端口
      [`host-${index}`]: hostValue, // 转发规则
      [`ingress-${index}`]: ingressOptions,
    });
  });
  return {
    accessType, // 是否为负载均衡
    loadBalance, // 负载均衡器名称
    lbKeys, // 负载均衡器监听的端口组
    ...ingressParent,
  };
};

/**
 * 解析模板详情
 *
 * @param templateDetail
 * @param chart
 * @return {object} 格式为form表单
 */

export const parseToFields = (templateDetail, chart) => {
  const { deployment, service, ingress } = templateDetail;
  const { name, version, description } = chart;
  const values = {
    templateName: name, // 模板名称
    templateVersion: version, // 模板版本
    templateDesc: description, // 模板描述
    ...parseDeployment(deployment),
    ...parseService(service),
    ...parseIngress(ingress),
  };
  return formatValues(values);
};
