 var sortfn = window.sort_custom || {};
 $(function () {
        var sort_fn = sort_custom= function (rowData1,rowData2,dataIndx){
        
        let val1 = rowData1[dataIndx],
        val2 = rowData2[dataIndx],
        c1 = $.trim(val1).length,
        c2 = $.trim(val2).length;
        if (c1 > c2) {
            return 1;
        }
        else if (c1 < c2) {
            return -1;
        }
        return 0;
    };

   // 복수 그리드를 하나의 엑셀시트로 구성하는 함수
    function _ExpertMultiGridSheet ( option, cb ){
        let sheet= {rows:[], mergeCells:[]},columns =[], nMaxCol = 0;
        let workbook = { sheets:[]}, _sheets ={ },
        _border ="1px solid #000000";
        
        option.sheets.forEach( function(obj, dataIndx){
           let _pq = obj.grid ? obj.grid:null, 
               _op =_pq ? _pq.options : null, _pqdata, pdata;

           //if ( option.multisheet || option.pagesheet )
           //    sheet= {rows:[], mergeCells:[]};
                 
           // 병합셀이 존재하고 부가행을 추가 하는경우 위치변경 
           if ( _pq && _op ){
                if ( option.multisheet || option.pagesheet ){
                    _op.mergeRowIndex =  obj.mergeRowIndex ? obj.mergeRowIndex : 0;
                }else{
                    _op.mergeRowIndex =  sheet.rows.length;
                }
           }
          
           // 서버에서 수신한 데이터를 임시로 복사
            if ( _op && obj._pqdata ){
                _pqdata  = _op.dataModel.data.slice(0) ||[];  // 현재 데이터 복사
                pdata    = _pq.pdata.slice(0) ||[]; 

                let data = obj._pqdata;
                if ( _op && obj.sorter){
                    data = _pq.sort( {
                        data : data, 
                        sorter:obj.sorter,
                        refresh : false
                    });
                };

                _op.dataModel.data = data.slice(0); // 수신한 데이터 복사
                _pq.pdata          = data.slice(0);
                //sortModel: { sorter: [{ dataIndx: 'company', dir: 'up' }], space: true },
            };

           // 엑셀내려받기시에 컬럼 표시/비표시 기능 
           let iCols = (obj.diShow || obj.diHide) ? _pq.Columns(): null , bCols = false;
           if ( iCols ){
                bCols = true;
                iCols.hide({
                    diShow: obj.diShow,
                    diHide: obj.diHide,
                    refresh : false 
                });
            };
            // 데이터 영역에 병합셀이 존재하는 경우
            let _mergeCells=[];
            if ( _pq && _op._mcColInfo && _pq.iRenderB._m() ){
                debugger;
                _mergeCells = (_pq.option("mergeCells")||[]).slice(0);
                autoMerge({ grid: obj.grid , Export:true});
                _pq.iMerge && _pq.iMerge.init();
                //_pq._trigger("dataReady", null, { source: "Export" });
            }

            // 그리드로 부터 엑셀데이터 취득
            let ex = { workbook: true, render:true, PM:{}};
            if ( _pq && option.pagesheet ) {
                ex.pagesheet = true;
                ex.PM = obj.PM;
                ex.sheetName = obj.sheetname;
                _pq.one("workbookPageReady", function(e, ui){
                    let w1 = ui.workbook.sheets[0];
                    console.log("workbookPageReady",w1, ui);
                    w1.columns.forEach( function(col){
                        col.border = {
                            left:_border,
                            right:_border,
                            top:_border,
                            bottom:_border
                        }
                    });
                });
            };

            let _wb = ((_pq && _pq.exportExcel(ex)) || { sheets:[{rows:[],mergeCells:[]}]}).sheets;
            _wb.forEach ( function(wb, _dataIndex){
                if ( option.multisheet || option.pagesheet ){
                   sheet= {rows:[], mergeCells:[]};
                   option.pagesheet && wb.name !== undefined && (sheet.name = wb.name);
                }

                if ( _op && _pqdata ){
                    _op.dataModel.data = _pqdata.slice(0); // 원본데이터 복사
                    _pq.pdata = pdata.slice(0);  _pqdata = null;
                };

                // 이전 병합셀을 다시 원복한다.
                if ( _pq && _op._mcColInfo && _pq.iRenderB._m() && _dataIndex == 0 ){
                    debugger;
                    _pq.option("mergeCells",_mergeCells );
                    _pq.iMerge && _pq.iMerge.init();
                    //_pq._trigger("dataReady", null, { source: "Export" });
                }
                
                if ( wb.columns ){
                    let c= [], hiddens=[];
                    wb.columns.forEach( function( obj, index ){
                        if ( obj.hidden === true ){
                            hiddens.push(index);    
                        }else{
                            c.push(obj);
                        }
                    });
                    
                    if ( hiddens.length > 0 ){
                        let rows = [];
                        pq.excel.eachRow( wb, function( row ){
                            var rowstr = [];
                            row.cells.forEach(function(cell, colIndex) {
                                let indx =  hiddens.findIndex( function( val, idx  ){
                                    return val == colIndex;   
                                });
                                if ( indx === -1 )
                                    rowstr.push(cell);
                            });
                            rows.push({cells:rowstr})
                        });
                        wb.rows = rows; 
                    }
                    nMaxCol = (option.multisheet || option.pagesheet) ? 0: Math.max(nMaxCol, c.length );
                    (option.multisheet || option.pagesheet )? sheet.columns = c: columns.push(c);
                }

                // 그리드가 아닌 데이터 표시
                if ( obj.rows ){
                    obj.rows.forEach ( function ( rows ){
                        let row=[], cells = rows.cells, mergeCells = rows.mc;
                        cells.forEach(function(cell){
                            row.push( cell );
                        })
                        wb.rows.push( {cells:row});

                    })
                };

                // 엑셀용 병합셀 구성한다.
                if( obj.mergeCells) {
                    wb.mergeCells = pq.ExceltoLetter(obj.mergeCells);
                }

                if ( bCols && iCols ){
                    bCols = false;
                    iCols.hide({
                        diShow: obj.diHide,
                        diHide: obj.diShow,
                        refresh : false 
                    });
                };

                if ( cb ){
                    cb.call(option, obj, wb );
                }

                if ( _op && _op.mergeRowIndex )
                    delete _op.mergeRowIndex;

               if ( wb.rows && wb.rows.length > 0 ){
                    sheet.rows =  sheet.rows.concat(wb.rows);
                    if ( obj.topAdd ) {
                        sheet.rows =  Array.apply(null, Array(obj.topAdd)).map(function(){return {} }).concat(sheet.rows);
                    }
                    if ( obj.bottomAdd ){
                        sheet.rows = sheet.rows.concat(Array.apply(null, Array(bottomAdd)).map(function(){return {} }));
                    }
                }


                if ( wb.mergeCells && wb.mergeCells.length > 0 )
                    sheet.mergeCells = sheet.mergeCells.concat(wb.mergeCells);

                if ( option.multisheet || option.pagesheet ){
                    if(obj.sheetname  !== undefined && option.multisheet)  sheet.name = obj.sheetname;  // 시트이름
                    if(obj.frozenRows !== undefined )  sheet.frozenRows = obj.frozenRows; // 행틀고정
                    if(obj.frozenCols !== undefined )  sheet.frozenCols = obj.frozenCols; // 열틀고정
                    
                    if ( obj.refgrid ){
                        _sheets[obj.refgrid.name] = {option:obj.refgrid, sheet:[sheet]};    
                    }else if(option.multisheet || option.pagesheet){
                        if ( obj.name ){
                            obj.name.forEach ( function(name){
                                let _sheet = _sheets[name];
                                if ( _sheet ){
                                    sheet.rows = _sheet.option.addmode ? _sheet.sheet[0].rows.concat(sheet.rows) : sheet.rows.concat(_sheet.sheet[0].rows); 
                                    if(_sheet.sheet[0].mergeCells.length > 0)
                                        sheet.mergeCells = _sheet.sheet[0].mergeCells.concat(sheet.mergeCells);
                                }
                            });
                            workbook.sheets.push(sheet);
                        }else{
                            workbook.sheets.push(sheet);
                        }
                    }
                };
            })

        });

        if ( !(option.multisheet || option.pagesheet)  ){
            if(option.sheetname !== undefined  ) sheet.name = option.sheetname;  // 시트이름
            if(option.frozenRows !== undefined ) sheet.frozenRows = option.frozenRows; // 행틀고정
            if(option.frozenCols !== undefined ) sheet.frozenCols = option.frozenCols; // 열틀고정
        }

        let getMaxCol = function(columns, colIndex ){
            let col ={}, cols=[];
            for ( let i = 0; i < columns.length; i++ ){
                cols.push( columns[i][colIndex] || {width:0});
            }
            col = cols.reduce(function(res, obj) {
                 return (obj.width > res.width) ? obj : res;
            });
            return col;
        } 
        debugger;
        let _columns =[]; 
        for ( let i = 0 ; i < nMaxCol; i++){
            _columns.push( getMaxCol ( columns, i ));
            _columns.forEach ( function(col){
                col.border = {
                    left:_border,
                    right:_border,
                    top:_border,
                    bottom:_border
                }
            })
        }

        if ( nMaxCol > 0 ){
            sheet.columns = _columns; 
            workbook.sheets.push(sheet);
        }

        // 파일명
        let fileName = option.filename ? option.filename+".xlsx" : "exelfile.xlsx";  
        let objWB = {workbook:{sheets:workbook.sheets},
                     replace : option.replace,
                     type: 'blob'};

        var blob = pq.excel.exportWb(objWB);//export 1st workbook into Excel file.
        if ( option.debug ) saveAs(blob, "pqgrid" );
        saveAs(blob, fileName );

    };
     // window._ExpertMultiGridSheet = null;
     // window._ExpertMultiGridSheet = _ExpertMultiGridSheet;
    function _column_editbale(ui){
        let self = this, rowIndx =  ui.rowIndx, dataIndx = ui.column.dataIndx,  rowData = ui.rowData;
        let pq_rowprop = (rowData.pq_rowprop || {} );
        // 행 단위 입력불가  
        if ( ui.column.enable === false || pq_rowprop.edit === false) return false ;
        
        if ( dataIndx ==  "ProductName" || dataIndx =='chk')
           return !(ui.rowData.ProductName.length > 18);
        
        if ( dataIndx == 'Discontinued')
            return !rowData.disabled;
       
        return true;

    };

   // $(document).ready(function(){

      debugger;
      let grid1;
      grid1 = grid1Init("#grid_checkbox");


      // editable : true
      /*
      grid1.editable = function(ui){
        let self = this;
        // pq_rowprop={edit:true }  
        return true;
      };
*/
      //grid1.option( {disabled: true} );
      // 행단위 활성화 여부 
      grid1.option('editable', function(ui){
        let self = this, rowIndx =  ui.rowIndx,  rowData = ui.rowData;
        let pq_rowprop = (rowData.pq_rowprop || {} );
        // 행 단위 입력불가  
        if ( pq_rowprop.edit === false) return false;

        // pq_rowprop={edit:true }  
        return true;
      } );

      let CM1 = grid1.getColModel( ), // array
          columns = grid1.columns, //object
          CM2 = grid1.option('colModel');
          
     let iCols = grid1.Columns(),extend = $.extend,
        $pq = $.paramquery ;
     iCols.each ( function(col){
       // console.log(col);
        if( col.dataIndx == "ProductName"){
            extend ( col,{ cbId:'chk', 
                           disabled_cls:"disable",
                           enable:true,           
                           useLabel:true,
                           editor : {cls:"pq-editor-focus-custom",
                                    attr:"maxlength=10 placeholder=최대입력길이10글자"
                                  },
                            editable : function(ui){
                                return _column_editbale.call( this, ui);
                            },
                           renderLabel  : function (ui) {
                            if ( ui.Export ) return ui.rowData.ProductName;
                            let text = ui.rowData.ProductName,
                            //px = this.iRenderB.getWidthCell(ui.colIndx)-30 + "px",
                            //html = "<div class= 'pq-grid-cell-editcell' style =width:"+ px +";>"+ text +"</div>";
                            html = "<div class= 'pq-grid-cell-editcell'>"+ text +"</div>";
                            
                            return html;
                        }                                
           }
          );
         /* 
         let iCB = grid1.Checkbox(col.dataIndx );
         if ( iCB[col.dataIndx] ){ 
            iCB[col.dataIndx].destroy();
            delete iCB[col.dataIndx];
         }
         iCB[col.dataIndx] = new pq.cCheckBoxColumn(grid1, col) ;
         */  
        }
     }, CM1);
     //grid1.refreshDataView();
     //grid1.refreshCM();
     //grid1.refresh();
     grid1._initTypeColumns({type:'checkbox', refresh:true});
    
    // 최솟값과 최댓값을 모두 포함하는 결과
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //최댓값도 포함, 최솟값도 포함
      }

    function grid1Init(id) {
        debugger;
        
        var data = [
            { "ProductID": "17", "ProductName": "Alice Mutton", "QuantityPerUnit": "20 - 1 kg tins", "Discontinued": "YES", "state":true },
            { "ProductID": "3", "ProductName": "Aniseed Syrup", "QuantityPerUnit": "12 - 550 ml bottles", "Discontinued": "NO" , pq_cellprop:{state:{edit:false}}},
            { "ProductID": "40", "ProductName": "Boston Crab Meat", "QuantityPerUnit": "24 - 4 oz tins", "Discontinued": "NO" ,"state":true},
            { "ProductID": "60", "ProductName": "Camembert Pierrot", "QuantityPerUnit": "15 - 300 g rounds", "Discontinued": "NO", "disabled": true ,"check":true},
            { "ProductID": "18", "ProductName": "Carnarvon Tigers", "QuantityPerUnit": "16 kg pkg.", "Discontinued": "NO", "check":true },
            { "ProductID": "1", "ProductName": "Chai", "QuantityPerUnit": "10 boxes x 20 bags", "Discontinued": "NO" ,"check":true},
            { "ProductID": "2", "ProductName": "Chang", "QuantityPerUnit": "24 - 12 oz bottles","check":true },
            { "ProductID": "39", "ProductName": "Chartreuse verte", "QuantityPerUnit": "750 cc per bottle", "Discontinued": "NO","check":true },
            { "ProductID": "4", "ProductName": "Chef Anton's Cajun Seasoning", "QuantityPerUnit": "48 - 6 oz jars", "Discontinued": "NO" },
            { "ProductID": "5", "ProductName": "Chef Anton's Gumbo Mix", "QuantityPerUnit": "36 boxes", "Discontinued": "YES" },
            { "ProductID": "48", "ProductName": "Chocolade", "QuantityPerUnit": "10 pkgs.", "Discontinued": "NO","state":true },
            { "ProductID": "38", "ProductName": "Cte de Blaye", "QuantityPerUnit": "12 - 75 cl bottles", "Discontinued": "NO" },
            { "ProductID": "58", "ProductName": "Escargots de Bourgogne", "QuantityPerUnit": "24 pieces", "Discontinued": "NO","check":true },
            { "ProductID": "52", "ProductName": "Filo Mix", "QuantityPerUnit": "16 - 2 kg boxes", "Discontinued": "NO" },
            { "ProductID": "71", "ProductName": "Flotemysost", "QuantityPerUnit": "10 - 500 g pkgs.", "Discontinued": "NO" ,"check":true},
            { "ProductID": "33", "ProductName": "Geitost", "QuantityPerUnit": "500 g", "Discontinued": "NO","state":true },
            { "ProductID": "15", "ProductName": "Genen Shouyu", "QuantityPerUnit": "24 - 250 ml bottles", "Discontinued": "NO" },
            { "ProductID": "56", "ProductName": "Gnocchi di nonna Alice", "QuantityPerUnit": "24 - 250 g pkgs.", "Discontinued": "YES" ,"check":true},
            { "ProductID": "31", "ProductName": "Gorgonzola Telino", "QuantityPerUnit": "12 - 100 g pkgs", "Discontinued": "NO" },
            { "ProductID": "6", "ProductName": "Grandma's Boysenberry Spread", "QuantityPerUnit": "12 - 8 oz jars", "Discontinued": "YES","check":true }
        ];
        // 랜덤하기 데이터 구성
        data.forEach(function(rd,idx){
            //rd.test  = generateRandomString ( 10);
            //rd.test1 = generateRandomString ( 10);
            rd.test  = getRandomIntInclusive ( 1, 999999999999);
            rd.test1  = getRandomIntInclusive ( 1, 999999999999);
            
        })
        var obj = {
// --> [START] 수정자: Kim changeha 수정일자:2020:09:23
//수정내용> {task1}: 방향키 이동시에 행 자동이동시에 이벤트 필요한 경우 사용법
            // row 선택모드인 경우 변경시 발생되는 이벤트 함수
            rowSelect : function (evt, ui) {
              console.log('rowSelect', ui);
            /*var str = JSON.stringify(ui, function(key, value){                    
                if( key.indexOf("pq_") !== 0){
                    return value;
                }
            }, 2)
            $("#rowSelect_pre").html(str);*/                

            },
            // col 선택모드인 경우 변경시 발생되는 이벤트 함수
            selectChange : function (evt, ui) {
                console.log('selectChange==>', ui);
                let address = ui.selection.address();
            },
//<-- [End]
            // 체크박스 선택후 계속처리 유무를 판단
            /*
            beforeCheck: function (e, ui){
                // 특정조건을 제어하는 기능
                return true;
            },
            */
            // Checkbox 선택시 발생되는 이벤트 함수
            check: function(e, ui){
              if ( ui.source == "header") return;

              console.log("check====>", ui );
              let _dataIndx = ui.dataIndx == "ProductName"? "chk": ui.dataIndx,  // 숨긴체크박스 아이템명으로 변경 
                  _check    = ui.check,
                  that = this, // 그리드 객체
                  items =["check","state", "chk"]; // 3개 컬럼 동기화 처리
              
              // 대상외 항목아이템을 취득한다.
              let _rows = ui.rows,_rowData; 
              arItems = items.filter( function(item){
                   if(item != _dataIndx) return item;
              });

              // 각 체크데이터 반대값으로 지정( item->데이터 순으로 변경)
              let changedItems = arItems.filter ( function(item){
                // 변경된 아이템 정보가 있으면 아이템명을 반환한다.
                let count = _rows.filter ( function( rd ){
                    // Editable false 이면 값을 변경 해서는 안된다.
                    let ui = {dataIndx: item,        // 데이터  아이템
                              rowIndx : rd.rowIndx,  // 행 위치
                              rowData:  rd.rowData    // 원본 레코드 데이터 
                            };
                    //  열, 행 단위순으로 활성화 여부를 체크한다.        
                    if ( that.isEditable ( ui ) !== false ){
                        rd.rowData[item] = _check ? false : false;
                        return true;  
                    }
                });  
                if ( count.length > 0 ) return item;
              });

              // 변경된 체크 컬럼의 UI 및 헤더 정보갱신한다.
              changedItems.forEach( function(item){
                    let iCheckBox = that.Checkbox(item);
                    iCheckBox && iCheckBox.onDataReady();
              });

            },

            // 모든 이벤트 콜백함수
            allEvents : function (e, ui){
                let self = this, o = self.options, type = e && e.type ? e.type.split(':')[1] : "";
                if ( o.debug )
                    console.log("allEvents-->", type, ui);
            },
            exportOption : {subitem:2},  //  2줄 표시 옵션
            scrollModel: { autoFit: false },
            numberCell: { show: true },
            menuIcon:true,
            menuInDisable : true,        
            menuInClose : true,
            autoRow : false,
            wrap:false,
            rowHt:70,
            freezeCols : 2,
            title: "Checkbox column",            
            height: "80%",
            pageModel: { type: "local", rPP: 10 },
            formulasModel : {on:false},
            sortModel:{wholeCell:true}, //  헤더영역 확장클릭효과
            //hoverMode : "row",
            fillHandle : "",
            //copyModel : {render:true},
            selectionModel: { type:"row", row: true, mode:'single', sortRow:{selMove:true} },  
// --> [START] 수정자: Kim changeha 수정일자:2020:09:24
//수정내용> {task1}:[기능추가]방향키 이동시에 행 자동이동 기능
// 1) 소트시에 반전상태 유지 또는이동기능, 스크롤 이동유무 처리
// selectionModel={ sortRow : {selMove:false,   false:반전상태 유지(기본값), true: 현재상태 유지 
//                                scrollRow : "top", "top": 상단, "center":중앙
//                               }          
           /*
            selectionModel: { type:"row", row: true, mode:'block', 
                              sortRow:{selMove:true, scrollRow:"top" }
                             }, 
           */
//<-- [End]

            editModel : { clicksToEdit :1,  addDisableCls: false, onTab:"nextEdit",onSave:"nextEdit"},
            toolbar: {
                items: [
                {
                    type: 'button',
                    label: "CheckBox",
                    icon: 'ui-icon-gear',
                    listener: function () {
                        debugger;
                        //exportData.call(this, 'xlsx');
                        //this._initTypeColumns({type:'checkbox', refresh:true});
                        //return;
                        let self = this,
                        Checkbox = self.Checkbox( 'ProductName' ),
                        arList = Checkbox.getCheckedNodes(true);
                        bCheck = Checkbox.isHeadChecked();
                        console.log(arList,bCheck );
                    }
                },
                {
                        type: 'checkbox',
                        attr: 'id="sort_all_chk" checked="true"',
                        label: 'CheckBox enable',
                        listener: function (evt) {
                            debugger;
                            let enable =$(evt.target).prop("checked"),
                                that = this,
                                items=['state', 'ProductName','Discontinued'];
                                items.forEach( function(item){
                                    // 헤더 체크박스 활성화/비활성화 하는 기능 
                                    that.Checkbox( item ).onHeaderCheckEnable({enable:enable});
                                }) 
                        }
                 },
                 {
                        type: 'button',
                        label: 'Export',
                        listener: function () {
                            let self = this, option={
                            filename : "그리드 페이지",
                            sheetname : "데이터",
                            frozenRows:1,
                            sheets: [
                                   { grid:self}
                                ]
                            };
                            //_ExpertMultiGridSheet ( option );
                            exportXLSData.call(this, "xlsx");
                        }
                    }
               ]                           
            },
            contextMenu: {
                on: true,
                //callback used to create dynamic menu.
                items: function (evt, ui) {
                    return bodyItems.call(this, evt, ui);      
                    //return (ui.$th ? headItems.call(this, evt, ui) : bodyItems.call(this, evt, ui));
                }
            },            
            columnTemplate: { halign: 'center', align: 'center' },
            colModel : [
              { title: "check", dataIndx: "check", align: "center", 
                        menuIcon: false,width : 95,
						type: 'checkbox',  editor: false,
                        dataType: 'bool',
                        editor : false, // edit 안되게 하는 옵션
                        hchkboxpos:"top", // Top 위치표시
						cb: {
							all: true, //checkbox selection in the header affect current page only.
							header: true //show checkbox in header. 
                        }
                },
                { title: '병합셀1', cls: 'yellow',
                  colModel : [
                        { title: "state", dataIndx: "state", align: "center", 
                        menuIcon: false,width : 95,
						type: 'checkbox',  sortable: false, editor: false,
                        dataType: 'bool',
                        editor : false, // edit 안되게 하는 옵션
						cb: {
							all: true, //checkbox selection in the header affect current page only.
							header: true //show checkbox in header. 
                        },
                        editable: function (ui) {
                            //to make checkboxes editable selectively.
                            //return false;
                            if ( ui.column.enable === false ) return false; 
                        },                        
                      },
                      { title: "ID", width: 70, maxWidth: 70, minWidth: 70,
                        sortType : "sort_custom",
                        render : function (ui){
                            if ( ui.Export ){
                               ui.column._dataIndx=["ID", ""];
                               return { text: [ ui.cellData, "" ], prop:[{align:"right"}]}
                           }
                        },
                        dataType: "integer",  dataIndx: "ProductID"
                     },
                     { 
                        title: "Product Name", 
                        width: 325,align: 'left',       
                        dataIndx: "ProductName",
                       // cls : "customedit",
                        type: 'checkbox',
                        hchkboxpos : "right", // 기본 "left" , "right" : 오른쪽
                        //checkbox_right : true,
                       // editModel : {onTab:"nextEdit",onTab:"nextEdit"},
                        //cbId: 'chk',
                        //disabled_cls:"disable",
                        //enable:false,
                        //useLabel: true,
                        /*
                        editor : {cls:"pq-editor-focus-custom",
                                  attr:"maxlength=20"},  // 입력최대 길이
                        renderLabel : function (ui) {
                            let text = ui.rowData.ProductName,
                            //px = this.iRenderB.getWidthCell(ui.colIndx)-30 + "px",
                            //html = "<div class= 'pq-grid-cell-editcell' style =width:"+ px +";>"+ text +"</div>";
                            html = "<div class= 'pq-grid-cell-editcell'>"+ text +"</div>";
                            
                            return html;
                        },
                        
                        editable: function(ui){
                            if ( ui.column.enable === false ) return false; 
                            return !(ui.rowData.ProductName.length > 18);
                        },*/
                        render : function( ui){
                            if( ui.Export ){
                               ui.column._dataIndx=["ProductName",""];
                               return { text: [ ui.cellData, "" ], prop:[{align:"right"}] }
                           }
                           if( ui.column.enable === false )
                               return { cls : "disable"};  
                        }
                    }]    
                },
                { title: '병합셀2',
                   colModel:[
                    //column to store checkbox state of ProductName.
                    {
                        dataIndx: 'chk',
                        dataType: 'bool',
                        cb: {
                            all: true,   //header checkbox to affect checkboxes on all pages.
                            header: true, //for header checkbox.
                            select : false // When select is true, selection of rows gets bound to checkboxes.
                        },
                        hidden: false,
                        editable: function(ui){
                            //return true;
                            return _column_editbale.call( this, ui );                            
                            //to make checkboxes editable selectively.
                            //if ( ui.column.enable === false ) return false; 
                            //return !(ui.rowData.ProductName.length > 18);
                        },
                    },
                    { title: "Quantity Per Unit", width: 204, align: 'left',  dataIndx: "QuantityPerUnit",
                            editor :{ select : true,
                                      style: 'border-radius:2px;  background-color: #ffff00;' 
                                     },
                            editable: function(ui){
                            return _column_editbale.call( this, ui );
                        },
                    }
                   ]
                },
                {title:"상단컬럼",dataIndx :"test1",
                colModel:[{title:"하단컬럼",dataIndx :"test",align:"center",editable:false, dataType : "integer",width: 204,
                     render : function(ui){
                     if ( ui.Export){
                            ui.column._dataIndx=["test", "test1"];
                            return { text: [ ui.cellData, ui.rowData.test1 ],
                                    prop:[{align:"right"}, {align:"center"}],
                                    style:[{"background-color":"#FFFF00"}]}
                    }else{
                        let text = "<div class='pq-multi_line'>" + pq.formatNumber(ui.cellData,"#,###") + "</div>" + "<div class='pq-align-right'>" + pq.formatNumber(ui.rowData.test1,"#,###")+ "</div>"
         
                        return {text:text};
                    }
                 }
                }]
                },
                { title: '병합셀3', cls: 'yellow',
                    colModel:[
                    {
                        //custom title.    
                        //title: "Availability<br/><label><input type='checkbox'/>Select All </label>",
                        title: "Availability", //<br/><label><input type='checkbox'/>Select All </label>",
                        dataIndx: "Discontinued",
                        align: 'center',
                        width : 168,
                        type: 'checkbox', //required property.
                        hckboxpos : "right", // 기본 "left" , "right" : 오른쪽
                        cb: {
                            all: true,   //header checkbox to affect checkboxes on all pages.
                            header: true, //for header checkbox.
                            select : false, // When select is true, selection of rows gets bound to checkboxes.
                            check: "YES", //check the checkbox when cell value is "YES".
                            uncheck: "NO" //uncheck when "NO".
                        },
                        /*
                        //renderLabel is optional.
                        renderLabel: function (ui) {                            
                            var cb = ui.column.cb,
                                cellData = ui.cellData,                                
                                disabled = this.isEditableCell(ui) ? "" : "disabled",
                                text = cb.check === cellData ? 'TRUE' : (cb.uncheck === cellData ? 'FALSE' : ui.Export ? "unknown" : "<i>unknown</i>");
                            return text;                                                           
                        },
*/
                        editor: true, //cell renderer i.e., checkbox serves as editor, so no separate editor.
                        editable: function (ui) {
                            return _column_editbale.call( this, ui );
                            //to make checkboxes editable selectively.
                            //return false;
                            //if ( ui.column.enable === false ) return false; 
                            //return !ui.rowData.disabled;
                        },
                        //checkbox_right:true,
                        useLabel: true,
                        editfocus : false
                    },
                    {
                        title: 'Is Available',
                        width : 173,
                        editable: false,
                        render: function (ui) {
                            var column = this.getColumn({ dataIndx: 'Discontinued' }),
                                state = ui.rowData.Discontinued,
                                check = column.cb.check,
                                uncheck = column.cb.uncheck;
                            if (state === check) {
                                return ui.Export ?{text: ["Available",""]} : "Available";
                            }
                            else if (state === uncheck) {
                                return ui.Export ?{text: ["Out of Stock",""]} : "Out of Stock"
                            }
                        }
                    }                                               
                    ]
                },
            ],

            dataModel: {
                //location: 'remote',
                //url: "/Content/products.json"
                data: data
            }
        };        
        return  pq.grid(id, obj);
    };



var newData = [[1, 'Exxon Mobil', 'Ex', 339938.0, 36130.0, 23333.0],
            [2, 'Wal-Mart Stores', 'WS', 315654.0, 11231.0, 24342.0],
            [3, 'Royal Dutch Shell', 'RDS', 306731.0, 25311.0, 56231.2],
            [4, 'BP', 'B', 267600.0, 22341.0, 71923.4],
            [5, 'General Motors', 'GM', 192604.0, -10567.0, 52934.0],
            [6, 'Chevron', 'C', 189481.0, 14099.0, 12023.5],
            [7, 'DaimlerChrysler', 'DC', 186106.3, 3536.3, 42734.0],
            [8, 'Toyota Motor', 'TM', 185805.0, 12119.6, 57023.4],
            [9, 'Ford Motor', 'FM', 177210.0, 2024.0, 22896.0],
            [10, 'ConocoPhillips', 'CP', 166683.0, 13529.0, 72456.0],
            [11, 'General Electric', 'GE', 157153.0, 16353.0, 16912.5],
            [12, 'Total', 'T', '152360.7', 15250.0, 74236.5],
            [13, 'ING Group', 'IG', 138235.3, 8958.9, 52012.9],
            [14, 'Citigroup', 'CG', 131045.0, 24589.0, 90342.0],
            [15, 'AXA', 'A', 129839.2, 5186.5, 13043.8],
            [16, 'Allianz', 'AZ', 121406.0, 5442.4, 19529.5],
            [17, 'Volkswagen', 'VW', 118376.6, 1391.7, 84472.7],
            [18, 'Fortis', 'F', 112351.4, 4896.3, 83473.0],
            [19, 'Crédit Agricole', 'CA', 110764.6, 7434.3, 14567.4],
            [20, 'American Intl. Group', 'AIG', 108905.0, 10477.0, 10533.0]];


function _onCMChange ( grid  ) {

    let CM1 =  [
            { title: "Some No", colModel: [] },
            { title: "Company", width: 140, align: "center", colModel: [{ title: "Company A" }, { title: "Company B"}] },
            { title: "Balance Sheet", align: "center", colModel: [
                { title: "Revenues ($ millions)", dataType: "float", align: "center", colModel: [
                    {
                        title: "Domestic",  dataIndx: 3, format: '$##,###.00', dataType: "float"
                    },
                    {
                        title: "Exports",dataIndx: 4,format: '$##,###.00',  dataType: "float"
                    },
                    {
                        title: "Total",  width: 120, editable: false,  dataIndx: 6, dataType: "float", format: '$##,###.00'
                    }
                ]},
                {
                    title: "Expenditure ($ millions)", dataType: "float", format: '$##,###.00', dataIndx: 5
                },
                {
                    title: "Profits = Revenues - Expenditure",  width: 140,  dataType: "float", editable: false, dataIndx: 7,
                    format: '$##,###.00'
                }
            ]},        
            { title: "Rank", align: 'center', colModel: [
                { title: "Rank1" }, 
                { title: "Rank2", colModel: [
                    { title: "Rank21" },
                    { title: "Rank 22", colModel: [
                        { title: "Rank 221" },
                        { title: "Rank 222", colModel: [
                            { title: "Rank 2221" },
                            { title: "Rank 2222" },
                            { title: "Rank 2223" }
                        ]}
                    ]}                    
                ]},
                { title: "Rank 3" }
            ]},
            {
                title: "Column", colModel: [{ title: "Column1", type:"checkbox", cb:{header:true} }, { title: "Column2"}]
            }
        ];
debugger;
    let that = grid, _pq = $.paramquery;
    clearTimeout(grid._CMCtimer);
    grid._CMCtimer = setTimeout(function() {
        clearTimeout(that._CMCtimer);
 // 전체컬럼삭제     
         that.Columns().remove(-1,-1, that.getColModel(),"all");

        //that.option("dataModel.data", []); // 데이터 초기화
        //that.refreshDataAndView(); // 전체 빈 화면표시 
        that.refreshCM(CM1);   // 신규컬럼정보 설정
        let columns = that.getColModel();
        columns.forEach(function(col) {
            that.iCheckBox = that.iCheckBox || {}; 
            if (col.type == "checkbox") {
               that.iCheckBox[col.dataIndx] = new _pq.cCheckBoxColumn(that, col);
           }
        });
        //that._initTypeColumns({type:'checkbox', refresh:true} );
        // 통신을 요청한다.
        that.option("dataModel.data",newData );
        that.refreshDataAndView();

    }, 50 );
/*

    grid.one("CMInit", function() {
        clearTimeout(that._CMCtimer);
        that._CMCtimer = 0;

    });
*/
};


function _action ( ui, item ){
    console.log(ui, item);
    let grid = this, key = item.name,  rowIndx =  ui.rowIndx,
     enable = true, rowData = ui.rowData,
     dataIndx = ui.column.dataIndx,
     that = this;
    if ( key == "컬럼변경"){
        debugger;
        _onCMChange (grid );
        return;
    }


    // --> [START] 수정자: Kim changeha 수정일자:2020:09:23
    //수정내용> {task3}:[기능추가] 체크박스 관련 기능 추가
    // 5) 각셀의 체크상태값을 취득하는 신규함수
    // ui ={rowIndx:rowIndx }    
    if ( key == "CheckBox변경"){
        debugger;
        let iCheckBox = that.Checkbox( dataIndx ); 
        if ( iCheckBox ){
            // 현재 체크상태를 취득한다.
            let _check = iCheckBox.getCheckStatus ( {rowIndx:rowIndx});
            // 선택한 체크박스 토클 시킨다.
            iCheckBox.checkNodes([rowData], !_check);  // 이벤트 발생
        }
        return;
    }
    //<-- [End]

    // 행활성화, 행비활성화
    if ( key == "행비활성화"){
        enable = false;
    };
    let pq_rowprop = rowData.pq_rowprop = (rowData.pq_rowprop || {});  
    pq_rowprop.edit = enable;
    grid.refreshRow( {rowIndx:rowIndx} );
    // pq_rowprop.edit

}    
 //provides menu items for body cells.
 function bodyItems(evt, _ui) {
    let dataIndx = _ui.dataIndx;
    return [
        {
            name: '행단위 제어',
            subItems: [
                {
                    name: '행활성화',
                    action: function (evt, ui, item) {
                        _action.call ( this, ui, item );
                    }
                },
                {
                    name: '행비활성화',
                    action: function (evt, ui, item) {
                        _action.call ( this, ui, item );
                    }
                },
                {
                    name: '컬럼변경',
                    action: function (evt, ui, item) {
                        _action.call ( this, ui, item );
                    }
                }

            ]
        },
        {
// --> [START] 수정자: Kim changeha 수정일자:2020:09:24
//수정내용> {task3}:[기능추가] 체크박스 관련 기능 추가
// 5) 각셀의 체크상태값을 취득하는 신규함수
            name: "CheckBox변경",
            tooltip : "checkbox 셀이 존재하는 경우만 활성화<BR>체크상태를 토글하는 기능 ", 
            disabled: this.Checkbox( dataIndx ) ? false : true,  // 체크박스 컬럼여부 판단
            action: function (evt, ui,item) {
                _action.call ( this, ui, item );
            }
//<-- [End]
},        
        {
        name: 'Rename',
        action: function (evt, ui) {
            var grid = this,
                column = ui.column,
                title = column.title;
            title = prompt("Enter new column name", title);
            if (title) {
                grid.Columns().alter(function () {
                    column.title = title;
                    })
                }
            }
        }, 
        {
            name: '병합',
            subItems: [
                        { name: 'Merge cells',
                            action: function (evt, ui) {
                                debugger;
                                this.Selection().merge();
                            }
                        },
                        { name: 'Unmerge cells',
                           action: function (evt, ui) {
                                debugger;
                                this.Selection().unmerge();
                          }
                        },        
                   ]
        },
        'separator',
        {
            name: 'Export',
            subItems: [
                {
                    name: 'csv',
                    action: function () {
                        exportData.call(this, 'csv');
                    }
                },
                {
                    name: 'html',
                    action: function () {
                        exportData.call(this, 'html');
                    }
                },
                {
                    name: 'json',
                    action: function () {
                        exportData.call(this, 'json');
                    }
                },
                {
                    name: 'xlsx',
                    action: function () {
                        exportData.call(this, 'xlsx');
                    }
                }
            ]
        },
        {
            name: "Redo",
            icon: 'ui-icon ui-icon-arrowrefresh-1-s',
            disabled: !this.History().canRedo(),
            action: function (evt, ui) {
                //debugger;
                this.History().redo();
            }
        },
        'separator',
        {
            name: "Copy",
            icon: 'ui-icon ui-icon-copy',
            shortcut: 'Ctrl - C',
            tooltip: "Works only for copy / paste within the same grid",
            action: function (evt, ui) {
                debugger;
// --> [START] 수정자: Kim changeha 수정일자:2020:09:22
//수정내용> {task2}: [기능추가]팝업메뉴 또는 외부함수로 복사기능 ( ctl+c )기능 제외
                // ui={$td:$td...}
                //console.log(ui);                
                this.exportCopy ( ui ); // ctl+c 단축키를 사용하지 않는 경우
               // return this.copy();   //그리드 내 복사후 같은 그리드내 붙여넣기 기능
//<-- [End]  
            }
        },
        {
            name: "Paste",
            icon: 'ui-icon ui-icon-clipboard',
            shortcut: 'Ctrl - V',
            //disabled: !this.canPaste(),
            action: function () {
                this.paste();
                //this.clearPaste();
            }
        }
    ]
};



function exportXLSData(format) {
    debugger;
        let that = this, iRH = that.iRenderHead,
        data = that.option("dataModel.data"), dataLen=data.length;
        //exportOption={subitem:2}
        //_colModel = that.colModel.slice(0),
        //_colModel =deepCopy(that.colModel),
        //_colModel = JSON.parse(JSON.stringify(that.colModel));
        //hc =_headerCells = that.headerCells.map(function(cols) {
        //    return cols.slice();
        //}),

        //CM = _colModel.filter( function(col){
          //  if ( col.dataIndx != "chk") return col;
        //}),
        //CMLen = CM.length,
        //hcLen = hc.length;
        /*
        hc.forEach( function( cols, r ){
            cols.forEach( function(col, c){
                if ( col.dataIndx == "chk" ) {
                    col.hidden = true;
                };

                if ( col.dataIndx == "test" ){
                    col.rowSpan = col.colSpan = 1;  // 병합셀 해제
                   if ( r == 1 ){
                        col.title   ="임시컬럼1";
                        col.dataIndx="test1";
                   } 
                }
            })
        });
*/
        let iCols = that.Columns(), CM1 = that.getColModel( );
        iCols.each ( function(col){
            if( col.dataIndx == "test" ){
                col._excelRender = function ( ui ){
                    if ( ui.rowIndx == 0 ) return { colSpan:1, rowspan:1 };
                    if ( ui.rowIndx == 1 ) return { title:"임시컬럼1", colSpan:1, rowspan:1 };
                };
            }
        },CM1);

        let r = dataLen*2+2+3;
        let option={
            filename: "테스트파일",
            frozenRows:2, 
            frozenCols:0,
            sheets: [
                        { grid:that, name:['grid2_2'], bottomAdd:3, diShow:[], diHide:["state","chk", "Discontinued"], frozenRows:2, sheetname:"Test2"
                        },
                        
                        {
                        rows : [{cells: [
                                        { value:"종목코드", indx : 1,bgColor:'#e1e1e1', align:'center' , bold:"bold"},
                                        { indx : 2},
                                        { value:'0124560', indx : 3, align:'left', format:'###,##0' },
                                        { indx : 4} 
                                       ]}
                                ],
                        mergeCells : [{r1: r, c1: 1, r2: r, c2: 2},
                                      {r1: r, c1: 3, r2: r, c2: 4}],                                
                        refgrid:{name:'grid2_2',addmode:false}  // addmode:false 그리드 밑에추가                                   
                        }
                      
                   ]
        };
        _ExpertMultiGridSheet (option , function(obj, wb){
            let headerRows = wb.headerRows; // 헤더개수

        });

/*
        let w1 = that.exportExcel ( {workbook:true, exportRender:true, render:true, format:"xmls", 
                                     diHide:["state","chk", "Discontinued"]});
        
        var blob = pq.excel.exportWb({workbook: w1, type: 'blob'});//export 1st workbook into Excel file.
        saveAs(blob, "pqGrid.xlsx" );
  */      
        





/*        
        let  _pq =$.paramquery,self, mc=[];
        self = new _pq.cExport ( that, {format:"xlsx"});
        let cols   = self.getXlsCols(CM, CM.length),
        header     = self.getXlsHeader(hc, hcLen, mc),
        mergeCells = self.getXlsMergeCells(mc, hcLen, that.iMerge, 0) ;
        for (let i = 0; i < dataLen; i++) {
            let rowData = data[i];
            for (let j = 0; j < CMLen; j++) {
            
            }
        }
*/        
      
}

function exportData(format) {
    debugger;
        console.log("exportData");
        /*
        var blob = this.exportData({
            format: format
        })
        if (typeof blob === "string") {
            blob = new Blob([blob]);
        }
        saveAs(blob, "pqGrid." + format);
        */
}
});