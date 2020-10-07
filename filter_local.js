$(function () {
    function filterhandler() {

        var $toolbar = this.toolbar(),
            $value = $toolbar.find(".filterValue"),
            value = $value.val(),
            condition = $toolbar.find(".filterCondition").val(),
            dataIndx = $toolbar.find(".filterColumn").val(),
            filterRules;

        if (dataIndx == "") {//search through all fields when no field selected.
            filterRules = this.getColModel().map(function(column){                                    
                return { dataIndx: column.dataIndx, condition: condition, value: value };
            })
        }
        else {//search through selected field.
            filterRules = [{ dataIndx: dataIndx, condition: condition, value: value}];
        }

        //call to grid filter method.
        this.filter({
            oper: 'replace',
            rules: filterRules
        });
    }
    //filterRender to highlight matching cell text.(optional)
    function filterRender(ui) {
        var val = ui.cellData,
            filter = ui.column.filter,
            crules = (filter || {}).crules;

        if (filter && filter.on && crules && crules[0].value) {
            var condition = crules[0].condition,
                valUpper = val.toUpperCase(),
                txt = crules[0].value,
                txt = (txt == null) ? "" : txt.toString(),
                txtUpper = txt.toUpperCase(),
                indx = -1;
            if (condition == "end") {
                indx = valUpper.lastIndexOf(txtUpper);
                //if not at the end
                if (indx + txtUpper.length != valUpper.length) {
                    indx = -1;
                }
            }
            else if (condition == "contain") {
                indx = valUpper.indexOf(txtUpper);
            }
            else if (condition == "begin") {
                indx = valUpper.indexOf(txtUpper);
                //if not at the beginning.
                if (indx > 0) {
                    indx = -1;
                }
            }
            if (indx >= 0) {
                var txt1 = val.substring(0, indx);
                var txt2 = val.substring(indx, indx + txt.length);
                var txt3 = val.substring(indx + txt.length);
                return txt1 + "<span style='background:yellow;color:#333;'>" + txt2 + "</span>" + txt3;
            }
            else {
                return val;
            }
        }
        else {
            return val;
        }
    }
    var colModel = [
        { title: "코드", dataIndx: "code", width: 100 },
        { title: "종목명", width: 180, dataIndx: "name" },
        { title: "심볼", width: 140, dataIndx: "symbol" },
        { title: "시장구분", width: 140, dataIndx: "mktgbcd" },
        { title: "업종코드", width: "170", dataIndx: "upcode" }
    ];


    var newObj = {
        scrollModel: { autoFit: true },
        height: 'flex',
        maxHeight: 400,
        //pageModel: { type: 'local' },
        dataModel: {data:mastercode},
        columnTemplate: {render: filterRender},
        colModel: colModel,            
        filterModel: { mode: 'OR' },
        editable: false,
        showTitle: false,
        toolbar: {
            cls: "pq-toolbar-search",
            items: [                    
                { 
                    type: 'textbox', 
                    label: 'Filter: ',
                    attr: 'placeholder="Enter your keyword"', 
                    cls: "filterValue",
                    listener: { timeout: filterhandler }
                },
                { 
                    type: 'select', cls: "filterColumn",
                    listener: filterhandler,
                    options: function (ui) {                            
                        var opts = [{ '': '[ All Fields ]'}];
                        this.getColModel().forEach(function(column){                                
                            var obj = {};
                            obj[column.dataIndx] = column.title;
                            opts.push(obj);
                        })
                        return opts;
                    }
                },
                { 
                    type: 'select',                         
                    cls: "filterCondition",
                    listener: filterhandler,
                    options: [
                        { "begin": "Begins With" },
                        { "contain": "Contains" },
                        { "end": "Ends With" },
                        { "notcontain": "Does not contain" },
                        { "equal": "Equal To" },
                        { "notequal": "Not Equal To" },
                        { "empty": "Empty" },
                        { "notempty": "Not Empty" },
                        { "less": "Less Than" },
                        { "great": "Great Than" },
                        { "regexp": "Regex" }
                    ]
                }
            ]
        }
    };
    pq.grid( "#grid_search", newObj);
});