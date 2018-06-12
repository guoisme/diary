var mongodb = require('./db');
var ObjectId = require('mongodb').ObjectId;
function Diary(username,diary,weather, time) {
  this.user = username;
  this.diary = diary;
  this.weather = weather;
  if (time) {
    this.time = time;
  } else {
    this.time = new Date();
  }
};
module.exports = Diary;

Diary.prototype.save = function save(callback) {
  // 存入 Mongodb 的文檔
  var diary = {
    user: this.user,
    diary: this.diary,
    weather: this.weather,
    time: this.time,
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 diarys 集合
    db.collection('diarys', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 爲 user 屬性添加索引
      collection.ensureIndex('user');
      // 寫入 diary 文檔
      collection.insert(diary, {safe: true}, function(err, diary) {
        mongodb.close();
        callback(err, diary);
      });
    });
  });
};

Diary.get = function get(username, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 diarys 集合
    db.collection('diarys', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 查找 user 屬性爲 username 的文檔，如果 username 是 null 則匹配全部
      var query = {};
      if (username) {
        query.user = username;
      }
      collection.find(query).sort({time: -1}).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }
        // 封裝 diarys 爲 Diary 對象
        var diarys = [];
        docs.forEach(function(doc, index) {
          var diary = new Diary(doc.user, doc.diary,doc.weather, doc.time);
          diary._id=doc._id;
          diarys.push(diary);
        });
        callback(null, diarys);
      });
    });
  });
};
Diary.find = function find(id, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 读取 users 集合
    db.collection('diarys', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 查找 name 属性为 username 的文档
      console.log(ObjectId(id));
      collection.findOne({"_id": ObjectId(id)}, function(err, doc) {
        mongodb.close();
        if (doc) {
          // 封装文档为 User 对象
         
          callback(err, doc);
        } else {
          callback(err, null);
        }
      });
    });
  });
};

Diary.update=function update(id,diarys,callback){
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('diarys', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.update({'_id': ObjectId(id)},{
        'user':diarys.user,
        'diary':diarys.diary,
        'weather':diarys.weather,
        'time':diarys.time
      },function(err,doc){
        mongodb.close();
        if (doc) {
          callback(err, doc);
        } else {
          callback(err, null);
        }
      });
    });
  });
};

Diary.remove = function remove(id, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('diarys', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.remove({"_id": ObjectId(id)}, function(err, doc) {
        mongodb.close();
        callback(err, true);
      });
    });
  });
};