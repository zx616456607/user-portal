/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2016/12/27
 * @author mengyuan
 */

import moment from 'moment'
import { parseAmount } from '../../../common/tools'

export function getCostBar (costArr, summaryData, standard, transformDate){
  let xAxisData = costArr
  let yAxisData = []
  let maxYAxisValue = 90 // default 90 + 10 = 100
  if (!summaryData.isFetching && summaryData.month != '') {
    let days = []
    let firstDay = `${summaryData.month}-01`
    let lastDay = moment(firstDay).add(1, 'months').format('YYYY-MM-DD')
    for (let i = 0; i < 31; i++) {
      const day = moment(firstDay).add(i, 'days').format('YYYY-MM-DD')
      if (day < lastDay) {
        days.push(day)
      }
      else {
        break
      }
    }
    days.map(day => {
      let find = false
      for (const item of summaryData.items) {
        if (item.time == day) {
          const price = parseAmount(item.cost).amount
          yAxisData.push(price)
          maxYAxisValue = price > maxYAxisValue ? price : maxYAxisValue
          find = true
          continue
        }
      }
      if (!find) {
        yAxisData.push(0.00)
      }
    })
    // modify days ['2016-12-01', '2016-12-02' ...] to [1, 2 ...]
    for (let i = 0; i < days.length; i++) {
      days[i] = parseInt(days[i].substr(8))
    }
    xAxisData = days
    // ceiling maxYAxisValue. 123.4567 => 130
    maxYAxisValue = (parseInt(maxYAxisValue / 10) + 1) * 10
  }
  return {
    color: ['#3398DB'],
    tooltip : {
      trigger: 'axis',
      axisPointer : {
        type : 'shadow'
      },

      formatter: standard ? (transformDate() + '-{b}<br/>消费 ￥{c}') :
                            (transformDate() + '-{b}<br/>消费 {c}T币'),
      textStyle: {
        color: '#46b2fa',
        fontSize: 12,
      },
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#46b2fa',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      height: 150
    },
    xAxis : [
      {
        type : 'category',
        data : xAxisData,
        splitLine: {
          "show": false
        },
        axisTick: {
          "show": false
        },
        splitArea: {
          "show": false
        },
        axisLabel: {
          "interval": 0,
        },
      }
    ],
    yAxis : [
      {
        type : 'value',
        max: maxYAxisValue,
        splitNumber: 2,
        interval: maxYAxisValue / 2,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed'
          },
        },
      }
    ],
    series : [
      {
        name:'',
        type:'bar',
        barWidth: 16,
        data: yAxisData,
      }
    ]
  }
}