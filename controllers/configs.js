/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/26
 * @author ZhaoXueYu
 */

'use strict'

exports.getConfigGroup = function* () {
  const cluster = this.params.cluster
  const data = [
    {
      groupId: '1',
      groupName: 'my_ConfigGroup1',
      date: '2016-09-12 15:12:30',
      configFile: [
        {fileId: '1', fileName: 'my_config_file1',
          container: [
            {containerId:'1',containerName: 'my_container1', pointPath: '/var/test/log1',},
            {containerId:'2',containerName: 'my_container2', pointPath: '/var/test/log2',},
            {containerId:'3',containerName: 'my_container3', pointPath: '/var/test/log3',},
            {containerId:'4',containerName: 'my_container4', pointPath: '/var/test/log4',},
            {containerId:'5',containerName: 'my_container5', pointPath: '/var/test/log5',},
            {containerId:'6',containerName: 'my_container6', pointPath: '/var/test/log6',},
            {containerId:'7',containerName: 'my_container7', pointPath: '/var/test/log7',},
            {containerId:'8',containerName: 'my_container8', pointPath: '/var/test/log8',},
            {containerId:'9',containerName: 'my_container9', pointPath: '/var/test/log9',},
            {containerId:'10',containerName: 'my_container10', pointPath: '/var/test/log10',},
          ]
        },
        {fileId: '2', fileName: 'my_config_file2',
          container: [
            {containerId:'1',containerName: 'my_container1', pointPath: '/var/test/log',},
            {containerId:'2',containerName: 'my_container2', pointPath: '/var/test/log',},
          ]
        },
        {fileId: '3', fileName: 'my_config_file3',
          container: [
            {containerId:'1',containerName: 'my_container1', pointPath: '/var/test/log',},
            {containerId:'2',containerName: 'my_container2', pointPath: '/var/test/log',},
            {containerId:'3',containerName: 'my_container3', pointPath: '/var/test/log',},
          ]
        },
        {fileId: '4', fileName: 'my_config_file4',
          container: [
        
          ]
        },
        {fileId: '5', fileName: 'my_config_file5',
          container: [
            {containerId:'1',containerName: 'my_container1', pointPath: '/var/test/log',},
            {containerId:'2',containerName: 'my_container2', pointPath: '/var/test/log',},
            {containerId:'3',containerName: 'my_container3', pointPath: '/var/test/log',},
            {containerId:'4',containerName: 'my_container4', pointPath: '/var/test/log',},
          ]
        },
      ],
    },
    {
      groupId: '2',
      groupName: 'my_ConfigGroup2',
      date: '2016-09-12 15:12:30',
      configFile: [
        {fileId: '1', fileName: 'my_config_file1',
          container: [
            {containerId:'1',containerName: 'my_container1', pointPath: '/var/test/log',},
            {containerId:'2',containerName: 'my_container2', pointPath: '/var/test/log',},
            {containerId:'3',containerName: 'my_container3', pointPath: '/var/test/log',},
            {containerId:'4',containerName: 'my_container4', pointPath: '/var/test/log',},
            {containerId:'5',containerName: 'my_container5', pointPath: '/var/test/log',},
            {containerId:'6',containerName: 'my_container6', pointPath: '/var/test/log',},
            {containerId:'7',containerName: 'my_container7', pointPath: '/var/test/log',},
            {containerId:'8',containerName: 'my_container8', pointPath: '/var/test/log',},
            {containerId:'9',containerName: 'my_container9', pointPath: '/var/test/log',},
            {containerId:'10',containerName: 'my_container10', pointPath: '/var/test/log',},
          ]
        },
    
      ],
    },
    {
      groupId: '3',
      groupName: 'my_ConfigGroup3',
      configFile: [
        {fileId: '1', fileName: 'my_config_file1',
          container: [
            {containerId:'1',containerName: 'my_container1', pointPath: '/var/test/log',},
            {containerId:'2',containerName: 'my_container2', pointPath: '/var/test/log',},
            {containerId:'3',containerName: 'my_container3', pointPath: '/var/test/log',},
            {containerId:'4',containerName: 'my_container4', pointPath: '/var/test/log',},
            {containerId:'5',containerName: 'my_container5', pointPath: '/var/test/log',},
            {containerId:'6',containerName: 'my_container6', pointPath: '/var/test/log',},
            {containerId:'7',containerName: 'my_container7', pointPath: '/var/test/log',},
            {containerId:'8',containerName: 'my_container8', pointPath: '/var/test/log',},
            {containerId:'9',containerName: 'my_container9', pointPath: '/var/test/log',},
            {containerId:'10',containerName: 'my_container10', pointPath: '/var/test/log',},
          ]
        },
        {fileId: '2', fileName: 'my_config_file2',
          container: [
            {containerId:'1',containerName: 'my_container1', pointPath: '/var/test/log',},
            {containerId:'2',containerName: 'my_container2', pointPath: '/var/test/log',},
            {containerId:'3',containerName: 'my_container3', pointPath: '/var/test/log',},
            {containerId:'4',containerName: 'my_container4', pointPath: '/var/test/log',},
            {containerId:'5',containerName: 'my_container5', pointPath: '/var/test/log',},
            {containerId:'6',containerName: 'my_container6', pointPath: '/var/test/log',},
            {containerId:'7',containerName: 'my_container7', pointPath: '/var/test/log',},
            {containerId:'8',containerName: 'my_container8', pointPath: '/var/test/log',},
            {containerId:'9',containerName: 'my_container9', pointPath: '/var/test/log',},
            {containerId:'10',containerName: 'my_container10', pointPath: '/var/test/log',},
          ]
        },
      ],
      date: '2016-09-12 15:12:30',
    },
    {
      groupId: '4',
      groupName: 'my_ConfigGroup4',
      configFile: [
        {fileId: '1', fileName: 'my_config_file1',
          container: [
            {containerId:'1',containerName: 'my_container1', pointPath: '/var/test/log',},
            {containerId:'2',containerName: 'my_container2', pointPath: '/var/test/log',},
            {containerId:'3',containerName: 'my_container3', pointPath: '/var/test/log',},
            {containerId:'4',containerName: 'my_container4', pointPath: '/var/test/log',},
            {containerId:'5',containerName: 'my_container5', pointPath: '/var/test/log',},
            {containerId:'6',containerName: 'my_container6', pointPath: '/var/test/log',},
            {containerId:'7',containerName: 'my_container7', pointPath: '/var/test/log',},
            {containerId:'8',containerName: 'my_container8', pointPath: '/var/test/log',},
            {containerId:'9',containerName: 'my_container9', pointPath: '/var/test/log',},
            {containerId:'10',containerName: 'my_container10', pointPath: '/var/test/log',},
          ]
        },
        {fileId: '2', fileName: 'my_config_file2',
          container: [
            {containerId:'1',containerName: 'my_container1', pointPath: '/var/test/log',},
            {containerId:'2',containerName: 'my_container2', pointPath: '/var/test/log',},
            {containerId:'3',containerName: 'my_container3', pointPath: '/var/test/log',},
            {containerId:'4',containerName: 'my_container4', pointPath: '/var/test/log',},
            {containerId:'5',containerName: 'my_container5', pointPath: '/var/test/log',},
            {containerId:'6',containerName: 'my_container6', pointPath: '/var/test/log',},
            {containerId:'7',containerName: 'my_container7', pointPath: '/var/test/log',},
            {containerId:'8',containerName: 'my_container8', pointPath: '/var/test/log',},
            {containerId:'9',containerName: 'my_container9', pointPath: '/var/test/log',},
            {containerId:'10',containerName: 'my_container10', pointPath: '/var/test/log',},
          ]
        },
      ],
      date: '2016-09-12 15:12:30',
    },
  ];
  this.body = {
    cluster,
    data
  }
}



