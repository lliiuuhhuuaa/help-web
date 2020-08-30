// indexedDB.js，浏览器本地数据库操作

export default {
    // indexedDB兼容
    indexedDB: window.indexedDB || window.webkitindexedDB || window.msIndexedDB || window.mozIndexedDB,
    // 打开数据库
    // 新对象储存空间newStore参数：newStore.name、newStore.key
    // 新增对象存储空间要更改数据库版本
    openDB: function (dbname, version, newStores, callback) {
        version = version || 1;
        var request = this.indexedDB.open(dbname, version);
        request.onerror = function (event) {
            console.log('IndexedDB数据库打开错误',+event);
        };
        request.onsuccess = function (event) {
            if (callback) {
                callback(event.target.result);
            }
        };
        // onupgradeneeded，调用创建新的储存空间
        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            if (newStores) {
                for(let i=0;i<newStores.length;i++){
                    if (!db.objectStoreNames.contains(newStores[i].name)) {
                        let objectStore = db.createObjectStore(newStores[i].name, {
                            keyPath: newStores[i].key,
                        });
                        if(newStores[i].indexs){
                            let indexs = newStores[i].indexs;
                            for(let k=0;k<indexs.length;k++){
                                objectStore.createIndex(indexs[k].key+'_index', indexs[k].key, { unique: indexs[k].unique});
                            }
                        }

                    }
                }

            }
        };
    },
    // 删除数据库
    deleteDB: function (dbname, callback) {
        var deleteQuest = this.indexedDB.deleteDatabase(dbname);
        deleteQuest.onerror = function () {
            console.log('删除数据库出错');
        };
        deleteQuest.onsuccess = function () {
            if (callback && (typeof callback === 'function')) {
                callback();
            }
        }
    },
    // 关闭数据库
    closeDB: function (dbname) {
        dbname.close();
        console.log('数据库已关闭');
    },
    // 更新旧值,针对输入数量
    putData: function (db, storeName, data, callback) {
        let store = db.transaction(storeName, 'readwrite').objectStore(storeName),
            request;
        if(!(data instanceof Array)){
            data = [data];
        }
        for (let i = 0;i < data.length; i++) {
            request = store.put(data[i]);
            request.onerror = function () {
                console.error('PUT添加数据报错');
            };
            request.onsuccess = function () {
                if (callback && (typeof callback === 'function')) {
                    callback();
                }
            };
        }
    },
    // 更新旧值
    putDatas: function (db, storename, dataArr, callback) {
        let key = "";
        let counter = "";
        let barcode = "";
        let addtime = "";
        dataArr.forEach(item => {
            key = item.counterCode;
            counter = item.counter;
            barcode = item.barcode;
            addtime = item.addtime;

        });
        this.getdatabycursor(db, storename).then(arr => {
            if (arr.length == 0) {
                //console.log("添加")
                var store = db.transaction(storename, 'readwrite').objectStore(storename),
                    request;
                for (var i = 0, len = dataArr.length; i < len; i++) {
                    request = store.add(dataArr[i]);
                    request.onerror = function () {
                        console.error('PUT添加数据报错');
                    };
                    request.onsuccess = function () {
                        if (callback && (typeof callback === 'function')) {
                            callback();
                        }
                    };
                }
            }
            else {
                this.read(db, storename, counter, barcode).then(x => {
                    if (x) {
                        this.updateDataByKeys(db, storename, key, addtime).then(() => {
                            this.getdata(db, storename).then(() => {
                                if (callback && (typeof callback === 'function')) {
                                    callback();
                                }
                            });
                        });

                    }
                    else {
                        //console.log("再次添加")
                        //console.log("当前的值是"+barcode)
                        var store = db.transaction(storename, 'readwrite').objectStore(storename),
                            request;
                        for (var i = 0, len = dataArr.length; i < len; i++) {
                            request = store.add(dataArr[i]);
                            request.onerror = function () {
                                console.error('PUT添加数据报错');
                            };
                            request.onsuccess = function () {
                                if (callback && (typeof callback === 'function')) {
                                    callback();
                                }
                            };
                        }

                    }
                })
            }
        })
    },
    //根据key修改数量
    updateDataByKey: function (db, storeName, value, QTY, addtime) {
        var transaction = db.transaction(storeName, 'readwrite');
        var store = transaction.objectStore(storeName);
        var request = store.get(value);
        return new Promise((resolve, reject) => {
            request.onsuccess = function (e) {
                var stocktable = e.target.result;
                if (stocktable) {
                    stocktable.qty = QTY;
                    stocktable.addtime = addtime;
                    resolve(store.put(stocktable));
                }
                else {
                    reject(false);
                }

            };

        })


    },

    updateDataBycode: function (db, storeName, value, QTY) {
        var transaction = db.transaction(storeName, 'readwrite');
        var store = transaction.objectStore(storeName);
        var request = store.get(value);
        return new Promise((resolve, reject) => {
            request.onsuccess = function (e) {
                var stocktable = e.target.result;
                if (stocktable) {
                    stocktable.qty = QTY;

                    resolve(store.put(stocktable));
                }
                else {
                    reject(false);
                }

            };

        })


    },
    //根据key修改数量
    updateDataByKeys: function (db, storeName, value, addtime) {
        var transaction = db.transaction(storeName, 'readwrite');
        var store = transaction.objectStore(storeName);
        var request = store.get(value);

        return new Promise((resolve, reject) => {
            //console.log(addtime)
            request.onsuccess = function (e) {
                var stocktable = e.target.result;
                if (stocktable) {
                    stocktable.qty += 1;
                    stocktable.addtime = addtime;
                    resolve(store.put(stocktable));
                }
                else {
                    reject(false);
                }

            };
        })

    },
    // 删除数据
    deleteData: function (db, storename, key, callback) {
        var store = db.transaction(storename, 'readwrite').objectStore(storename);
        store.delete(key);
        if (callback && (typeof callback === 'function')) {
            callback();
        }

    },
    // 清空数据
    clearData: function (db, storename, callback) {
        var store = db.transaction(storename, 'readwrite').objectStore(storename);
        store.clear();
        if (callback && (typeof callback === 'function')) {
            callback();
        }
    },
    // 通过key获取数据
    read: function (db, storeName, counter, barcode) {
        var transaction = db.transaction(storeName);
        var objectStore = transaction.objectStore(storeName);
        var currentdata = [counter, barcode];
        var indexs = objectStore.index('counter_code');
        var request = indexs.openCursor(IDBKeyRange.only(currentdata));
        return new Promise((resolve) => {
            request.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            }
        })


    },
    // 通过barcode获取数据
    reads: function (db, storeName, values) {
        var transaction = db.transaction(storeName);
        var objectStore = transaction.objectStore(storeName);
        var indexs = objectStore.index('barcode_index');
        var data = [];
        var request = indexs.openCursor(IDBKeyRange.only(values));
        return new Promise((resolve) => {
            request.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    data.push(cursor.value);
                    // resolve(data);
                    cursor.continue();
                }
                else {
                    resolve(data)
                }
            };
        })

    },
    //根据counter索引查询数据
    getDataByIndex: function (db, storeName,index, values) {
        var transaction = db.transaction(storeName);
        var store = transaction.objectStore(storeName);
        var indexs = store.index(index+'_index');
        var datas = [];
        var request = indexs.openCursor(IDBKeyRange.only(values))
        return new Promise((resolve) => {
            request.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    datas.push(cursor.value);
                    cursor.continue();
                }
                else {
                    resolve(datas)
                }
            }
        })


    },
    //根据主键和索引查询
    getAll: function (db, storeName, counter, barcode) {
        var transaction = db.transaction(storeName);
        var objectStore = transaction.objectStore(storeName);
        var counterCode = [counter, barcode];
        var indexs = objectStore.index('counter_code');
        var request = indexs.openCursor(IDBKeyRange.only(counterCode));
        var data = [];
        return new Promise((resolve) => {
            request.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    data.push(cursor.value);
                    //resolve(data);
                    cursor.continue();
                }
                else {
                    resolve(data)
                }

            }
        })
    },
    //根据key查询数量是否存在
    getqtyBykey: function (db, storeName, key) {
        var transaction = db.transaction(storeName);
        var objectStore = transaction.objectStore(storeName);
        var request = objectStore.get(key);
        request.onerror = function () {
            console.log('事务失败');
        };
        return new Promise((resolve) => {
            request.onsuccess = function () {
                if (request.result) {
                    //console.log(request.result.qty)
                    resolve(request.result);
                } else {
                    resolve(false);
                }
            };
        })

    },
    // //通过游标遍历数据
    getdatabycursor: function (db, storename) {
        var objectStore = db.transaction(storename).objectStore(storename);
        var dataList = [];
        return new Promise((resolve) => {
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    dataList.push(cursor.value)
                    cursor.continue();
                } else {
                    resolve(dataList);
                }

            };
        })

    },
    //查询所有的柜台
    getAllCounter: function (db, storename) {
        var transaction = db.transaction(storename);
        var store = transaction.objectStore(storename);
        var indexs = store.index('counter_index');
        var data = [];
        return new Promise((resolve) => {
            indexs.openCursor().onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    //    console.log(cursor.value.counter);
                    data.push(cursor.value.counter);
                    resolve(data);
                    cursor.continue();
                }
            }
        })
    },
    getdata: function (db, storename) {
        var objectStore = db.transaction(storename).objectStore(storename);
        var data = [];
        return new Promise((resolve, reject) => {
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    data.push(cursor.value)

                    resolve(data)
                }
                else {
                    reject(false)
                }

            };
        })
    },
    getqtybyqtyindex: function (db, storename) {
        var transaction = db.transaction(storename);
        var store = transaction.objectStore(storename);
        var indexs = store.index('qty_index');
        var sum = 0;
        return new Promise((resolve) => {
            indexs.openCursor().onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    sum += cursor.value.qty
                    cursor.continue();
                }
                else {
                    resolve(sum)
                }
            }
        })
    }
}