import {path_variables} from "./path_variables.js";

var pageNumber = 1;
var allCatdata = {};
var newCat = {"content": []};
var totPag = 0;
// var api = 'https://raw.githubusercontent.com/Musaib/responsigation/master/navigation.json';
var api = path_variables.tenantPath + path_variables.publicPath +  path_variables.sellingTree;
dataLoad();

function newURl(pgNum) {
    return path_variables.tenantPath + path_variables.publicPath + path_variables.getAllCategory
    + path_variables.headers1 + pgNum + path_variables.headers2;
}

function getJson(url) {
    return $.getJSON(url);
}

function dataLoad() {
    let api1 = newURl(pageNumber);
    getJson(api1).then(data => {
        allCatdata = data;
        totPag = data.page.totalPages;
        goNext();
    });
}

function goNext() {
    if (totPag > pageNumber) {
        pageNumber ++;
        let url = newURl(pageNumber);
        getJson(url).then( nData => {
            for (let i in nData.content) {
                allCatdata.content.push(nData.content[i]);
            }
        });
        goNext();
    } else {
        getJson(api).then(cData => {
            for(let x in cData.content) {
                for (let y in allCatdata.content){
                    if (cData.content[x].name === allCatdata.content[y].name){
                        newCat['content'].push(allCatdata.content[y]);
                    }
                }
            }
            fixThis(newCat);
        });
    }
}

function fixThis(data) {
    let x = data.content.filter(function (a) {
        return !this[a.parentIds[0]] && (this[a.parentIds[0]] = true);
    }, Object.create(null));
    let y = [];
    for ( let a in x ) {
        if (x[a].parentIds[0] == ''){
            y.push('others');
        } else {
            y.push(x[a].parentIds[0]);
        }
    }
    var fixD = {'parents': []};
/*    fixD.parents = y.reduce((o, key) => Object.assign(o, {[key]: []}), {});
    for (var w in data.content) {
        if (data.content[w].parentIds[0] != '' && fixD.parents[data.content[w].parentIds[0]]) {
            fixD.parents[data.content[w].parentIds[0]].push(data.content[w]);
        } else if (data.content[w].parentIds[0] == '') {
            fixD.parents['others'].push(data.content[w]);
        }
    }*/
    y.forEach(value => {fixD.parents.push({"name" : value, 'content': []});});
    data.content.forEach(value => {
        for (let q in fixD.parents) {
            if(fixD.parents[q].name == value.parentIds[0] && value.parentIds[0] != '') {
                fixD.parents[q].content.push(value);
            } if (value.parentIds[0] == '' && fixD.parents[q].name == 'others') {
                fixD.parents[q].content.push(value);
            }
        }
    });
    setParentData(fixD);

}

function setParentData(data){
    console.log(data);
    var nav = $('#nav');
    var outerTemplate = $("#outerTemplate").html();
    var innerTemplate = $("#innerTemplate").html();
    var subCategoryTemplate = $("#subCategoryTemplate").html();
    var rendered = Mustache.render(outerTemplate, data, {
        "innerTemplate": innerTemplate, subCategoryTemplate
    });
    nav.html(rendered);
    setTimeout(function(){

        $('#nav > ul > :nth-child(3) > ul').drystone({
            xl: 4,
            gutter: 0,
            item: '#nav > ul > :nth-child(3) > ul > li',
            onComplete: function() {
                $('#nav > ul > :nth-child(3) > ul').css({
                    'position': 'absolute',
                    'background-color': '#ffff',
                    'min-height': '500px',
                    'height': '500px',
                    'visibility': 'visibile',
                    'display': 'none'
                });
            }
        });

    }, 100);

    $('#nav > ul > :nth-child(3)').hover(
        function(){
            $('#nav > ul > :nth-child(3) > ul').show();
            $('#nav > ul > :nth-child(3) > ul').css({
                'visibility': 'visibile',
                'z-index': '1',
                'opacity': '1'
            });
        },
        function(){
            $('#nav > ul > :nth-child(3) > ul').hide();
        }
    );
}

