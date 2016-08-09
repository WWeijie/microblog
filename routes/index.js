var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js')

/* GET home page. */
router.get('/',function(req,res){
    res.render('index',{
        title: '首页'
    });
});
router.get('/reg',function(req,res){
    res.render('reg',{
        title:'用户注册'
    });
});
router.post('/reg',function(req,res){
    if (req.body['password-repeat'] != req.body['password']){
        req.flash('error','password is not equal');
        return res.redirect('/reg');
    }
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = new User({
        name: req.body.username,
        password: password,
    });
    User.get(newUser.name, function(err,user){
        if (user)
            err = 'Username already exists';
        if (err){
            req.flash('error',err);
            return res.redirect('/reg');
        }
        newUser.save(function(err){
            if (err){
                req.flash('error',err);
                return res.redirect('/reg');
            }
            req.session.user = newUser;
            req.flash('success','注册成功');
            res.redirect('/');
        });
    });
});

router.get('/login', function(req,res){
    res.render('login',{
        title:'用户登陆',
    })
})
router.post('/login', function(req, res) {
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    User.get(req.body.username, function(err, user) {
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/login');
        }
        if (user.password != password) {
            req.flash('error', '用户口令错误');
            return res.redirect('/login');
        }
        req.session.user = user;
        req.flash('success', '登入成功');
        res.redirect('/');
    });
});
router.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功');
    res.redirect('/');
});
module.exports = router;
