define(['controls/datasource'], function (SPDataSource) {
    return class SPParseDataSource extends SPDataSource {
        constructor(model, fields) {
            super();
            this.fields = fields;
            this.model = model;
            
        }
        async getObjectById(id) {
            return await new Promise((resolve, reject) => {
                let query = new Parse.Query(this.Model);
                this.fields.filter(f => f.type === 'manyToOne').map(f => {
                    query = query.include(f.id);    
                });
                query.get(id, {
                    success: (obj) => {
                        resolve(obj.simplify());
    
                   }, error: (e) => {
                    
                   }
                });
            });
        }
        async find(q) {
           return await new Promise((resolve, reject) => {
                let query = new Parse.Query(this.Model);
                if (q instanceof String ) {
                            
                    query =  query.contains('name', q);
                } else if (q instanceof Object) {
                    for (let k in Object.keys(q)) {
                        query = query.contains(k, q[k]);
                    }
                }
                query.find({
                    success: (objs) => {
                        resolve(objs.map(o => o.simplify()));
    
                   }, error: (e) => {
                    throw e;
                   }
                });
            });
        }
        get model() {
            return this._model;
        }
        set model(value) {
            this._model = value;
            this.Model = Parse.Object.extend(value);
        }
        get numberOfFields() {
            return Object.keys(this.fields).length;
        }
        getFieldByIndex(index) {
            return Object.values(this.fields)[index];
        }
        async saveOrUpdate(data) {
            return new Promise((resolve, fail) => {
                if (!!data.id) {
                    let q = new Parse.Query(this.Model);
                    q.get(data.id, {
                        success: (obj) => {
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
                                obj.save({
                                    success: (obj) => {
                                        resolve(obj);
                                    }, error: (e) => {
                                        throw e;
                                    }
                                });
                            }
                        }
                    })
                } else {
                    let obj = new this.Model();
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
                    obj.save({
                        error: (obj, error) => {
                            debugger;
                            throw error;
                            fail({
                                error: 'error'
                            });
                        },
                        success: (savedObject) => {
                            resolve(savedObject.simplify())
                        }
                    })
                }
            });
        }
        
    }
})