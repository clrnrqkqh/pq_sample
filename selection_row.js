$(function () {
    var colM = [
       // { width: 35, title:"", align : "center",dataIndx: "pq_group_cb", editable:true, editor:false, type: "checkbox", cb:{header: true} },
        { title: "Customer Name", width: 230, dataIndx: "ContactName",
         groupChange : function(val){
            return $.trim(val); // 데이터 가공을 하는 경우
         },
         render : function ( ui){
            console.log("render==>", ui);
            let children = this.iGroup.getChildren(ui.rowData);
            if ( children.length <= 0 )
                return {cls : "pq-align-right"};  // child 우측정렿
          },

          renderLabel : function(ui){
            console.log("renderLabel==>", ui);
            let children = this.iGroup.getChildren(ui.rowData);
            // 그룹데이터 가공
            if ( children.length > 0)
            {
                return children[0].ShipPostalCode;
            }
          },
        },
        { title: "ShipCountry", width: 120, align :"left", dataIndx: "ShipCountry" },
        { title: "Order ID", align:"left",width: 100, dataIndx: "OrderID" , dataType:"integer"},
        { title: 'Dates', halign:"center", styleHead: {}, colModel:[
            { title: "Order Date", width: "100", dataIndx:"OrderDate", dataType:"date" },
            { title: "Required Date", width: 100 , dataIndx:"RequiredDate", dataType:"date"},
            { title: "Shipped Date", width: 100, dataIndx: "ShippedDate" }
        ]},
        { title: "Freight", width: 120, format: '$##,###.00',
            summary: {
                type: "sum"
            },
            dataType: "float", dataIndx: "Freight"
        },
        { title: "Shipping Via", width: 130, dataIndx: "ShipVia" },		    
        { title: "Shipping Name", width: 160, dataIndx:"ShipName" },
        { title: "Shipping Address", width: 300, dataIndx:"ShipAddress" },
        { title: "Shipping City", width: 100, dataIndx:"ShipCity" },
        { title: "Shipping Region", width: 100,dataIndx:"ShipRegion" },
        { title: "Shipping PostalCode", width: 100, dataIndx:"ShipPostalCode" }
    ];
    var groupModel = {              // _pq.pqGrid.defaults.groupModel
        header: false,
        headerMenu: false,
        //bodycheckbox: false,  // Body 영역 체크박스 사용안함
        checkbox: true,
        checkboxHead: true,    
        on: true,
        dataIndx: ['ShipCountry'],                        
        menuItems: [],            
        summaryInTitleRow: 'all',
        titleInFirstCol: "ContactName",
        fixCols: false,
        indent: 20,
        titleDefault: "{0}",
        useLabel: true
    };
    var obj = {
        scrollModel: { autoFit: false },
        height: "100%-60px",
        resizable: true,
        editable: false,
        stripeRows:false,
        title:"selectionRow",
        numberCell: { show: true,title:"no" },
        selectionModel: { type: 'row', row:false,  all:false, column:false },
        flex: { on: true, all:true },
        autoRow : false,
        wrap: false, hwrap: false,
        columnTemplate:{halign:"center", hvalign:"center",valign:"center"},
        fillHandle:"",
        menuIcon:true,
        pageModel: { type: 'local', rPP: 20, rPPOptions: [1, 10, 20, 30, 40, 50, 100] },
        colModel: colM,
        groupModel: groupModel,
        dataModel: {
            data: data
        },
        toolbar: {
            style: "text-align:center",
            items: [{
                type: 'select',
                label: 'frozen columns: ',
                options: [0, 1, 2, 3,4,5], 
                listener: function (evt) {
                    this.option("freezeCols", evt.target.value);
                    this.refresh();
                }                                            
            }]
        },
        groupData: function( e,ui){
            console.log("groupData==>");
            this.iGroup.getChildren().forEach(function(rd){
                rd.pq_group_cb = true;
            })
        },
        check : function ( e, ui ){
            console.log("check==>", ui);
        },
        rowSelect: function (evt, ui) {
            console.log('rowSelect', ui);
            var str = JSON.stringify(ui, function(key, value){                    
                if( key.indexOf("pq_") !== 0){
                    return value;
                }
            }, 2)
            $("#rowSelect_pre").html(str);
        },
        //fill the drop down upon creation of pqGrid.
        create: function (evt, ui) {
            var grid = this,
                $select_row = $(".select-row"),
                data = ui.dataModel.data;

            $select_row.append(
                data.map(function( rd, i ){
                    return "<option>" + i + "</option>"
                }).join("") 
            )

            //bind select list change event.
            $select_row.on("change", function (evt) {
                var rowIndx = $(this).val();

                grid.setSelection({ rowIndx: rowIndx, focus: true });
            }).change();
        }
    };
    var $grid = $("#grid_row_selection").pqGrid(obj);
});