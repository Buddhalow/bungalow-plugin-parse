define(['controls/tabledesigner'], function (SPTableDesigner) {
    return class SPParseTableDesigner extends SPTableDesigner {
        getCellElement(columnIndex, row) {
            let td = null; // document.querySelector('tr[data-uri="' + row.uri + '"] > td[data-column-index="' + columnIndex + '"]');
            if (!td) {
                td = document.createElement('td');
                td.setAttribute('data-column-index', columnIndex);
                td.created = true;
            } else {
                td.created = false;
            }
            td.innerHTML = '&nbsp';
            if (!row) return td;
             let columnId = this.table.dataSource.columns[columnIndex];
            let obj = row[columnId];
            if (obj instanceof Date) {
                    let time = obj;
                    if (!time) {
                        td.innerHTML = '';
                        return;
                        
                        
                    }
                    td.innerHTML = '<sp-datetime></sp-datetime>';
                    td.querySelector('sp-datetime').setState(time);
                 
            } else if (obj instanceof Object) {
                console.log(obj);
                td.innerHTML = '<sp-link uri="">' + obj.name + '</sp-link>';
    
                if (obj.roaming) {
                    td.innerHTML = ' <sup class="highlight">R</sup>';
                }
            } else if (!isNaN(obj)) {
                if (obj < 1 && obj > 0.00) {
                    td.innerHTML = '<sp-popularity value="' + obj + '"></sp-popularity>';
                } else {
                    td.innerHTML = obj; //numeral(obj).format('0,0');
                }
            } else {
                if (!!obj)
                td.innerHTML = '<span>' + obj + '</span>';
                let span = td.querySelector('span');
                if (!!span)
                    span.style.pointerEvents = 'none';
                let c = this.table.dataSource.getNumberOfChildren(row);
                if (c > 0) {
                    let dropdown = document.createElement(
                        'span'
                    );
                    dropdown.style.cssFloat = 'right';
                    dropdown.i = document.createElement('i');
                    dropdown.i.setAttribute('class',  'fa fa-arrow-down');
                    dropdown.appendChild(dropdown.i);
                    dropdown.classList.add('btn-small');
                    dropdown.addEventListener('click', (e) => {
                       if ($(td.parentNode).hasClass('open')) {
                            $('[data-parent-id="' + td.parentNode.getAttribute('data-id') + '"]').hide();
                            $('[data-parent-id="' + td.parentNode.getAttribute('data-id') + '"]').removeClass('open');
                            dropdown.querySelector('i').classList.remove('fa-arrow-up');
                            dropdown.querySelector('i').classList.add('fa-arrow-down');
                            $(td.parentNode).removeClass('open');
                            return;
                        }
    
                        $('[data-parent-id="' + td.parentNode.getAttribute('data-id') + '"]').show();
                        $('[data-parent-id="' + td.parentNode.getAttribute('data-id') + '"]').addClass('open');
                        dropdown.querySelector('i').classList.remove('fa-arrow-down');
                        dropdown.querySelector('i').classList.add('fa-arrow-up');
                        $(td.parentNode).addClass('open');
                    });
                    td.appendChild(dropdown);
                }   
            } 
            if (td.innerHTML === 'undefined') td.innerHTML = '';
            return td;
        }
    
        getRowElement(row) {
            let tr = document.querySelector('tr[data-uri="' + row.uri + "']");
            if (!tr) {
                tr = document.createElement('tr');
                tr.created = true;
                tr.setAttribute('data-id', row.id);
                let ctd = document.createElement('td');
                tr.appendChild(ctd);
                if (!row) return tr;
                this.ctd = ctd;
            } else {
                tr.created = false;
            }
            let negative = this.table.negative;
            let status = parseInt(row.status || row.statusCode || 0);
            tr.setAttribute('data-status', status);
            let effect = row.effect || 0;
            
            if (status == 0 && (negative || effect < 0)) {
                let cls = negative ? 'error' : 'success-x';
                tr.classList.add(cls);
            }
            
            if (row.time instanceof Date) {
                let diff = new Date() - row.time.getTime();
                let duration = 1000 * 60 * 60 * 24;
                if (diff < duration) {
                    this.ctd.span = document.createElement('span');
                    this.ctd.span.innerHTML = '&#x25cf;'
                    this.ctd.appendChild(this.ctd.span);
                    this.ctd.span.classList.add('new');
                    this.ctd.span.style.opacity = 1 - (diff / duration * 5);
                    
                }
            }
            
            if (status >= 0) {
              if (status >= 200 && status <= 299 ) {
                let cls = negative ? 'error' : 'success-x';
                tr.classList.add(cls);
              } else if (status >= 100 && status <= 199) {
                let cls = negative ? 'warning' : 'processing';
                tr.classList.add(cls);
                
              } else if (status >= 300 && status <= 300) {
                let cls = negative ? 'warning' : 'redirect';
                tr.classList.add(cls);
              } else if (status >= 400 && status <= 600) {
                let cls = negative ? 'success-x' : 'error';
              
                tr.classList.add(cls);
              }
              if ((status < 200 || status > 299) && 'time' in row && row.time instanceof Date && 'status' in row) {    
                    if ((new Date().getTime() - row.time.getTime()) > 1000 * 60 * 60 * 24 * 16) {
                         tr.classList.add('error');
                    }
                }
            }
            
            if (row.unavailable) {
              tr.classList.remove('error'); 
              tr.classList.add('error');  
            }
        
            return tr;
        }
        getHeaderRow() {
            let tr = document.createElement('tr');
    
            let ctd = document.createElement('th');
            tr.appendChild(ctd);
            this.ctd = ctd;
            return tr;
        }
        getColumnElementAt(columnIndex) {
            let th = document.createElement('th');
            let column = this.table.dataSource.getColumnAt(columnIndex);
            th.innerHTML = _e(column);
            return th;
        }
       
    };
})