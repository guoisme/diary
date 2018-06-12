var express = require('express');
var router = express.Router();
var crypto=require('crypto');
var User=require('../models/user.js');
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });
router.get('/login',checkNotLogin);
router.get('/login',function(req,res,next){
	res.render('login',{title:'用户登录',name:'login'});
});
router.post('/login',checkNotLogin);
router.post('/login',function(req,res,next){
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('base64'),
      name=req.body.username;
  User.get(name,function(err,user){
    if(!user){
      req.flash('error','用户不存在');
      return res.redirect('/users/login');
    }
    if(user.password!=password){
      req.flash('error','密码错误');
      return res.redirect('/users/login');
    }
    console.log(user);
    req.session.user = user;
    req.flash('success','登入成功');
    return res.redirect('/');
  });
});
router.get('/reg',checkNotLogin);
router.get('/reg',function(req,res,next){
  res.render('reg',{title:'用户注册',name:'reg'});
});
router.post('/reg',checkNotLogin);
router.post('/reg',function(req,res,next){
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('base64'),//加密后的密码
      newUser =new User({
        name:req.body.username,
        password:password
      });
  User.get(newUser.name,function(err,user){
    if(err){
      //反馈错误，跳转到/reg,记得return
      req.flash('error',err);
      return res.redirect('/users/reg');
    }
    //判断用户是否存在
    if(user){
      req.flash('error','用户已存在');
      return res.redirect('/users/reg');
    }
    //判断密码是否一致
    if(req.body.password !== req.body['password-repeat'] ){
      //反馈密码不一致，跳转到/reg,记得return
      req.flash('error','密码不一致');
      return res.redirect('/users/reg');
    }
    //用户不存在
    newUser.save(function(err){
      if(err){
        //反馈错误，跳转到/reg,记得return
        req.flash('error','保存失败');
        return res.redirect('/users/reg');
      }
      req.session.user=newUser;
      req.flash('success','保存成功');
      res.redirect('/');
    });
  });
});
router.get('/edit',checkLogin);
router.get('/edit/:user',function(req,res,next){ 
  var name=req.params.user;
   User.get(name,function(err,user){
    if(!user){
      req.flash('error','用户不存在');
      res.redirect('/');
    }
    res.render('edit',{title:'用户编辑',user:user,name:'edit'});
  });
});
router.post('/edit/:user',function(req,res,next){
  var md5 = crypto.createHash('md5'),
      md51 = crypto.createHash('md5'),
      pwdOld = md5.update(req.body['password-old']).digest('base64'),//加密后的密码
      pwd=md51.update(req.body.password).digest('base64'),
      name=req.session.user.name;
  console.log(req.session.user.password==pwdOld);
  if(req.session.user.password!=pwdOld){
    req.flash('error','旧密码错误');
    res.redirect('/users/edit/:'+name);
  }
  if(req.body['password-old']==req.body.password){
    req.flash('error','新密码与旧密码一致');
    res.redirect('/users/edit/:'+name);
  }
  if(req.body.password !== req.body['password-repeat'] ){
    req.flash('error','密码不一致');
    res.redirect('/users/edit/:'+name);
  }
  var Newuser={
    name:name,
    password:pwd
  };
  User.update(name,Newuser,function(err,users){
    if(err){req.flash('/');return res.redirect('error',err);}
    req.session.user=users;
    if(req.session.user){
      console.log(req.session.user);
      req.flash('success',"修改密码成功");
      res.redirect('/');
    }  
  });
});
router.get('/logout',checkLogin);
router.get('/logout',function(req,res,next){
  req.session.user=null;
  req.flash('success','退出成功');
  res.redirect('/');
});
function checkLogin(req,res,next){
  if(!req.session.user){
    req.flash('error','用户未登录');
    return res.redirect('/users/login');
  }
  next();
}
function checkNotLogin(req,res,next){
  if(req.session.user){
    req.flash('error','用户已登录');
    return res.redirect('/');
  }
  next();
}
module.exports = router;
