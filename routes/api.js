/**
 * API handler for user portal
 *
 * v0.1 - 2016-09-22
 *
 * @author Zhangpc
 */

'use strict';

const middlewares = require('../services/middlewares')
const volumeController = require('../controllers/volume')
const appController = require('../controllers/app_manage')
const serviceController = require('../controllers/service_manage')
const containerController = require('../controllers/container')
const configController = require('../controllers/configs')
const secretsController = require('../controllers/secrets')
const registryController = require('../controllers/registry')
const harborController = require('../controllers/registry_harbor')
const metricsController = require('../controllers/metrics')
const databaseCacheController = require('../controllers/database_cache')
const appTemplateController = require('../controllers/app_template')
const manageMonitorController = require('../controllers/manage_monitor')
const userController = require('../controllers/user_manage')
const teamController = require('../controllers/team_manage')
const overviewTeamController = require('../controllers/overview_team')
const overviewClusterController = require('../controllers/overview_cluster')
const overviewSpaceController = require('../controllers/overview_space')
const tokenController = require('../controllers/token')
const devopsController = require('../controllers/devops')
const licenseController = require('../controllers/license')
const clusterController = require('../controllers/cluster_manage')
const integrationController = require('../controllers/integration')
const consumptionController = require('../controllers/consumption')
const clusternodesController = require('../controllers/cluster_node')
const versionsController = require('../controllers/versions')
const chargeController = require('../controllers/charge')
const globalConfigController = require('../controllers/global_config')
const imageScanController = require('../controllers/image_scan')
const alertController = require('../controllers/alert')
const labelController = require('../controllers/labels')
const ldapController = require('../controllers/ldap_manage')
const oemController = require('../controllers/oem_info')
const projectController = require('../controllers/project')
const permissionController = require('../controllers/permission')
const roleController = require('../controllers/role')
const pkgController = require('../controllers/wrap_manage')
const vmWrapController = require('../controllers/wm_wrap')
const netIsolationController = require('../controllers/network_isolation')
const tenantController = require('../controllers/tenant_manage')
const apmController = require('../controllers/apm')
const storageController = require('../controllers/storage_manage')
const quotaController = require('../controllers/quota')
const cleanController = require('../controllers/clean')
const appStoreController = require('../controllers/app_store')
const loadBalanceController = require('../controllers/load_balance')
const helmTemplateController = require('../controllers/template')
const autoScalerController = require('../controllers/autoscaler')
const schedulerController = require('../controllers/scheduler')
const aiopsController = require('../controllers/aiops')
const resourcequota = require('../controllers/resourcequota') // 申请资源配额相关
const dnsRecordController = require('../controllers/dns_record')
const securityGroupController = require('../controllers/security_group')
const middlewareCenter = require('../controllers/middleware_center')
const servicemesh = require('../controllers/service_mesh')
const ipPoolController = require('../controllers/ipPool')
const containerSecurityPolicy = require('../controllers/container_security_policy')
const workerOrderController = require('../controllers/worker_order')
const rcIntegrationController = require('../controllers/right_cloud/integration')
const statefulSet = require('../controllers/stateful_set')
const sysServiceManage = require('../controllers/sys_service_manage')

module.exports = function (Router) {
  const router = new Router({
    prefix: '/api/v2'
  })
  router.use(middlewares.auth)

  // Storage
  router.get('/storage-pools/:pool/:cluster/volumes', volumeController.getVolumeListByPool)
  router.post('/storage-pools/:pool/:cluster/volumes/batch-delete', volumeController.deleteVolume)
  router.post('/storage-pools/:cluster/volumes', volumeController.createVolume)
  router.get('/clusters/:cluster/volumes/:volumeName/check-exist', volumeController.getCheckVolumeNameExist)
  router.put('/storage-pools/:pool/:cluster/volumes/format', volumeController.formateVolume)
  router.put('/storage-pools/:pool/:cluster/volumes/size', volumeController.resizeVolume)
  router.get('/clusters/:cluster/volumes/:name/consumption', volumeController.getVolumeDetail)
  //router.post('/storage-pools/:pool/:cluster/volumes/:name/beforeimport', volumeController.beforeUploadFile)
  //router.post('/storage-pools/:pool/:cluster/volumes/:name/import', volumeController.uploadFile)
  router.get('/storage-pools/:pool/:cluster/volumes/:name/filehistory', volumeController.getFileHistory)
  router.get('/clusters/:cluster/volumes/:name/bindinfo', volumeController.getBindInfo)
  // router.get('/storage-pools/:pool/:cluster/volumes/:name/exportfile', volumeController.exportFile)
  router.get('/storage-pools/:cluster/volumes/available', volumeController.getAvailableVolume)
  router.get('/storage-pools/:cluster/volumes/pool-status', volumeController.getPoolStatus)
  router.get('/storage-pools/:cluster/volumes/snapshots', volumeController.listSnapshots)
  router.post('/storage-pools/:cluster/volumes/snapshots/batch-delete', volumeController.deleteSnapshot)
  router.post('/storage-pools/:cluster/volumes/:name/snapshots', volumeController.createSnapshot)
  router.post('/storage-pools/:cluster/volumes/:name/snapshots/rollback', volumeController.rollbackSnapshot)
  router.post('/storage-pools/:cluster/volumes/:name/snapshots/clone', volumeController.cloneSnapshot)
  router.get('/storage-pools/:cluster/volumes/calamari-url', volumeController.getCalamariUrl)
  router.post('/storage-pools/:cluster/volumes/calamari-url', volumeController.setCalamariUrl)
  // project
  router.post('/projects', projectController.createProject)
  router.post('/projects/batch-delete', projectController.deleteProjects)
  router.get('/projects/:name/detail', projectController.getProjectDetail)
  router.get('/projects/list', projectController.listProjects)
  router.get('/projects/list-statistics', projectController.listProjectsAndStatistics)
  router.get('/projects/list-visible', projectController.listVisibleProjects)
  router.put('/projects/:name', projectController.updateProject)
  router.get('/projects/:name/check-exists', projectController.checkProjectNameExists)
  router.get('/projects/:name/name-exists', projectController.checkDisplayNameExists)
  router.get('/projects/check-manager', projectController.checkProjectManager)
  router.get('/projects/:name/clusters', projectController.getProjectAllClusters)
  router.get('/projects/:name/visible-clusters', projectController.getProjectVsibleClusters)
  router.get('/projects/approval-clusters', projectController.getProjectApprovalClusters)
  router.put('/projects/:name/clusters', projectController.updateProjectClusters)
  router.put('/projects/clusters', projectController.updateProjectApprovalClusters)
  router.get('/projects/members', projectController.getProjectMembers)
  router.get('/projects/:name/users', projectController.getProjectRelatedUsers)
  router.post('/projects/:name/users', projectController.addProjectRelatedUsers)
  router.post('/projects/:name/users/batch-delete', projectController.deleteProjectRelatedUsers)
  router.put('/projects/:name/users', projectController.updateProjectRelatedUsers)
  router.get('/projects/:name/roles', projectController.getProjectRelatedRoles)
  router.put('/projects/:name/roles', projectController.updateProjectRelatedRoles)
  router.post('/projects/:name/roles/batch-delete', projectController.deleteProjectRelatedRoles)
  router.del('/projects/:project_id/users/:user_id', projectController.removeUserFromProject)
  router.post('/projects/rolebinding', projectController.handleRoleBinding)
  router.get('/projects/plugins/enabled', projectController.getPluginStatus)
  router.put('/projects/plugins/:name/enable', projectController.pluginTurnOn)
  router.put('/projects/plugins/:name/disable',projectController.pluginTurnOff)
  router.get('/projects/plugins/installed',projectController.checkPluginInstallStatus)
  // servicMesh 相关
  router.put('/servicemesh/clusters/:clusterId/paas/status', servicemesh.updateToggleServiceMesh)
  router.get('/servicemesh/clusters/:clusterId/paas/status', servicemesh.getCheckProInClusMesh)
  router.get('/projects/istio/check', servicemesh.getCheckClusterIstio)
  router.put('/servicemesh/clusters/:clusterId/paas/services/:name/status', servicemesh.putToggleAPPMesh)
  router.get('/servicemesh/clusters/:clusterId/paas/pods', servicemesh.getCheckAPPInClusMesh)
  router.get('/servicemesh/clusters/:clusterId/paas/services', servicemesh.getServiceListServiceMeshStatus)
  router.get('/servicemesh/clusters/:clusterId/ingressgateway', servicemesh.getServiceMeshPortList)
  router.get('/servicemesh/clusters/:clusterId/ingressgateway/:hashedName', servicemesh.getServiceMeshPort)
  router.post('/servicemesh/clusters/:clusterId/ingressgateway', servicemesh.createServiceMeshPort)
  router.put('/servicemesh/clusters/:clusterId/ingressgateway/:hashedName', servicemesh.updateServiceMeshPort)
  router.del('/servicemesh/clusters/:clusterId/ingressgateway/:hashedName', servicemesh.deleteServiceMeshPort)
  router.get('/servicemesh/clusters/:clusterId/nodes', servicemesh.getServiceMeshClusterNode)

  // Clusters
  router.get('/clusters', clusterController.getClusters)
  router.get('/clusters/:cluster', clusterController.getClusterDetail)
  router.post('/clusters', clusterController.createCluster)
  router.post('/clusters/add/kubeconfig', clusterController.createClusterByKubeConfig)
  router.post('/clusters/add/autocreate', clusterController.autoCreateCluster)
  router.post('/clusters/add/autocreate/node', clusterController.autoCreateNode)
  router.get('/clusters/add/autocreate/error/:cluster', clusterController.getFailedClusterData)
  router.get('/clusters/add/autocreate/restart/:cluster', clusterController.restartFailedCluster)
  router.post('/clusters/add/autocreate/hostinfo', clusterController.checkHostInfo)
  router.put('/clusters/:cluster', clusterController.updateCluster)
  router.put('/clusters/:cluster/configs', clusterController.updateConfigs)
  router.del('/clusters/:cluster', clusterController.deleteCluster)
  router.get('/clusters/:cluster/summary', clusterController.getClusterSummary)
  router.get('/clusters/:cluster/kubeproxy', clusterController.getKubeproxy)
  router.put('/clusters/:cluster/kubeproxy', clusterController.updateKubeproxy)
  router.put('/clusters/:cluster/configs/harbor', clusterController.setHarbor)
  router.put('/clusters/:cluster/daas/dubbo/services', clusterController.getRegisteredServiceList)

  // For bind node when create service(lite only)
  router.get('/clusters/:cluster/nodes', clusterController.getNodes)
  router.get('/clusters/:cluster/nodes/ingresses', clusterController.getNodesIngresses)
  router.get('/clusters/add-cluster-cmd', clusterController.getAddClusterCMD)
  router.get('/clusters/:cluster/proxies', clusterController.getProxy)
  router.put('/clusters/:cluster/proxies', clusterController.updateProxies)
  router.put('/clusters/:cluster/proxies/:groupID', clusterController.updateProxy)
  router.put('/clusters/:cluster/proxies/:groupID/as_default', clusterController.setDefaultProxy)
  router.get('/clusters/:cluster/node_addr', clusterController.getClusterNodeAddr)
  router.get('/clusters/:cluster/plugins', clusterController.getClusterPlugins)
  router.put('/clusters/:cluster/plugins/:name', clusterController.updateClusterPlugins)
  router.get('/clusters/:cluster/network', clusterController.getClusterNetworkMode)
  router.put('/clusters/:cluster/plugins/operation/stop', clusterController.batchStopPlugins)
  router.put('/clusters/:cluster/plugins/operation/start', clusterController.batchStartPlugins)
  router.post('/clusters/:cluster/plugins/:name/init', clusterController.initPlugins)
  router.delete('/clusters/:cluster/plugins', clusterController.batchDeletePlugins)
  router.post('/clusters/:cluster/plugins', clusterController.createPlugins)
  router.get('/clusters/:cluster/nodes/:name/drain/preliminary', clusterController.getNodeDetail)
  router.put('/clusters/:cluster/nodes/:name/drain', clusterController.nodeMaintain)
  router.put('/clusters/:cluster/nodes/:name/uncordon', clusterController.exitMaintain)
  router.get('/clusters/:cluster/nodes/:name/drain/podmetric', clusterController.getNotMigratedCount)

  // Apps
  router.post('/clusters/:cluster/apps', appController.createApp)
  router.post('/clusters/:cluster/apps/ai', appController.createApp)
  router.post('/clusters/:cluster/plugins', appController.createPlugin)
  router.put('/clusters/:cluster/apps/:app_name/desc', appController.updateAppDesc)
  router.get('/clusters/:cluster/apps', appController.getApps)
  router.get('/clusters/:cluster/apps/ai', appController.getApps)
  router.post('/clusters/:cluster/apps/batch-delete', appController.deleteApps)
  router.put('/clusters/:cluster/apps/batch-stop', appController.stopApps)
  router.put('/clusters/:cluster/apps/batch-start', appController.startApps)
  router.put('/clusters/:cluster/apps/batch-restart', appController.restartApps)
  router.put('/clusters/:cluster/apps/batch-status', appController.getAppsStatus)
  router.get('/clusters/:cluster/apps/:app_name/services', appController.getAppServices) // 炎黄
  router.post('/clusters/:cluster/apps/:app_name/services', appController.addService)
  router.get('/clusters/:cluster/apps/:app_name/orchfile', appController.getAppOrchfile)
  router.get('/clusters/:cluster/apps/:app_name/detail', appController.getAppDetail) // spi
  router.get('/clusters/:cluster/apps/:app_name/logs', appController.getAppLogs)
  router.get('/clusters/:cluster/apps/:app_name/existence', appController.checkAppName)
  router.get('/clusters/:cluster/services/:service/existence', serviceController.checkServiceName)
  router.put('/clusters/:cluster/services/:service/lbgroups/:groupID', serviceController.setServiceProxyGroup)
  router.patch('/clusters/:cluster/native/:type/:name', serviceController.updateServiceConfigGroup)

  // AppTemplates
  router.get('/templates', appTemplateController.listTemplates)
  router.get('/templates/:templateid', appTemplateController.getTemplate)
  router.post('/templates', appTemplateController.createTemplate)
  router.delete('/templates/:templateid', appTemplateController.deleteTemplate)
  router.put('/templates/:templateid', appTemplateController.updateTemplate)

  // Helm templates
  router.put('/templates/helm/clusters/:cluster', helmTemplateController.createTemplate)
  router.get('/templates/helm', helmTemplateController.getTemplateList)
  router.del('/templates/helm/:name/versions/:version', helmTemplateController.deleteTemplate)
  router.get('/templates/helm/:name/versions/:version', helmTemplateController.getTemplateDetail)
  router.get('/templates/helm/:name/versions/:version/clusters/:cluster', helmTemplateController.deployTemplateCheck)
  router.post('/templates/helm/:name/versions/:version/clusters/:cluster', helmTemplateController.deployTemplate)
  router.get('/templates/helm/:name', helmTemplateController.templateNameCheck)
  router.get('/templates/helm/prepare/clusters/:cluster', helmTemplateController.checkHelmIsPrepare)
  router.get('/templates/helm/prepare/chart_repo', helmTemplateController.checkChartRepoIsPrepare)

  // Services
  router.put('/clusters/:cluster/services/batch-start', serviceController.startServices)
  router.put('/clusters/:cluster/services/batch-stop', serviceController.stopServices)
  router.put('/clusters/:cluster/services/batch-restart', serviceController.restartServices)
  router.put('/clusters/:cluster/services/batch-quickrestart', serviceController.quickRestartServices)
  router.post('/clusters/:cluster/services/batch-delete', serviceController.deleteServices)
  router.get('/clusters/:cluster/services/batch-status', serviceController.getServicesStatus)
  router.get('/clusters/:cluster/services/:service_name/detail', serviceController.getServiceDetail)
  router.put('/clusters/:cluster/services/:service_name/volume', serviceController.putEditServiceVolume)
  router.get('/clusters/:cluster/services/:service_name/containers', serviceController.getServiceContainers)
  router.put('/clusters/:cluster/services/:service_name/env', serviceController.updateServiceContainers)
  router.put('/clusters/:cluster/services/:service_name/manualscale', serviceController.manualScaleService)
  router.get('/clusters/:cluster/services/:service_name/autoscale', serviceController.getServiceAutoScale)
  router.get('/clusters/:cluster/services/autoscale', serviceController.getServiceAutoScaleList)
  router.put('/clusters/:cluster/services/:service_name/autoscale', serviceController.autoScaleService)
  router.del('/clusters/:cluster/services/:service_name/autoscale', serviceController.delServiceAutoScale)
  router.put('/clusters/:cluster/services/:service_name/quota', serviceController.changeServiceQuota)
  router.put('/clusters/:cluster/services/:service_name/ha', serviceController.changeServiceHa)
  router.put('/clusters/:cluster/services/:service_name/rollingupdate', serviceController.rollingUpdateService)
  router.put('/clusters/:cluster/services/:service_name/rollbackupdate', serviceController.rollbackUpdateService)
  router.get('/clusters/:cluster/replicaset/:service_name/events', serviceController.getReplicasetDetailEvents)
  router.get('/clusters/:cluster/dbservice/:service_name/events', serviceController.getDbServiceDetailEvents)
  router.get('/clusters/:cluster/service/:service_name/pods/events', serviceController.getPodsEventByServicementName)
  router.post('/clusters/:cluster/services/:service_name/logs', serviceController.getServiceLogs)
  router.get('/clusters/:cluster/services/:service_name/k8s-service', serviceController.getK8sService)
  router.get('/clusters/:cluster/services', serviceController.getAllService) // 炎黄
  router.put('/clusters/:cluster/services/:service_name/portinfo', serviceController.updateServicePortInfo)
  router.get('/clusters/:cluster/services/:service_name/certificates', serviceController.getCertificate)
  router.put('/clusters/:cluster/services/:service_name/certificates', serviceController.updateCertificate)
  router.delete('/clusters/:cluster/services/:service_name/certificates', serviceController.deleteCertificate)
  router.put('/clusters/:cluster/services/:service_name/tls', serviceController.toggleHTTPs)
  router.get('/clusters/:cluster/apps/:appName/topology-services', serviceController.serviceTopology)
  router.get('/clusters/:cluster/apps/:appName/topology-pods', serviceController.podTopology)
  router.put('/clusters/:cluster/services/autoscale/status', serviceController.batchUpdateAutoscaleStatus)
  router.get('/clusters/:cluster/services/:service_name/autoscale/logs', serviceController.getAutoScaleLogs)

  router.post('/clusters/:cluster/services/autoscale/existence', serviceController.checkAutoScaleNameExist)
  router.put('/clusters/:cluster/services/:service/annotation', serviceController.updateAnnotation)
  router.put('/clusters/:cluster/services/:service/host', serviceController.updateHostConfig)
  router.get('/clusters/:cluster/services/isPodIpExisted/:ip', serviceController.getISIpPodExisted)

  // Users
  router.get('/users/:user_id', userController.getUserDetail)
  router.get('/users/:user_id/app_info', userController.getUserAppInfo)
  router.get('/users', userController.getUsers)
  router.get('/users/:user_id/teams', userController.getUserTeams)
  //router.get('/users/:user_id/teamspaces', userController.getUserTeamspaces)
  //router.get('/users/:user_id/teamspaces/detail', userController.getUserTeamspacesWithDetail)
  router.post('/users', userController.createUser)
  router.delete('/users/:user_id', userController.deleteUser)
  router.post('/users/batch-delete', userController.batchDeleteUser)
  router.patch('/users/:user_id', userController.updateUser)
  router.get('/users/:user_name/existence', userController.checkUserName)
  router.get('/users/:user_id/projects', userController.getUserProjects)
  router.get('/users/:user_id/user_teams', userController.getUserTeamsNew)
  router.put('/users/:user_id/teams', userController.updateTeamsUserBelongTo)
  router.put('/users/:user_id/:active', userController.updateUserActive)
  router.get('/users/softdeleted', userController.getSoftdeletedUsers)
  router.get('/users/search', userController.getUsersExclude)
  router.post('/users/:user_id/:scope/:scopeID/roles', userController.bindRolesForUser)
  router.post('/users/:user_id/teamtransfer', userController.teamtransfer)
  // Teams
  //router.get('/teams/:team_id/spaces', teamController.getTeamspaces)
  router.get('/teams/:team_id/clusters', teamController.getTeamClusters)
  router.get('/teams/:team_id/clusters/all', teamController.getAllClusters)
  router.get('/teams/:team_id/users', teamController.getTeamUsers)
  router.get('/teams/:team_id', teamController.getTeamDetail)
  router.post('/teams', teamController.createTeam)
  router.delete('/teams/:team_id', teamController.deleteTeam)
  //router.post('/teams/:team_id/spaces', teamController.createTeamspace)
  router.post('/teams/:team_id/users', teamController.addTeamusers)
  //To remove multiple users, seperate the user ids with ",".
  router.delete('/teams/:team_id/users/:user_ids', teamController.removeTeamusers)
  //router.delete('/teams/:team_id/spaces/:space_id', teamController.deleteTeamspace)
  router.put('/teams/:team_id/clusters/:cluster_id/request', teamController.requestTeamCluster)
  router.get('/teams/:team_name/existence', teamController.checkTeamName)
  //router.get('/teams/:team_id/spaces/:space_name/existence', teamController.checkSpaceName)
  router.patch('/teams/:team_id', teamController.updateTeam)

  //Overview Team
  router.get('/overview/teaminfo', overviewTeamController.getTeamOverview)
  router.get('/overview/teamdetail', overviewTeamController.getTeamDetail)
  router.get('/overview/teamoperations', overviewTeamController.getTeamOperations)

  //Overview Cluster
  router.get('/overview/privilege', overviewClusterController.getPrivilege)
  router.get('/overview/clusterinfo/clusters/:cluster_id', overviewClusterController.getClusterOverview)
  router.get('/overview/clusterinfo-std/clusters/:cluster_id', overviewClusterController.getStdClusterOverview)
  router.get('/overview/clusters/:cluster_id/operations', overviewClusterController.getClusterOperations)
  router.get('/overview/clusters/:cluster_id/sysinfo', overviewClusterController.getClusterSysinfo)
  //router.get('/overview/clusters/:cluster_id/storage', overviewClusterController.getClusterStorage)
  router.get('/overview/clusters/:cluster_id/appstatus', overviewClusterController.getClusterAppStatus)
  router.get('/overview/clusters/:cluster_id/dbservices', overviewClusterController.getClusterDbServices)
  router.get('/overview/clusters/:cluster_id/nodesummary', overviewClusterController.getClusterNodeSummary)
  router.get('/overview/clusters/:cluster_id/summary', overviewClusterController.getClusterSummary)
  router.get('/overview/clusters/:cluster_id/volumestats', overviewClusterController.getClusterStats)

  //Overview Space
  router.get('/overview/spaceinfo', overviewSpaceController.getSpaceOverview)
  router.get('/overview/operations', overviewSpaceController.getSpaceOperations)
  router.get('/overview/templates', overviewSpaceController.getSpaceTemplateStats)
  router.get('/overview/warnings', overviewSpaceController.getSpaceWarnings)

  // spi
  router.post('/clusters/:cluster/services/:service_name/binddomain', serviceController.bindServiceDomain)
  router.put('/clusters/:cluster/services/:service_name/binddomain', serviceController.deleteServiceDomain)
  // Containers
  router.get('/clusters/:cluster/containers', containerController.getContainers)
  router.get('/clusters/:cluster/containers/:container_name/detail', containerController.getContainerDetail)
  router.get('/clusters/:cluster/containers/:container_name/events', containerController.getContainerDetailEvents)
  router.post('/clusters/:cluster/containers/:name/logs', containerController.getContainerLogs)
  router.post('/clusters/:cluster/containers/batch-delete', containerController.deleteContainers)
  router.get('/clusters/:cluster/containers/:name/process', containerController.getProcess)
  router.post('/clusters/:cluster/containers/:name/export', containerController.exportContainers)
  router.get('/clusters/:cluster/nodes/podcidr',  containerController.getPodNetworkSegment)
  // Configs
  router.get('/clusters/:cluster/configgroups', configController.listConfigGroups)
  router.get('/clusters/:cluster/configgroups/:name', configController.getConfigGroupName)
  router.get('/clusters/:cluster/configgroups/:group/configs/:name', configController.loadConfigFiles)
  router.post('/clusters/:cluster/configs', configController.createConfigGroup)
  router.post('/clusters/:cluster/configgroups/:group/configs/:name', configController.createConfigFiles)
  router.put('/clusters/:cluster/configgroups/:group/configs/:name', configController.updateConfigFile)
  router.post('/clusters/:cluster/configs/delete', configController.deleteConfigGroup)
  router.post('/clusters/:cluster/configgroups/:group/configs-batch-delete', configController.deleteConfigFiles)
  router.put('/clusters/:cluster/configgroups/:name', configController.updateConfigAnnotations)
  router.get('/clusters/:cluster/configgroups/:name/verify', configController.checkConfigGroupName)

  // configs by devops
  router.get('/devops/configmaps/clusters/:cluster_id', devopsController.getConfigMaps)
  router.post('/devops/configmaps/clusters/:cluster_id', devopsController.createConfigMaps)
  router.del('/devops/configmaps/clusters/:cluster_id', devopsController.delConfigMap)
  router.put('/devops/configmaps/:configmap_name/clusters/:cluster_id', devopsController.setConfigLabels)
  router.post('/devops/configmaps/:configmap_name/clusters/:cluster_id/configs', devopsController.createConfig)
  router.get('/devops/configmaps/:configmap_name/clusters/:cluster_id/configs/:config_name', devopsController.getConfig)
  router.del('/devops/configmaps/:configmap_name/clusters/:cluster_id/configs/:config_name', devopsController.delConfig)
  router.put('/devops/configmaps/:configmap_name/clusters/:cluster_id/configs/:config_name', devopsController.updateConfig)
  router.get('/devops/managed-projects/:project_id/branches', devopsController.getGitProjectsBranches)
  router.get('/devops/projects/:project_id/branches/:branch_name/path/:path_name/files', devopsController.getGitProjectsFileContent)
  // router.get('/devops/projects/:project_id/branches/:branch_name/files', devopsController.getGitProjectsFileContent)

  // Secrets by devops
  router.get('/devops/secrets/clusters/:cluster_id', devopsController.getSecrets)
  router.post('/devops/secrets/clusters/:cluster_id', devopsController.createSecrets)
  router.del('/devops/secrets/clusters/:cluster_id', devopsController.delSecret)
  router.post('/devops/secrets/:secret_name/clusters/:cluster_id/configs', devopsController.createSecretsConfig)
  router.get('/devops/secrets/:secret_name/clusters/:cluster_id/configs/:config_name', devopsController.getSecretsConfig)
  router.del('/devops/secrets/:secret_name/clusters/:cluster_id/configs/:config_name', devopsController.delSecretsConfig)
  router.put('/devops/secrets/:secret_name/clusters/:cluster_id/configs/:config_name', devopsController.updateSecretsConfig)


  // Secrets config
  router.post('/clusters/:clusterID/secrets/:groupName', secretsController.createGroup)
  router.del('/clusters/:clusterID/secrets/:groupName', secretsController.removeGroup)
  router.get('/clusters/:clusterID/secrets/', secretsController.getGroups)
  router.post('/clusters/:clusterID/secrets/:groupName/entries', secretsController.addKeyIntoGroup)
  router.put('/clusters/:clusterID/secrets/:groupName/entries', secretsController.updateKeyIntoGroup)
  router.del('/clusters/:clusterID/secrets/:groupName/entries/:key', secretsController.removeKeyFromGroup)
  // Harbor integration
  router.get('/registries/:registry/users/current', harborController.getCurrentUserCtl)
  router.get('/registries/:registry/projects', harborController.getProjects)
  router.get('/registries/:registry/projects/search', harborController.searchProjects)

  router.del('/registries/:registry/repositories/:user/:name/tags', harborController.deleteRepository)
  router.del('/registries/:registry/repositories/:user/:name/tags/:tags', harborController.deleteRepoTags)
  router.get('/registries/:registry/repositories/:user/:name/tags', harborController.getRepositoriesTags)
  router.put('/registries/:registry/repositories/:user/:name/maxtag', harborController.setRepositoriesMaxTag)
  router.post('/registries/:registry/repositories/:user/:name/tags/:tagname/labels', harborController.setRepositoriesTagLabel)
  router.del('/registries/:registry/repositories/:user/:name/tags/:tagname/labels/:id', harborController.delRepositoriesTagLabel)
  router.get('/registries/:registry/repositories/:user/:name/tags/:tag/configinfo', harborController.getRepositoriyConfig)

  router.post('/registries/:registry/projects', harborController.createProject)
  router.get('/registries/:registry/projects/:project_id', harborController.getProjectDetail)
  router.put('/registries/:registry/projects/:project_id', harborController.updateProject)
  router.del('/registries/:registry/projects/:project_id', harborController.deleteProject)
  router.put('/registries/:registry/projects/:project_id/publicity', harborController.updateProjectPublicity)
  router.get('/registries/:registry/projects/:project_id/members', harborController.getProjectMembers)
  router.post('/registries/:registry/projects/:project_id/members', harborController.addProjectMember)
  router.put('/registries/:registry/projects/:project_id/members/:user_id', harborController.updateProjectMember)
  router.del('/registries/:registry/projects/:project_id/members/:user_id', harborController.deleteProjectMember)
  router.get('/registries/:registry/repositories', harborController.getProjectRepositories)
  router.get('/registries/:registry/repositories/:name', harborController.getRepository)
  router.put('/registries/:registry/repositories/:name', harborController.updateRepository)

  router.get('/registries/:registry/logs', harborController.getLogs)
  router.get('/registries/:registry/projects/:projectID/logs', harborController.getProjectLogs)
  router.get('/registries/:registry/systeminfo', harborController.getSystemInfo)
  router.get('/registries/:registry/systeminfo/volumes', harborController.getSystemInfoVolumes)
  router.get('/registries/:registry/systeminfo/cert', harborController.getSystemInfoCert)
  router.get('/registries/:registry/configurations', harborController.getConfigurations)
  router.put('/registries/:registry/configurations', harborController.updateConfigurations)
  router.post('/registries/:registry/configurations/reset', harborController.resetConfigurations)

  router.post('/registries/:registry/replications', harborController.copyReplications)
  router.put('/registries/:registry/jobs/replication', harborController.updateReplicationJobs)
  router.get('/registries/:registry/jobs/replication', harborController.getReplicationJobs)
  router.delete('/registries/:registry/jobs/replication/:id', harborController.deleteReplicationJob)
  router.get('/registries/:registry/jobs/replication/:id/log', harborController.getReplicationJobLogs)
  router.get('/registries/:registry/policies/replication', harborController.getReplicationPolicies)
  router.post('/registries/:registry/policies/replication', harborController.newReplicationPolicy)
  router.get('/registries/:registry/policies/replication/:id', harborController.getReplicationPolicy)
  router.delete('/registries/:registry/policies/replication/:id', harborController.deleteReplicationPolicy)
  router.put('/registries/:registry/policies/replication/:id', harborController.modifyReplicationPolicy)
  router.put('/registries/:registry/policies/replication/:id/enablement', harborController.enableReplicationPolicy)
  router.get('/registries/:registry/targets', harborController.getReplicationTargets)
  router.post('/registries/:registry/targets', harborController.newReplicationTarget)
  router.post('/registries/:registry/targets/ping', harborController.pingReplicationTarget)
  router.post('/registries/:registry/targets/:id/ping', harborController.pingReplicationTargetByID)
  router.put('/registries/:registry/targets/:id', harborController.modifyReplicationTarget)
  router.get('/registries/:registry/targets/:id', harborController.getReplicationTarget)
  router.delete('/registries/:registry/targets/:id', harborController.deleteReplicationTarget)
  router.get('/registries/:registry/targets/:id/policies', harborController.getReplicationTargetRelatedPolicies)
  router.get('/registries/:registry/projects/:id/replication/summary', harborController.getReplicationSummary)
  router.get('/registries/:registry/label', harborController.getLabels)
  router.put('/registries/:registry/label', harborController.updateLabel)
  router.del('/registries/:registry/label/:id', harborController.deleteLabel)
  router.post('/registries/:registry/label', harborController.createLabel)
  router.post('/registries/:registry/images/label', harborController.setImageLabel)

  router.get('/registries/:registry/statistics', harborController.getStatistics)
  router.get('/registries/:registry/template', harborController.getImageTemplate)

  // Registries of TenxCloud
  router.get('/registries/:registry', registryController.getImages)
  router.get('/registries/:registry/:user/:name/detailInfo', registryController.getImageInfo)
  router.get('/registries/:registry/:user/:name', registryController.checkImage)
  router.get('/registries/:registry/:user/:name/tags', registryController.getImageTags)
  router.get('/registries/:registry/:user/:name/tags/:tag/configs', registryController.getImageConfigs)
  router.get('/registries/:registry/private', registryController.getPrivateImages)
  router.get('/registries/:registry/favourite', registryController.getFavouriteImages)
  router.put('/registries/:registry/:image*', registryController.updateImageInfo)
  // router.delete('/registries/:registry/:image*', registryController.deleteImage)
  // router.get('/registries/:registry/stats', registryController.queryServerStats)

  // Private docker registry integration
  router.get('/docker-registry', registryController.getPrivateRegistries)
  router.post('/docker-registry/:name', registryController.addPrivateRegistry)
  router.del('/docker-registry/:id', registryController.deletePrivateRegistry)
  // Docker registry spec API
  router.get('/docker-registry/:id/images', registryController.specListRepositories)
  router.get('/docker-registry/:id/images/:image*/tags', registryController.specGetImageTags)
  router.get('/docker-registry/:id/images/:image*/tags/:tag', registryController.specGetImageTagInfo)
  router.get('/docker-registry/:id/images/search', registryController.searchDockerImages)
  router.get('/docker-registry/:id/namespaces', registryController.getDockerHubNamespaces)
  // spi for tenxcloud hub
  router.get('/tenx-hubs', registryController.isTenxCloudHubConfigured)
  router.post('/tenx-hubs', registryController.addTenxCloudHub)
  router.delete('/tenx-hubs', registryController.removeTenxCloudHub)
  // Tag size is merged to specGetImageTagConfig
  //router.get('/docker-registry/:id/images/:image*/tags/:tag/size', registryController.specGetImageTagSize)

  // Metrics
  router.get('/clusters/:cluster/containers/:container_name/metrics', metricsController.getContainerMetrics)
  router.get('/clusters/:cluster/containers/:container_name/getAllmetrics', metricsController.getAllContainerMetrics)
  router.get('/clusters/:cluster/services/:service_name/metrics', metricsController.getServiceMetrics)
  router.get('/clusters/:cluster/services/:service_name/getAllMetrics', metricsController.getAllServiceMetrics)
  router.get('/clusters/:cluster/apps/:app_name/metrics', metricsController.getAppMetrics)
  router.get('/clusters/:cluster/apps/:app_name/getAllMetrics', metricsController.getAllAppMetrics)
  // router.get('/clusters/:cluster/apps/:app_name/getAllMetrics', metricsController.getAppAllMetrics)

  // Manage Monitor
  router.get('/audits/menus', manageMonitorController.getOperationalTargetFilters)
  router.post('/manage-monitor/getOperationAuditLog', manageMonitorController.getOperationAuditLog)
  router.get('/manage-monitor/:project_name/:namespace/getClusterOfQueryLog', manageMonitorController.getClusterOfQueryLog)
  router.get('/manage-monitor/:cluster_id/:namespace/getServiceOfQueryLog', manageMonitorController.getServiceOfQueryLog)
  router.post('/clusters/:cluster/instances/:instances/getSearchLog', manageMonitorController.getSearchLog)
  router.post('/clusters/:cluster/services/:services/getSearchLog', manageMonitorController.getServiceSearchLog)
  router.get('/clusters/:cluster/services/:services/dumpSearchLog', manageMonitorController.dumpServiceSearchLog)
  router.get('/clusters/:cluster/instances/:instances/dumpSearchLog', manageMonitorController.dumpInstancesSearchLog)
  router.post('/clusters/:cluster/logs/instances/:instances/logfiles', manageMonitorController.getServiceLogfiles)
  router.get('/clusters/:cluster/metric/panels', manageMonitorController.getPanelList)
  router.get('/clusters/:cluster/metric/panels/:name/check', manageMonitorController.checkPanelName)
  router.post('/clusters/:cluster/metric/panels', manageMonitorController.createPanel)
  router.put('/clusters/:cluster/metric/panels/:panelID', manageMonitorController.updatePanel)
  router.post('/clusters/:cluster/metric/panels/batch-delete', manageMonitorController.deletePanel)
  router.get('/clusters/:cluster/metric/charts', manageMonitorController.getChartList)
  router.get('/clusters/:cluster/metric/charts/:name/check', manageMonitorController.checkChartName)
  router.post('/clusters/:cluster/metric/charts', manageMonitorController.createCharts)
  router.put('/clusters/:cluster/metric/charts/:id', manageMonitorController.updateCharts)
  router.post('/clusters/:cluster/metric/charts/batch-delete', manageMonitorController.deleteCharts)
  router.get('/clusters/:cluster/metric/monitor', manageMonitorController.getMetrics)
  router.get('/clusters/:cluster/proxies/:id/services', manageMonitorController.getProxiesServices)
  router.get('/clusters/:cluster/metric/nexport/:lbgroup/service/:services/metrics', manageMonitorController.getMonitorMetrics)

  // DevOps service: CI/CD
  router.get('/devops/stats', devopsController.getStats)
  // github repo config
  router.post('/repos/:type', devopsController.githubConfig)
  // get github list
  router.put('/repos/:type/auth', devopsController.githubList)
  // Repos
  router.get('/devops/repos/supported', devopsController.getSupportedRepository)
  router.post('/devops/repos/:type', devopsController.registerRepo)
  router.get('/devops/repos/:type', devopsController.listRepository)
  router.put('/devops/repos/:type', devopsController.syncRepository)
  router.delete('/devops/repos/:type', devopsController.removeRepository)
  router.get('/devops/repos/:type/branches', devopsController.listBranches)
  router.get('/devops/repos/:type/tags', devopsController.listTags)
  router.get('/devops/repos/:type/branches_tags', devopsController.listBranchesAndTags)
  router.get('/devops/repos/:type/user', devopsController.getUserInfo)
  // Auth with 3rdparty SCM and callback
  router.get('/devops/repos/:type/auth', devopsController.getAuthRedirectUrl);
  router.get('/devops/repos/:type/auth-callback', devopsController.doUserAuthorization)

  // Managed projects
  router.post('/devops/managed-projects', devopsController.addManagedProject)
  router.get('/devops/managed-projects', devopsController.listManagedProject)
  router.delete('/devops/managed-projects/:project_id', devopsController.removeManagedProject)
  router.get('/devops/managed-projects/:project_id/branches_tags', devopsController.getManagedProject, devopsController.listBranchesAndTags)
  // CI flows
  router.post('/devops/ci-flows', devopsController.createCIFlows)
  router.get('/devops/ci-flows', devopsController.listCIFlows)
  router.get('/devops/ci-flows/:flow_id', devopsController.getCIFlow)
  router.get('/devops/ci-flows/:flow_id/yaml', devopsController.getCIFlowYAML)
  router.put('/devops/ci-flows/:flow_id', devopsController.updateCIFlow)
  router.delete('/devops/ci-flows/:flow_id', devopsController.removeCIFlow)
  router.get('/devops/ci-flows/:flow_id/images', devopsController.getImagesOfFlow)
  router.get('/devops/ci-flows/:flow_id/deployment-logs', devopsController.listDeploymentLogsOfFlow)
  router.put('/devops/ci-flow-builds/:flow_build_id/stages/:stage_id/approval', devopsController.updateApproval)

  // CI flow stages
  router.get('/devops/ci-flows/:flow_id/stages', devopsController.listFlowStages)
  router.post('/devops/ci-flows/:flow_id/stages', devopsController.createFlowStages)
  router.delete('/devops/ci-flows/:flow_id/stages/:stage_id', devopsController.deleteFlowStage)
  router.put('/devops/ci-flows/:flow_id/stages/:stage_id', devopsController.updateFlowStage)
  router.get('/ci-flows/:flow_id/stages/:stage_id', devopsController.getStage)
  router.get('/devops/ci-flows/:flow_id/stages/:stage_id/getStageBuildLogs', devopsController.getStageBuildLogList)
  router.put('/devops/ci-flows/:flow_id/stages/:stage_id/link/:target_id', devopsController.updateStageLink)

  // CD rules
  router.post('/devops/ci-flows/:flow_id/cd-rules', devopsController.createCDRule)
  router.get('/devops/ci-flows/:flow_id/cd-rules', devopsController.listCDRules)
  router.delete('/devops/ci-flows/:flow_id/cd-rules/:rule_id', devopsController.removeCDRule)
  router.put('/devops/ci-flows/:flow_id/cd-rules/:rule_id', devopsController.updateCDRule)
  router.get('/devops/cd-rules/type/:type', devopsController.getDeploymentOrAppCDRule)
  router.delete('/devops/cd-rules/type/:type', devopsController.deleteDeploymentOrAppCDRule)

  // CI rules
  router.get('/devops/ci-flows/:flow_id/ci-rules', devopsController.getCIRule)
  router.put('/devops/ci-flows/:flow_id/ci-rules', devopsController.updateCIRule)

  // Flow build
  router.post('/devops/ci-flows/:flow_id/builds', devopsController.createFlowBuild)
  router.get('/devops/ci-flows/:flow_id/builds', devopsController.listBuilds)
  router.get('/devops/ci-flows/:flow_id/builds/:flow_build_id', devopsController.getFlowBuild)
  router.put('/devops/ci-flows/:flow_id/stages/:stage_id/builds/:build_id/stop', devopsController.stopBuild)
  router.get('/devops/ci-flows/:flow_id/getBuildLogs', devopsController.getBuildLog)
  router.get('/devops/ci-flows/:flow_id/getLastBuildLogs', devopsController.getLastBuildLog)
  router.get('/devops/ci-flows/:flow_id/stages/:stage_id/builds/:stage_build_id', devopsController.getFlowStageBuildLog)
  router.get('/devops/ci-flows/:flow_id/stages/:stage_id/builds/:stage_build_id/events', devopsController.getFlowStageBuildEvents)

  // CI Dockerfile
  router.get('/devops/dockerfiles', devopsController.listDockerfiles)
  router.post('/devops/ci-flows/:flow_id/stages/:stage_id/dockerfile', devopsController.addDockerfile)
  router.get('/devops/ci-flows/:flow_id/stages/:stage_id/dockerfile', devopsController.getDockerfile)
  router.delete('/devops/ci-flows/:flow_id/stages/:stage_id/dockerfile', devopsController.removeDockerfile)
  router.put('/devops/ci-flows/:flow_id/stages/:stage_id/dockerfile', devopsController.updateDockerfile)
  router.post('/devops/ci-scripts', devopsController.createScripts)
  router.get('/devops/ci-scripts/:scripts_id', devopsController.getScriptsById)
  router.put('/devops/ci-scripts/:scripts_id', devopsController.updateScriptsById)
  // Available CI images
  router.get('/devops/ci/images', devopsController.getAvailableImages)

  // BaseImage
  router.post('/devops/ci/images', devopsController.addBaseImage)
  router.put('/devops/ci/images/:id', devopsController.updateBaseImage)
  router.delete('/devops/ci/images/:id', devopsController.deleteBaseImage)
  // Cached volumes
  router.get('/devops/cached-volumes', devopsController.listCachedVolumes)
  router.del('/devops/cached-volumes/:pvcName', devopsController.delCachedVolume)

  // Petsets - DB service APIs
  router.post('/clusters/:cluster/dbservices', databaseCacheController.createNewDBService)
  router.delete('/clusters/:cluster/dbservices/:name', databaseCacheController.deleteDBServiceZkEs)
  router.delete('/clusters/:cluster/daas/:type/:name', databaseCacheController.deleteDBService)
  // 获取各种数据库的数量
  router.get('/clusters/:clusterID/daas/count', databaseCacheController.getDbCount)
  // zookeeper 和 es集群请求集群列表
  router.get('/clusters/:cluster/dbservices', databaseCacheController.dbClusterList)
  // Filter by type
  router.get('/clusters/:cluster/daas/:type', databaseCacheController.listDBService)
  router.get('/clusters/:cluster/dbservices/:name', databaseCacheController.getDBServiceDetail)
  router.get('/clusters/:cluster/daas/:type/:name', databaseCacheController.getDBService)
  router.patch('/clusters/:cluster/dbservices/:name', databaseCacheController.scaleDBService)
  // 检查集群名是否存在
  router.get('/clusters/:cluster/daas/:name/check/exist', databaseCacheController.checkClusterName)
  // 获取高级配置
  router.get('/clusters/:cluster/daas/:type/:name/config', databaseCacheController.getAdvanceConfig)
  // 创建配置
  router.post('/clusters/:cluster/daas/:type/:name/config', databaseCacheController.createClusterConfig)
  // 更新配置
  router.put('/clusters/:cluster/daas/:type/:name/config', databaseCacheController.updateClusterConfig)
  // 获取默认配置
  router.get('/clusters/:cluster/daas/:type/config/default', databaseCacheController.getDefaultConfig)
  // 创建MySQL集群密码
  router.post('/clusters/:clusterID/daas/:type/:name/secret', databaseCacheController.createClusterPwd)
  // 修改MySQL集群密码
  router.put('/clusters/:clusterID/daas/:type/:name/secret', databaseCacheController.updateClusterPwd)
  // 查看MySQL集群密码
  router.get('/clusters/:clusterID/daas/:type/:name/secret', databaseCacheController.getClusterPwd)
  // 创建集群
  router.post('/clusters/:clusterID/daas/:type', databaseCacheController.createDatabaseCluster)
  // 修改集群
  router.put('/clusters/:clusterID/daas/:type/:name', databaseCacheController.updateDatabaseCluster)
  // 获取备份链
  router.get('/clusters/:clusterID/daas/:type/:name/backups', databaseCacheController.getBackupChain)
  // 创建手动备份
  router.post('/clusters/:clusterID/daas/:type/:name/backups', databaseCacheController.manualBackup)
  // 删除手动备份
  router.delete('/clusters/:clusterID/daas/:type/:clusterName/backups/:name', databaseCacheController.deleteManualBackup)
  // 检查radosgw地址配置情况
  router.get('/clusters/:clusterID/storageclass/:storagecluster/radosgw', databaseCacheController.checkRadosgwStatus)
  // 检查是否有自动备份
  router.get('/clusters/:clusterID/daas/:type/:name/cronbackups', databaseCacheController.checkAutoBackupExist)
  // 设置自动备份
  router.post('/clusters/:clusterID/daas/:type/:name/cronbackups', databaseCacheController.setAutoBackup)
  // 修改自动备份
  router.put('/clusters/:clusterID/daas/:type/:name/cronbackups', databaseCacheController.updateAutoBackup)
  // 删除自动备份
  router.delete('/clusters/:clusterID/daas/:type/:clusterName/cronbackups', databaseCacheController.deleteAutoBackup)
  // 创建扩容
  router.post('/clusters/:clusterID/daas/:type/:name/expands', databaseCacheController.expandDatabaseCluster)
  // 回滚
  router.post('/clusters/:clusterID/daas/:type/:name/restores', databaseCacheController.rollback)
  // 修改集群访问方式
  router.put('/clusters/:clusterID/daas/:type/:name/service', databaseCacheController.updateAccessMethod)
  // 获取事件
  router.get('/clusters/:clusterID/daas/:type/:name/events', serviceController.getDatabaseEvents)
  // 重启集群
  router.put('/clusters/:clusterID/daas/:type/:name/reboot', databaseCacheController.rebootCluster)
  // 获取回滚记录
  router.get('/clusters/:clusterID/daas/:type/:name/restores', databaseCacheController.getRollbackRecord)
  // 获取访问方式（rabbitmq）
  router.get('/clusters/:clusterID/daas/:type/:name/service', databaseCacheController.getVisitType)
  // 修改访问方式（rabbitmq）
  router.put('/clusters/:clusterID/daas/:type/:name/service', databaseCacheController.updateVisitType)
  // Integration
  router.get('/integrations/getAllIntegration', integrationController.getAllIntegrations)
  router.post('/integrations/createIntegration', integrationController.createIntegrations)
  router.delete('/integrations/deleteIntegrations/:id', integrationController.deleteIntegrations)
  router.get('/integrations/getIntegrationDateCenter/:id', integrationController.getIntegrationDateCenter)
  router.get('/integrations/getIntegrationVmList/:id', integrationController.getIntegrationVmList)
  router.post('/integrations/manageIntegrationsVmDetail/:id', integrationController.manageIntegrationsVmDetail)
  router.get('/integrations/getCreateVmConfig/:id', integrationController.getCreateVmConfig)
  router.post('/integrations/createIntegrationVm/:id', integrationController.createIntegrationVm)
  router.get('/integrations/getIntegrationPods/:id', integrationController.getIntegrationPods)
  router.get('/integrations/getIntegrationConfig/:id', integrationController.getIntegrationConfig)
  router.put('/integrations/updateIntegrationConfig/:id', integrationController.updateIntegrationConfig)
  router.post('/integrations/ceph', integrationController.createCehp)
  router.put('/integrations/ceph/:id', integrationController.updateCeph)
  router.get('/integrations/ceph/:id', integrationController.getCephDetail)

  // Cluster pod
  router.get('/cluster-nodes/:cluster', clusternodesController.getClusterNodes)
  router.get('/cluster-nodes/:cluster/metrics', clusternodesController.getClusterNodesMetric)
  router.get('/cluster-nodes/:cluster/nodes/resource-consumption', clusternodesController.getResourceConsumption)
  router.post('/cluster-nodes/:cluster/node/:node', clusternodesController.changeNodeSchedule)
  router.delete('/cluster-nodes/:cluster/node/:node', clusternodesController.deleteNode)
  router.get('/cluster-nodes/:cluster/add-node-cmd', clusternodesController.getAddNodeCMD)
  // Get kubectl pods names
  router.get('/cluster-nodes/:cluster/kubectls', clusternodesController.getKubectls)
  router.get('/cluster-nodes/:cluster/:node/podlist', clusternodesController.getPodlist)
  // get host detail info
  router.get('/cluster-nodes/:cluster/:node/info', clusternodesController.getClustersInfo)
  router.get('/cluster-nodes/:cluster/:node/metrics', clusternodesController.getClustersMetrics)
  router.get('/cluster-nodes/:cluster/:node/instant', clusternodesController.getClustersInstant)
  router.get('/cluster-nodes/:cluster/label-summary', clusternodesController.getLabelSummary)
  router.get('/cluster-nodes/:cluster/:node/metrics/:type', clusternodesController.getClustersTypeMetrics)
  router.get('/cluster-nodes/:cluster/:node/panel/metrics', clusternodesController.loadClustersTypeMetrics)

  // manipulate node's labels
  router.get('/cluster-nodes/:cluster/:node/labels', clusternodesController.getNodeLabels)
  router.put('/cluster-nodes/:cluster/:node/labels', clusternodesController.updateNodeLabels)
  router.post('/cluster-nodes/:cluster/:node/affectedpods', clusternodesController.getAffectedPods)

  // Token info
  router.get('/token', tokenController.getTokenInfo)
  router.get('/jwt-auth', tokenController.authJWT)

  // Licenses
  router.get('/licenses', licenseController.getLicenses)
  router.get('/clusters/:cluster/licenses', licenseController.getLicensesByCluster)

  // consumption and charge
  router.get('/consumptions/detail', consumptionController.getDetail)
  router.get('/consumptions/trend', consumptionController.getTrend)
  router.get('/consumptions/summary', consumptionController.getSummaryInDay)
  router.get('/consumptions/charge-history', consumptionController.getChargeRecord)
  router.get('/consumptions/notify-rule', consumptionController.getNotifyRule)
  router.put('/consumptions/notify-rule', consumptionController.setNotifyRule)

  // Versions
  router.get('/versions/check', versionsController.checkVersion)

  // Charge
  router.post('/charge/user', chargeController.chargeUser)
  //router.post('/charge/teamspace', chargeController.chargeTeamspace)
  router.post('/charge/project', chargeController.chargeProject)

  //setting
  router.post('/cluster/:cluster/type/:type/config', globalConfigController.changeGlobalConfig)
  router.put('/cluster/:cluster/type/:type/config', globalConfigController.changeGlobalConfig)
  router.get('/cluster/:cluster/config', globalConfigController.getGlobalConfig)
  router.post('/type/:type/isvalidconfig', globalConfigController.isValidConfig)
  router.post('/configs/email/verification', globalConfigController.sendVerification)
  router.get('/cluster/:cluster/config/:type', globalConfigController.getGlobalConfigByType)
  router.post('/configs/message/isvalidconfig', globalConfigController.validateMsgConfig)
  router.get('/configs/message/isvalidUrlConfig', globalConfigController.validateMsgUrlConfig)

  //image scan
  router.get('/images/scan-status', imageScanController.getScanStatus)
  router.get('/images/layer-info', imageScanController.getLayerInfo)
  router.get('/images/lyins-info', imageScanController.getLyins)
  router.get('/images/clair-info', imageScanController.getClair)
  router.post('/images/scan', imageScanController.scan)
  router.post('/images/scan-rule', imageScanController.uploadFile)

  // alert
  router.get('/cluster/:cluster/alerts/record-filters', alertController.getResourceRecordFilters)
  router.get('/cluster/:cluster/alerts/service-records/query', alertController.getLogRecordFilters)
  router.get('/cluster/:cluster/alerts/records', alertController.getRecords)
  router.delete('/cluster/:cluster/alerts/records', alertController.deleteRecords)
  router.post('/cluster/:cluster/alerts/groups', alertController.createNotifyGroup)
  router.put('/cluster/:cluster/alerts/groups/:groupid', alertController.modifyNotifyGroup)
  router.get('/cluster/:cluster/alerts/groups', alertController.listNotifyGroups)
  router.post('/cluster/:cluster/alerts/groups/batch-delete', alertController.batchDeleteNotifyGroups)
  router.post('/email/invitations', alertController.sendInvitation)
  router.get('/email/invitations/status', alertController.checkEmailAcceptInvitation)
  router.post('/cluster/:cluster/alerts/service-records', alertController.getLogRecord)

  router.get('/cluster/:cluster/alerts/setting', alertController.getAlertSetting)
  router.get('/cluster/:cluster/alerts/:strategyName/existence', alertController.checkExist)
  router.get('/cluster/:cluster/alerts/logsalert/:strategyName/existence', alertController.checkLogExist) // 判断该告警规则是否存在
  router.post('/cluster/:cluster/alerts/setting', alertController.addAlertSetting)
  router.post('/clusters/:cluster/alerts/logsalert', alertController.addAlertRegularSetting) // 增加告警规则
  router.put('/cluster/:cluster/alerts/setting/:strategyID', alertController.modifyAlertSetting)
  router.get('/cluster/:cluster/alerts/setting/list', alertController.getSettingList)
  router.get('/clusters/:cluster/alerts/setting/logsalert', alertController.getSettingLogList) // 增加告警正则
  router.get('/cluster/:cluster/alerts/group-strategies', alertController.getSettingListfromserviceorapp)
  router.delete('/cluster/:cluster/alerts/setting', alertController.deleteSetting)
  router.delete('/clusters/:cluster/alerts/logsalert/:name', alertController.deleteRegularSetting) // 删除告警规则
  router.post('/cluster/:cluster/alerts/setting/batch-enable', alertController.batchEnable)
  router.post('/cluster/:cluster/alerts/setting/batch-disable', alertController.batchDisable)
  router.get('/clusters/:cluster/alerts/logsalert/:rulename/status', alertController.batchToggleRegular) // 开启/关闭告警规则
  router.post('/cluster/:cluster/alerts/setting/batch-enable-email', alertController.batchEnableEmail)
  router.post('/cluster/:cluster/alerts/setting/batch-disable-email', alertController.batchDisableEmail)
  router.post('/cluster/:cluster/alerts/setting/batch-ignore', alertController.setIgnore)
  router.get('/cluster/:cluster/alerts/type/:type/setting/:name/instant', alertController.getTargetInstant)
  router.delete('/cluster/:cluster/alerts/rule', alertController.deleteRule)
  router.get('/clusters/:cluster/alerts/logsalert/checkplugin',alertController.getLogAlertPluginStatus)

  // user defined labels
  router.get('/labels', labelController.getLabels)
  router.post('/labels', labelController.addLabels)
  router.put('/labels/:id', labelController.updateLabel)
  router.delete('/labels/:id', labelController.deleteLabel)

  // Ldap
  router.get('/configs/ldap', ldapController.getLdap)
  router.post('/configs/ldap', ldapController.upsertLdap)
  router.post('/user-directory/ldap', ldapController.syncLdap)
  router.delete('/user-directory/ldap', ldapController.removeLdap)

  // oem info
  router.put('/oem/info', oemController.updateText)
  router.put('/oem/logo', oemController.updateLogo)
  router.put('/oem/info/default', oemController.restoreDefaultInfo)
  router.put('/oem/logo/default', oemController.restoreDefaultLogo)
  router.put('/oem/color/default', oemController.restoreDefaultColor)

  // tenant
  router.get('/tenant/overview', tenantController.getTenantOverview)

  //permission
  router.get('/permission', permissionController.list)
  router.get('/permission/:id/retrieve', permissionController.get)
  router.get('/permission/withCount', permissionController.listWithCount)
  router.get('/permission/:id/dependent', permissionController.getAllDependent)
  router.get('/permission/resource-operations', permissionController.listResourceOperations)
  router.get('/permission/access-controls', permissionController.getAccessControlsOfRole)
  router.post('/permission/access-controls', permissionController.setAccessControlsForRole)
  router.delete('/permission/access-controls/:ruleIds', permissionController.removeAccessControlsFromRole)
  router.get('/permission/access-controls/overview', permissionController.overview)

  //role
  router.post('/role', roleController.create)
  router.delete('/role/:id', roleController.remove)
  router.put('/role/:id', roleController.update)
  router.post('/role/:id/addPermission', roleController.addPermission)
  router.post('/role/:id/removePermission', roleController.removePermission)
  router.get('/role/:id', roleController.get)
  router.get('/role', roleController.list)
  router.get('/allRoles', roleController.allRoles)
  router.get('/role/:name/existence', roleController.existence)
  router.get('/role/:id/allowUpdate', roleController.allowUpdate)
  router.post('/role/:roleID/:scope/:scopeID', roleController.usersAddRoles)
  router.post('/role/:roleID/:scope/:scopeID/batch-delete', roleController.usersLoseRoles)
  router.post('/role/projects/:projectName/roles/batch-delete', roleController.removeProjectRole)
  router.get('/role/:roleID/:scope/:scopeID/users', roleController.roleWithMembers)
  router.get('/role/:roleID/projects', roleController.getProjectDetail)

  // package manage
  router.get('/pkg', pkgController.getPkgManageList)
  router.get('/pkg/:filename/:filetype/versions', pkgController.getVersions)
  router.get('/pkg/:id', pkgController.downloadPkg)
  router.post('/pkg/batch-delete', pkgController.deletePkg)
  router.post('/pkg/local', pkgController.localUploadPkg)
  router.post('/pkg/remote', pkgController.romoteUploadPkg)
  router.post('/pkg/:id/audit', pkgController.auditPkg)
  router.post('/pkg/:id/publish', pkgController.publishPkg)
  router.put('/pkg/publish/:id/pass', pkgController.passPkgPublish)
  router.put('/pkg/publish/:id/refuse', pkgController.refusePkgPublish)
  router.put('/pkg/store/:id/status', pkgController.offShelfPkg)
  router.get('/pkg/publish', pkgController.getPkgPublishList)
  router.get('/pkg/store', pkgController.getPkgStoreList)
  router.get('/pkg/group', pkgController.getPkgGroupList)
  router.post('/pkg/icon', pkgController.uploadPkgIcon)
  router.get('/pkg/icon/:id', pkgController.getPkgIcon)
  router.get('/pkg/:id/detail', pkgController.getPkgDetail)
  router.put('/pkg/:id/detail', pkgController.updatePkgDetail)
  router.post('/pkg/:id/docs', pkgController.uploadDocs)
  router.post('/pkg/:id/docs/batch-delete', pkgController.deleteDocs)
  router.get('/pkg/:id/docs/download', pkgController.downloadDocs)
  router.put('/pkg/group/update', pkgController.updatePkgGroup)
  router.get('/pkg/group/detail', pkgController.getPkgGroupDetailList)
  router.post('/pkg/:id/remote', pkgController.remotePkg)
  router.post('/pkg/:id/local', pkgController.localUploadPkg2)

  // VM wrap
  router.post('/vm-wrap/services', vmWrapController.createService)
  router.post('/vm-wrap/services/import', vmWrapController.importService)
  router.get('/vm-wrap/services', vmWrapController.listServices)
  router.put('/vm-wrap/services/:service_id', vmWrapController.updateService)
  router.post('/vm-wrap/services/:service_id/deployment', vmWrapController.deployService)
  router.del('/vm-wrap/services/:service_id', vmWrapController.deleteService)
  router.post('/vm-wrap/vminfos', vmWrapController.addVM)
  router.get('/vm-wrap/vminfos', vmWrapController.listVMs)
  router.put('/vm-wrap/vminfos/:vm_id', vmWrapController.updateVM)
  router.del('/vm-wrap/vminfos/:vm_id', vmWrapController.deleteVM)
  router.post('/vm-wrap/vminfos-check/', vmWrapController.checkVM)
  router.get('/vm-wrap/vminfos/:vminfo/exists', vmWrapController.checkVminfo)
  router.get('/vm-wrap/services/:serviceName/exists', vmWrapController.checkService)
  router.get('/vmtomcats/list', vmWrapController.listVMTomcat)
  router.del('/vmtomcats/:id/delete', vmWrapController.deleteTomcat)
  router.post('/vmtomcats/create', vmWrapController.createTomcat)
  router.get('/jdks/list', vmWrapController.listVMJdks)
  router.get('/tomcats/list', vmWrapController.listVMTomcatVersions)


  // Network Isolation
  router.get('/cluster/:clusterID/networkpolicy/default-deny', netIsolationController.getCurrentSetting)
  router.post('/cluster/:clusterID/networkpolicy/default-deny', netIsolationController.setIsolationRule)
  router.delete('/cluster/:clusterID/networkpolicy/default-deny', netIsolationController.restoreDefault)
  router.post('/cluster/:clusterID/networkpolicy/bypass-namespace-internal', netIsolationController.setEachConnect)
  router.get('/cluster/:clusterID/networkpolicy/references', netIsolationController.getServiceReferences)

  // Apms
  router.get('/clusters/:clusterID/apms', apmController.getApms)

  // cluster Storage
  router.get('/clusters/:cluster/storageclass', storageController.getClusterStorageList)
  router.post('/clusters/:cluster/storageclass', storageController.postCreateCephStorage)
  router.put('/clusters/:cluster/storageclass', storageController.putUpdateCephStorage)
  router.del('/clusters/:cluster/storageclass/:name', storageController.postDeleteCephStorage)
  router.get('/clusters/:cluster/storageclass/type', storageController.getStorageClassType)
  router.put('/clusters/:cluster/storageclass/setdefault', storageController.setStorageClassDefault)

  //Quota
  router.get('/clusters/:cluster/resourcequota', quotaController.clusterList)
  router.put('/clusters/:cluster/resourcequota', quotaController.clusterPut)
  router.get('/clusters/:cluster/resourcequota/inuse', quotaController.clusterGet)
  router.get('/resourcequota', quotaController.get)
  router.put('/resourcequota', quotaController.update)
  router.get('/resourcequota/inuse', quotaController.list)
  router.get('/devops/resourcequota/inuse', devopsController.checkResourceDevopsquotaExist)
  router.get('/devops/resourcequota', devopsController.getResourceDevopsquotaSet) // 获取设置中的量

  //clean
  router.put('/cleaner/settings', cleanController.startCleaner)
  router.get('/cleaner/settings', cleanController.getCleanerSettings)
  router.get('/cleaner/settings/logs', cleanController.getSystemSettings)
  router.get('/cleaner/logs', cleanController.getCleanerLogs)
  router.post('/cleaner/logs', cleanController.startCleanSystemLogs)
  router.put('/cleaner/monitor', cleanController.startCleanMonitor)
  router.post('/cleaner/records', cleanController.getSystemCleanerLogs)
  router.post('/cleaner/cron', cleanController.deleteLogsAutoClean)
  router.post('/cleanlogs/flush', cleanController.deleteCleanLogs)
  router.get('/cleaner/monitor', cleanController.getMonitorSetting)
  router.get('/cleaner/systemlog/status', cleanController.getSystemLogStatus)

  //app_store
  router.put('/app-store/apps/approval', appStoreController.approveApps)
  router.get('/app-store/apps/approval', appStoreController.getAppApprovalList)
  router.get('/app-store/apps', appStoreController.getStorelist)
  router.get('/app-store/apps/:name/existence', appStoreController.checkAppNameExists)
  router.post('/app-store/:cluster/apps/images/publishment', appStoreController.publishImage)
  router.put('/app-store/apps/images/management', appStoreController.manageImages)
  router.get('/app-store/apps/images', appStoreController.getImagesList)
  router.post('/app-store/apps/images/status', appStoreController.getImageStatus)
  router.post('/app-store/apps/:app/icon', appStoreController.uploadIcon)
  router.get('/app-store/apps/icon/:id', appStoreController.getIcon)
  router.post('/app-store/apps/images/existence', appStoreController.checkImageExists)

  // Load Balance
  router.get('/clusters/:cluster/loadbalances/ip', loadBalanceController.getLBIPList)
  router.post('/clusters/:cluster/loadbalances/displayname/:displayname/agentType/:agentType', loadBalanceController.createLB)
  router.put('/clusters/:cluster/loadbalances/:name/displayname/:displayname/agentType/:agentType', loadBalanceController.editLB)
  router.put('/clusters/:cluster/loadbalances/:name/displayname/:displayname/agentType/:agentType/config', loadBalanceController.editLBConfig)
  router.get('/clusters/:cluster/loadbalances/:name/displayname/:displayname/agentType/:agentType/config', loadBalanceController.getLBConfig)
  router.get('/clusters/:cluster/loadbalances', loadBalanceController.getLBList)
  router.get('/clusters/:cluster/loadbalances/:name/displayname/:displayname', loadBalanceController.getLBDetail)
  router.del('/clusters/:cluster/loadbalances/:name/displayname/:displayname/agentType/:agentType', loadBalanceController.deleteLB)
  router.post('/clusters/:cluster/loadbalances/:name/ingress/:ingressname/displayname/:displayname/agentType/:agentType', loadBalanceController.createIngress)
  router.put('/clusters/:cluster/loadbalances/:name/ingress/:displayname/displayname/:lbdisplayname/agentType/:agentType', loadBalanceController.updateIngress)
  router.del('/clusters/:cluster/loadbalances/:lbname/ingresses/:name/:ingressdisplayname/displayname/:displayname/agentType/:agentType', loadBalanceController.deleteIngress)
  router.post('/clusters/:cluster/loadbalances/:lbname/ingress/:ingressname/app/displayname/:displayname/agentType/:agentType', loadBalanceController.createAppIngress)
  router.get('/clusters/:cluster/loadbalances/services/:name/controller', loadBalanceController.getServiceLB)
  router.del('/clusters/:cluster/loadbalances/:lbname/services/:servicename/agentType/:agentType', loadBalanceController.unbindService)
  router.get('/clusters/:cluster/loadbalances/:lbname/ingresses/exist', loadBalanceController.nameAndHostCheck)
  router.post('/clusters/:cluster/loadbalances/:lbname/stream/type/:type/displayname/:name/agentType/:agentType', loadBalanceController.createTcpUdpIngress)
  router.get('/clusters/:cluster/loadbalances/:lbname/protocols/:type', loadBalanceController.getTcpUdpIngress)
  router.put('/clusters/:cluster/loadbalances/:lbname/stream/type/:type/displayname/:name/agentType/:agentType', loadBalanceController.updateTcpUdpIngress)
  router.del('/clusters/:cluster/loadbalances/:lbname/stream/protocols/:type/ports/:ports/displayname/:name/agentType/:agentType', loadBalanceController.deleteTcpUdpIngress)
  router.put('/clusters/:cluster/loadbalances/:lbname/whitelist/displayname/:name/agentType/:agentType', loadBalanceController.updateWhiteList)
  router.get('/loadbalances/checkpermission', loadBalanceController.isCreateLbPermission)
  router.get('/clusters/:cluster/loadbalances/vip/:vip', loadBalanceController.getVipIsUsed)
  router.get('/clusters/:cluster/metric/loadbalance/:name/metrics', loadBalanceController.getMonitorData)
  router.get('/clusters/:cluster/loadbalances/:name/ingresses', loadBalanceController.getHttpIngressData)

  // autoscaler
  router.get('/clusters/autoscaler/server', autoScalerController.getServers)
  router.post('/clusters/autoscaler/server', autoScalerController.createServer)
  router.put('/clusters/autoscaler/server/:id', autoScalerController.updateServer)
  router.del('/clusters/autoscaler/server/:id', autoScalerController.deleteServer)
  router.get('/clusters/autoscaler/cluster', autoScalerController.getCluster)
  router.get('/clusters/autoscaler/:name', autoScalerController.checkServerName)
  router.get('/clusters/autoscaler/providerstatus', autoScalerController.getProviderStatus)

  router.get('/clusters/autoscaler/app', autoScalerController.getApps)
  router.post('/clusters/autoscaler/app', autoScalerController.createApp)
  router.put('/clusters/autoscaler/app', autoScalerController.updateApp)
  router.del('/clusters/autoscaler/app', autoScalerController.deleteApp)
  router.get('/clusters/autoscaler/app/status', autoScalerController.setAppsStatus)
  router.get('/clusters/autoscaler/app/log', autoScalerController.getLogs)

  router.get('/clusters/autoscaler/resource/:id', autoScalerController.getRes)

  // scheduler
  // router.get('/clusters/:cluster/services', schedulerController.getAllServiceTag)
  router.post('/clusters/:cluster/services/:service/labels', schedulerController.addServiceTag)
  router.put('/clusters/:cluster/services/:service/labels', schedulerController.updataServiceTag)
  router.del('/clusters/:cluster/services/:service/labels/:labels', schedulerController.delateServiceTag)

  // aiops
  router.get('/ai/clusters/:cluster/modelsets', aiopsController.getModelsets)

  // 获取资源定义
  router.get('/resourcequota/definitions', resourcequota.resourceDefinite)

  // resourcequota 申请资源配额
  router.post('/resourcequota/apply', resourcequota.applyResourcequota)
  router.get('/resourcequota/apply', resourcequota.checkApplyRecord)
  router.delete('/resourcequota/apply/:id', resourcequota.deleteResourcequota)
  router.put('/resourcequota/apply/:id', resourcequota.updateResourcequota)
  router.get('/resourcequota/apply/:id', resourcequota.checkResourcequotaDetail)
  router.get('/resourcequota/apply/checkApplyExist', resourcequota.checkResourcequotaExist)

  // DNS Record
  router.post('/clusters/:cluster/endpoints',dnsRecordController.createDnsItem)
  router.get('/clusters/:cluster/endpoints',dnsRecordController.getDnsList)
  router.get('/clusters/:cluster/endpoints/:name',dnsRecordController.getDnsItemDetail)
  router.put('/clusters/:cluster/endpoints',dnsRecordController.updataDnsItem)
  router.delete('/clusters/:cluster/endpoints/:name',dnsRecordController.deleteDnsItem)

  // securityGroup
  router.post('/clusters/:cluster/networkpolicy',securityGroupController.createSecurityGroup)
  router.get('/clusters/:cluster/networkpolicy',securityGroupController.getSecurityGroupList)
  router.get('/clusters/:cluster/networkpolicy/:name',securityGroupController.getSecurityGroupDetail)
  router.put('/clusters/:cluster/networkpolicy',securityGroupController.updataSecurityGroup)
  router.delete('/clusters/:cluster/networkpolicy/:name',securityGroupController.deleteSecurityGroup)

    // middlewareCenter
  router.get('/clusters/:cluster/appcenters', middlewareCenter.getAppClusterList)
  router.get('/clusters/:cluster/appcenters/:name', middlewareCenter.getAppClusterDetail)
  router.post('/clusters/:cluster/appcenters/delete', middlewareCenter.deleteClusterDetail)
  router.post('/clusters/:cluster/appcenters/stop', middlewareCenter.stopClusterDetail)
  router.post('/clusters/:cluster/appcenters/start', middlewareCenter.startClusterDetail)
  router.post('/clusters/:cluster/appcenters/reboot', middlewareCenter.rebootClusterDetail)
  router.get('/clusters/:cluster/appcenters/:name/services', middlewareCenter.getAppClusterServerList)
  router.get('/appcenters/groups', middlewareCenter.getAppClassifies)
  router.get('/appcenters', middlewareCenter.getApps)
  router.post('/clusters/:cluster/appcenters', middlewareCenter.deployApp)
  router.get('/clusters/:cluster/appcenters/:name/exist', middlewareCenter.checkAppNameExist)

  router.get('/clusters/:cluster/pools',ipPoolController.getIPPoolList)
  router.post('/clusters/:cluster/pool',ipPoolController.createIPPool)
  router.post('/clusters/:cluster/pool-delete',ipPoolController.deleteIPPool)
  router.get('/clusters/:cluster/is-pool-exist',ipPoolController.getIPPoolExist)
  router.get('/clusters/:cluster/is-pool-in-use',ipPoolController.getIPPoolInUse)
  // PSP
  router.get('/clusters/:cluster/native/:type', containerSecurityPolicy.getK8sNativeResource)
  router.delete('/clusters/:cluster/native/:type/:name', containerSecurityPolicy.deleteK8sNativeResourceInner)
  router.delete('/clusters/:cluster/podsecuritypolicy/:name', containerSecurityPolicy.deletePSP)
  router.get('/clusters/:cluster/podsecuritypolicy', containerSecurityPolicy.listPSP)
  router.get('/clusters/:cluster/podsecuritypolicy/:name', containerSecurityPolicy.listPSPDetail)
  router.get('/clusters/:cluster/podsecuritypolicy/project', containerSecurityPolicy.listProjectPSPDetail)
  router.post('/clusters/:cluster/podsecuritypolicy/project/:resources', containerSecurityPolicy.startPodProject)
  router.delete('/clusters/:cluster/podsecuritypolicy/project/:resources', containerSecurityPolicy.stopPSPProject)
  // workorders
  router.get('/workorders/announcements', workerOrderController.getAnnouncements)
  router.get('/workorders/announcements/:id', workerOrderController.getAnnouncement)
  router.post('/workorders/announcements', workerOrderController.createAnnouncement)
  router.del('/workorders/announcements/:id', workerOrderController.deleteAnnouncement)
  router.get('/workorders/my-order', workerOrderController.getWorkOrderList)
  router.get('/workorders/my-order/:id', workerOrderController.getWorkOrderDetails)
  router.del('/workorders/my-order/:id', workerOrderController.delWorkOrder)
  router.get('/workorders/my-order/:id/messages', workerOrderController.getWorkOrderMessages)
  router.post('/workorders/my-order/:id/messages', workerOrderController.addWorkOrderMessages)
  router.post('/workorders', workerOrderController.createWorkOrder)
  router.put('/workorders/my-order/:id', workerOrderController.changeWorkOrderStatus)

  // 云星集成中心
  router.get('/rightcloud/hosts', rcIntegrationController.hostList)
  router.get('/rightcloud/volumes', rcIntegrationController.volumeList)
  router.get('/rightcloud/envs', rcIntegrationController.envList)
  router.get('/rightcloud/vpc/:vpcId/subnets', rcIntegrationController.subnetList)
  router.get('/rightcloud/env/:envId/vpc', rcIntegrationController.networkList)
  router.get('/rightcloud/networks/ports', rcIntegrationController.virtualNetwork)

  // statefulSet
  router.get('/clusters/:cluster/native/:type/:name/instances', statefulSet.getPodsList)
  router.post('/clusters/:cluster/logs/instances/:instances/logs', statefulSet.getLog)

  // 系统服务管理
  router.get('/clusters/:cluster/sysServiceManage', sysServiceManage.getServiceList)
  router.get('/clusters/:cluster/sysServiceManage/:service/logs', sysServiceManage.getServiceLogs)
  router.get('/clusters/:cluster/sysServiceManage/:pods/metrics', sysServiceManage.getPodMetrics)

  // 访问devops服务器, 返回全局资源使用量
  return router.routes()
}
