var express = require('express');
var router = express.Router();
var Diary = require('../models/diary.js');
var users=require('./users.js');
router.get('/write',checkLogin);
router.get('/write', function(req, res, next) {
  res.render('write',{title:'写日记',name:'write',diary:0});
});
router.post('/write', function(req, res, next) {
  var currentUser = req.session.user;
  console.log(req.body.weather);
  	var diary =new Diary(currentUser.name,req.body.diary,req.body.weather);
  diary.save(function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }
    req.flash('success',"发表成功");
    res.redirect('/diary/manage');
  });
});
router.get('/manage',checkLogin);
router.get('/manage', function(req, res, next) {
	var currentUser = req.session.user;
    Diary.get(currentUser.name,function(err,diarys){
      if(err){
        req.flash('/');
        return redirect('error',err);
      }
      res.render('manage',{
        title:'管理日记',name:'manage',
        diarys:diarys
      });
    });
});
router.get('/u/:id',function(req,res,next){
	// console.log(req.params.id);
	Diary.find(req.params.id,function(err,diary){
      if(err){
        req.flash('/');
        return res.redirect('error',err);
      }
      res.render('write',{title:'改日记',name:'write',diary:diary});
    });
});
router.post('/u/:id',function(req,res,next){
	var currentUser = req.session.user.name;
	var diary=[];
	diary.diary=req.body.diary;
	diary.weather=req.body.weather;
	diary.time=req.body.time;
	diary.user=currentUser;
	console.log(diary);
    Diary.update(req.params.id,diary,function(err,diary){
 	    if(err){req.flash('/');return res.redirect('error',err);}
 	    req.flash('success',"更新成功");
        res.redirect('/diary/manage');
    });
});
router.get('/remove',checkLogin);
router.get('/remove/:id',function(req,res,next){
	// console.log(req.params.id);
	Diary.remove(req.params.id,function(err,diary){
      if(err){
        req.flash('/');
        return res.redirect('error',err);
      }
      req.flash('success','删除成功');
      console.log(diary);
      res.redirect('/diary/manage');
    });
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