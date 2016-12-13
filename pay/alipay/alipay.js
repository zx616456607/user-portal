var AlipayNotify = require('./alipay_notify.class').AlipayNotify;
var AlipaySubmit = require('./alipay_submit.class').AlipaySubmit;

var logger = require('../services/loggerUtil.js').getLogger("account");
/*var userAccount = require('../database/po/users_account');
var userAccountDAO = new userAccount();
var userPayhistory = require('../database/po/users_payhistory');
var userPayhistoryDAO = new userPayhistory();*/

var assert = require('assert');
var url = require('url');
var inherits = require('util').inherits,
EventEmitter = require('events').EventEmitter;

var default_alipay_config = {
	partner:'' //合作身份者id，以2088开头的16位纯数字
	,key:''//安全检验码，以数字和字母组成的32位字符
	,seller_email:'' //卖家支付宝帐户 必填
	,host:'' //域名
	,cacert:'cacert.pem'//ca证书路径地址，用于curl中ssl校验 请保证cacert.pem文件在当前文件夹目录中
	,transport:'http' //访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
	,input_charset:'utf-8'//字符编码格式 目前支持 gbk 或 utf-8
	,sign_type:'MD5'//签名方式 不需修改
	,create_direct_pay_by_user_return_url : ''
	,create_direct_pay_by_user_notify_url: ''
};

function Alipay(alipay_config){
	EventEmitter.call(this);

	//default config
	this.alipay_config = default_alipay_config;
	//config merge
	for(var key in alipay_config){
		this.alipay_config[key] = alipay_config[key];
	}
}

/**
 * @ignore
 */
 inherits(Alipay, EventEmitter);

/*Alipay.prototype.route = function(app){
 	var self = this;
 	app.get(this.alipay_config.create_direct_pay_by_user_return_url, function(req, res){self.create_direct_pay_by_user_return(req, res)});
 	app.post(this.alipay_config.create_direct_pay_by_user_notify_url, function(req, res){self.create_direct_pay_by_user_notify(req, res)});
 	app.post(this.alipay_config.refund_fastpay_by_platform_pwd_notify_url, function(req, res){self.refund_fastpay_by_platform_pwd_notify(req, res)});

 	app.get(this.alipay_config.create_partner_trade_by_buyer_return_url, function(req, res){self.create_partner_trade_by_buyer_return(req, res)});
 	app.post(this.alipay_config.create_partner_trade_by_buyer_notify_url, function(req, res){self.create_partner_trade_by_buyer_notify(req, res)});

 	app.get(this.alipay_config.trade_create_by_buyer_return_url, function(req, res){self.trade_create_by_buyer_return(req, res)});
 	app.post(this.alipay_config.trade_create_by_buyer_notify_url, function(req, res){self.trade_create_by_buyer_notify(req, res)});
 }*/


Alipay.prototype.create_direct_pay_by_user = function(data, res){
	assert.ok(data.out_trade_no && data.subject && data.total_fee);

	//建立请求
	var alipaySubmit = new AlipaySubmit(this.alipay_config);

	var parameter = {
		service:'create_direct_pay_by_user'
		,partner:this.alipay_config.partner
		,payment_type:'1' //支付类型
		,notify_url: url.resolve(this.alipay_config.host, this.alipay_config.create_direct_pay_by_user_notify_url)//服务器异步通知页面路径,必填，不能修改, 需http://格式的完整路径，不能加?id=123这类自定义参数
		,return_url: url.resolve(this.alipay_config.host , this.alipay_config.create_direct_pay_by_user_return_url)//页面跳转同步通知页面路径 需http://格式的完整路径，不能加?id=123这类自定义参数，不能写成http://localhost/
		,seller_email:this.alipay_config.seller_email //卖家支付宝帐户 必填
		,_input_charset:this.alipay_config['input_charset'].toLowerCase().trim()
	};
	for(var key in data){
		parameter[key] = data[key];
	}

	var html_text = alipaySubmit.buildRequestForm(parameter,"get", "确认");
	res.send(html_text);
}

//即时到账批量退款有密接口
/* 	data{
	refund_date:'',//退款当天日期, 必填，格式：年[4位]-月[2位]-日[2位] 小时[2位 24小时制]:分[2位]:秒[2位]，如：2007-10-01 13:13:13
	batch_no: '', //批次号, 必填，格式：当天日期[8位]+序列号[3至24位]，如：201008010000001
	batch_num:'', //退款笔数, 必填，参数detail_data的值中，“#”字符出现的数量加1，最大支持1000笔（即“#”字符出现的数量999个）
	detail_data: '',//退款详细数据 必填，具体格式请参见接口技术文档
} */
Alipay.prototype.refund_fastpay_by_platform_pwd = function(data, res){
	assert.ok(data.refund_date && data.batch_no && data.batch_num && data.detail_data);
	//建立请求
	var alipaySubmit = new AlipaySubmit(this.alipay_config);

	//构造要请求的参数数组，无需改动
	var parameter = {
		service : 'refund_fastpay_by_platform_pwd',
		partner : this.alipay_config.partner,
		notify_url	: url.resolve(this.alipay_config.host, this.alipay_config.refund_fastpay_by_platform_pwd_notify_url),
		seller_email	: this.alipay_config.seller_email,

		refund_date	: data.refund_date,
		batch_no	: data.batch_no,
		batch_num	: data.batch_num,
		detail_data	: data.detail_data,

		_input_charset	: this.alipay_config['input_charset'].toLowerCase().trim()
	};

	var html_text = alipaySubmit.buildRequestForm(parameter,"get", "确认");
	res.send(html_text);
}

//----------获取支付宝异步通知页面------------
Alipay.prototype.create_direct_pay_by_user_post_return = function(req, res, callback){
	var self = this;
  var _POST = req.body;
  /*this.parseNotify(req, res, function(err, _POST){
    if(err){
      console.log('parseNotify error!');
    } else {*/
      //console.log('_POST-out_trade_no:' + _POST.out_trade_no);
  //计算得出通知验证结果
  var alipayNotify = new AlipayNotify(this.alipay_config);
  alipayNotify.verifyNotify(_POST, function(verify_result){
    if(verify_result) {//验证成功
      //商户订单号
      var out_trade_no = _POST['out_trade_no'];
      //支付宝交易号
      var trade_no = _POST['trade_no'];
      //交易状态
      var trade_status = _POST['trade_status'];

      if(trade_status  === 'TRADE_FINISHED'){
        self.emit('create_direct_pay_by_user_trade_finished', out_trade_no, trade_no);
      } else if(trade_status === 'TRADE_SUCCESS'){
        self.emit('create_direct_pay_by_user_trade_success', out_trade_no, trade_no);
      }
      callback(null, _POST);
      // res.send("success");    //请不要修改或删除
    } else {
      //验证失败
      self.emit('verify_fail');
      callback('verify_fail', null);
      res.send("fail");
      return;
    }
  });
  /*  }
  });*/
}

/*Alipay.prototype.parseNotify = function(req, res, callback){
  // parse
  var buf = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk){ buf += chunk });
  req.on('end', function(){
    if(buf){
      try{
        var qs = require('querystring');
        var ob = qs.decode(buf);
        // req.body = ob;
        callback(null, ob);
      }catch (e){
        console.log('taobao body parser fail!');
        console.log(e);
        throw e;
      }
    }
  });
}*/
/*function payhistoryNotifyHandle(_POST, res){
  var paymentNotifyQuery    = _POST;
  // console.log('payhistoryNotifyHandle-body-[]:' + paymentNotifyQuery['notify_id']);

  // var paymentNotifyBody = req.body;
  // console.log('payhistoryNotifyHandle-body-.:' + paymentNotifyBody.notify_id);
  var method            = 'payhistoryNotifyHandle';
  var notifyTotalFee    = parseFloat(paymentNotify.total_fee);
  var notifyOutTradeNo  = paymentNotify.out_trade_no;
  userPayhistoryDAO.findUserHistoryByOutTradeNo(notifyOutTradeNo, function(userPayhistory){
    if(userPayhistory){
      if(userPayhistory.is_out_tade_no_agree === 'T' || userPayhistory.total_fee === null){
        logger.info(method, notifyOutTradeNo + '订单已处理!');
        // requestUtil.okJsonResponse({outTradeNo:notifyOutTradeNo, status: '该订单已处理'}, res);
        return;
      } else {
        var userPayhistoryTotalFee = parseFloat(userPayhistory.total_fee);
        if(userPayhistoryTotalFee !== notifyTotalFee || userPayhistory.out_trade_no !== notifyOutTradeNo){
          logger.info(method, notifyOutTradeNo + '订单处理错误!');
          requestUtil.errCodeResponse(notifyOutTradeNo + '订单处理错误!', 500, res);
          return;
        } else {
          userPayhistory.return_total_fee     = paymentNotify.total_fee;
          userPayhistory.return_buyer_email   = paymentNotify.buyer_email;
          userPayhistory.return_exterface     = paymentNotify.exterface;
          userPayhistory.return_is_success    = paymentNotify.is_success;
          userPayhistory.return_notify_id     = paymentNotify.notify_id;
          userPayhistory.return_notify_time   = paymentNotify.notify_time;
          userPayhistory.return_notify_type   = paymentNotify.notify_type;
          userPayhistory.return_out_trade_no  = paymentNotify.out_trade_no;
          userPayhistory.return_payment_type  = paymentNotify.payment_type;
          userPayhistory.return_seller_email  = paymentNotify.seller_email;
          userPayhistory.return_trade_no      = paymentNotify.trade_no;
          userPayhistory.return_trade_status  = paymentNotify.trade_status;
          userPayhistory.return_sign          = paymentNotify.sign;
          userPayhistory.return_sign_type     = paymentNotify.sign_type;
          userPayhistory.return_bank_seq_no   = paymentNotify.bank_seq_no;
          userPayhistory.is_out_tade_no_agree = 'T';
          userPayhistoryDAO.updateUserPayhistory(userPayhistory, notifyOutTradeNo, function(err, result){
            if(err){
              requestUtil.errCodeResponse('[notify]User Payhistory update error!', 500, res);
              return;
            }
            logger.info(method,userPayhistory.out_trade_no + " update UserPayhistory successfully -> " + result.insertId);
            userAccountDAO.findUserAccountById(userPayhistory.user_id, function(userAccount){
            if(!userAccount){
              requestUtil.errCodeResponse('[notify]User Account not exist!', 500, res);
              return;
            } else {
              var userAccountBalance = parseFloat(userAccount.balance);
              var newBalance = userAccountBalance + notifyTotalFee;
              newBalance = newBalance.toFixed(2);
              userAccountDAO.updateUserAccountBalance(newBalance, userAccount.user_id, function(err, result){
                if(err){
                  requestUtil.errCodeResponse('[notify]User balance update error', 500, res);
                  return;
                } else {
                  // res.send('success');
                  // requestUtil.okJsonResponse({outTradeNo:notifyOutTradeNo, status: '[notify]订单处理成功！'}, res);
                  return;
                }
              });
            }
          })
          })
        }
      }
    } else {
      requestUtil.errCodeResponse('[notify]outTradeNo not exist!' , 500, res);
    }
  })
}*/

//----------获取支付宝同步跳转通知页面------------
Alipay.prototype.create_direct_pay_by_user_get_return = function(req, res, callback){
  var method = 'create_direct_pay_by_user_get_return';
	var self = this;
	var _GET = req.query;
	var core_funcs = require('./alipay_core.function');
	logger.info(method, req.query['out_trade_no']);

	//计算得出通知验证结果
	var alipayNotify = new AlipayNotify(this.alipay_config);
	alipayNotify.verifyReturn(_GET, function(verify_result){
		if(verify_result) {//验证成功
			//商户订单号
			var out_trade_no = _GET['out_trade_no'];
			//支付宝交易号
			var trade_no = _GET['trade_no'];
			//交易状态
			var trade_status = _GET['trade_status'];

			if(trade_status  === 'TRADE_FINISHED'){
				self.emit('create_direct_pay_by_user_trade_finished', out_trade_no, trade_no);
			}
			else if(trade_status === 'TRADE_SUCCESS'){
				self.emit('create_direct_pay_by_user_trade_success', out_trade_no, trade_no);
			}
			// payhistoryRerurnHandle(req, res);
      callback(null, req.query);
			// res.send("success");		//请不要修改或删除
		}
		else {
			//验证失败
			self.emit("verify_fail");
      callback('get_return_verify_fail', null);
			// res.render('account/payment_return', {err: '支付宝校验出错，充值失败。'});
		}
	});
}

/*function payhistoryRerurnHandle(req, res){
  var paymentReturn = req.query;
  var returnTotalFee = parseFloat(paymentReturn['total_fee']);
  var returnOutTradeNO = paymentReturn['out_trade_no'];
  userPayhistoryDAO.findUserHistoryByOutTradeNo(paymentReturn['out_trade_no'], function(userPayhistory){
    if(userPayhistory){
      var userPayhistoryTotalFee = parseFloat(userPayhistory.total_fee);
      console.log('--parseFloat(paymentNotify.total_fee)--:' + userPayhistoryTotalFee);
      if(userPayhistory.is_out_tade_no_agree === 'T' || userPayhistoryTotalFee !== returnTotalFee || userPayhistory.out_trade_no !== returnOutTradeNO){
        res.render('account/payment_return', {err: '用户充值记录与支付宝返回记录不一致，充值失败！'});
        return;
      } else {
        userPayhistory.return_total_fee     = paymentReturn['total_fee'];
        userPayhistory.return_buyer_email   = paymentReturn['buyer_email'];
        userPayhistory.return_exterface     = paymentReturn['exterface'];
        userPayhistory.return_is_success    = paymentReturn['is_success'];
        userPayhistory.return_notify_id     = paymentReturn['notify_id'];
        userPayhistory.return_notify_time   = paymentReturn['notify_time'];
        userPayhistory.return_notify_type   = paymentReturn['notify_type'];
        userPayhistory.return_out_trade_no  = paymentReturn['out_trade_no'];
        userPayhistory.return_payment_type  = paymentReturn['payment_type'];
        userPayhistory.return_seller_email  = paymentReturn['seller_email'];
        userPayhistory.return_trade_no      = paymentReturn['trade_no'];
        userPayhistory.return_trade_status  = paymentReturn['trade_status'];
        userPayhistory.return_sign          = paymentReturn['sign'];
        userPayhistory.return_sign_type     = paymentReturn['sign_type'];
        userPayhistory.return_bank_seq_no   = paymentReturn['bank_seq_no'];
        userPayhistory.is_out_tade_no_agree = 'T';
        var method = 'updateUserPayhistory';
        userPayhistoryDAO.updateUserPayhistory(userPayhistory, returnOutTradeNO, function(err,result){
          if (err) {
            res.render('account/payment_return', {err: '用户充值记录更新失败！'});
            return;
          }
          logger.info(method, userPayhistory.out_trade_no + " update UserPayhistory successfully -> " + result.insertId);
          userAccountDAO.findUserAccountById(req.user.id, function(userAccount){
            if(!userAccount){
              res.render('account/payment_return', {err: '非法请求！'});
              return;
            } else {
              var userAccountBalance = parseFloat(userAccount.balance);
              console.log('--parseFloat(userAccount.balance)--:' + userAccountBalance);
              var newBalance = userAccountBalance + returnTotalFee;
              console.log('--newBalance=userAccountBalance + returnTotalFee--:' + newBalance);
              newBalance = newBalance.toFixed(2);
              console.log('--newBalance = newBalance.toFixed(2)--:' + newBalance);
              userAccountDAO.updateUserAccountBalance(newBalance, userAccount.user_id, function(err, result){
                if(err){
                  res.render('account/payment_return', {err: '用户账户余额更新失败!'});
                  return;
                } else {
                  res.render('account/payment_return', {
                    total_fee : paymentReturn['total_fee'],
                    trade_no : paymentReturn['trade_no'],
                    balance : newBalance,
                    success : 'success'
                  });
                }
              })
            }
          });
        })
      }
    } else {
      res.render('account/payment_return', {err: '订单不存在，非法请求!'});
      return;
    };
  })
}*/

exports.Alipay = Alipay;