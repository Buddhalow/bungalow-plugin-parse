define(['controls/tabledatasource'], function (SPTableDataSource) {
    return class ParseTableDataSource extends SPTableDataSource {
        constructor(ParseClass, columns) {
            super();
            this.query = new Parse.Query(ParseClass);
            this.columns = columns || ['name'];
            this.rows = [];
            this.page = 0;
        }
        
        get objects() {
            let _objects = [];
            let numberOfRows = this.getNumberOfRows(null);
            for (let i = 0; i < numberOfRows; i++) {
                _objects.push(this.getRowAt(i));
            }
            return _objects;
            debugger;
        }
    
        /**
         * Fetch new data to the adapter
         **/
        async fetchNext() {
            this.page++;
            debugger;
            let newItems = await new Promise((resolve, fail) => {
                let query = this.query.descending('time');
                this.columns.map((c) => {
                    query = query.include(c)
                });
                query.find({
                    success: (items) => {
                        resolve(items.map(item => {
                            let obj = item.simplify();
                            return obj;
                        }));
                        debugger;
                    },
                    error: (e) => {
                        throw e;
                    }
               })
            });
            newItems.map((i) => this.rows.push(i));
            var event = new CustomEvent('change');
            if (this.onchange) {
                this.onchange.call(this, event);
            }
        }
    
        hasParent(row) {
            let has = !!row.spiritualAqtivity;
            return has;
        }
    
        getNumberOfRows(row) {
            if (!this.rows) return 0;
            if (row != null) {
                return this.getChildrenForRow(row).length;
            } else {
                return this.topRows.length;
            }
            return 0;
        }
        getObjectId(rowIndex) {
            return this.geItemAt(rowIndex).objectId;
        }
        get numberOfColumnHeaders () {
            return this.columns.length;
        }
        get topRows() {
             return this.rows.filter((r) => !this.hasParent(r));
        }
        getChildrenForRow(row) {
            return this.rows.filter((r) => {
                return !!r.spiritualAqtivity && r.spiritualAqtivity.id == row.id
            });
    
        }
        getRowAt(pos, row) {
            if (row != null) {
                return this.getChildrenForRow(row)[pos];
            } else {
                return this.topRows[pos];
            }
        }
    
        getColumnAt(pos) {
            return this.columns[pos];
        }
    
        getNumberOfChildren(row) {
            let roaming = !!row.physicalAqtivity;
            if (roaming)
                return 1;
            return 0;
        }
        refresh() {
            this.rows = [];
            this.page = 0;
            this.table.clear();
            this.fetchNext();
        }
        _getRowById(rowId) {
    
            let rows = this.rows.filter(r => {
                
                return r.id == rowId
    
            });
            if (rows.length < 1) return null;
            return rows[0];
        }
    };
})