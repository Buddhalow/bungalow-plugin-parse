define(function() {
    return class ParseResolver {
        isAcceptingUri(uri) {
            return /^parse:(.*)/.test(uri);
        }
        async request(method, uri, options, data) {
            var model = capitalizeFirstLetter(uri.split(':')[1]);
            var id = uri.split(':')[2];
            if (/^parse:([a-zA-Z0-9]+):([a-zA-Z0-9]+)$/.test(uri)) {
                if (method == 'DELETE') {
                    
                } else if (method == 'PUT') {
                    let q = new Parse.Query(this.Model);
                    let obj = await q.get(data.id);
                    for (let f of this.table.fields) {
                        let k = f.id;
                        let val = data[k];
                        if (f.type == 'number') {
                            val = parseInt(val); 
                        } else if (f.type == 'datetime-local') {
                            val = new Date(val);
                        } else if (val instanceof Object) {
                            val = {"__type": "Pointer", "className": f.model.id, "objectId": val.id};
                        }
                        obj.set(k, val);
                        obj.save({
                            success: (obj) => {
                                resolve(obj);
                            }, error: (e) => {
                                throw e;
                            }
                        });
                    }
                } else {
                
                    let query = new Parse.Query(model);
                    this.fields.filter(f => f.type === 'manyToOne').map(f => {
                        query = query.include(f.id);    
                    });
                    let result = await query.get(id).simplify();
                    return result;
                }
            }
            if (/^parse:([a-zA-Z0-9]+)$/.test(uri)) {
                if (method == 'POST') {
                    let obj = new Parse.Object(model);
                    for (let f of this.fields) {
                        let k = f.id;
                        let val = data[k];
                        if (f.type == 'number') {
                                    val = parseInt(val); 
                        } else if (f.type == 'datetime-local') {
                            val = new Date(val);
                        } else if (val instanceof Object) {
                            val = {"__type": "Pointer", "className": f.model.id, "objectId": val.id};
                        }
                        
                        obj.set(k, val);
                    }
                    let result = await obj.save();
                    return result.simplify();
                } else {
                    let query = new Parse.Query(model);
                    if (options instanceof String ) {
                                
                        query =  query.contains('name', options);
                    } else if (options instanceof Object) {
                        for (let k in Object.keys(options)) {
                            let str = options[k];
                            if (str instanceof String) {
                            query = query.contains(k, str);
                            }
                        }
                    }
                    let result = await new Promise(function (resolve, reject) {
                         query.find({
                           success: function (objects) {
                               resolve({
                                   objects: objects
                               });
                           }  
                         });
                    });
                    result.objects = result.objects.map(o => o.simplify());
                    return result;
                }
            }
        }
    };
})