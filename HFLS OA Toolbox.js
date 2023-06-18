// ==UserScript==
// @name         HFLS OA Toolbox
// @namespace    https://www.luogu.com.cn/blog/RsCb/
// @version      0.1
// @description  Fill in the teaching evaluation survey of HFLS.
// @author       RsCb
// @match        http://oa.chinahw.net:8088/*
// @icon         https://cdn.luogu.com.cn/upload/image_hosting/6g7qu0rk.png
// @grant        none
// ==/UserScript==

function scriptMsg(content, func1, func2){
    layer.confirm(content, {title: '来自 HFLS OA Toolbox 的消息'}, func1, func2);
}

function isAtModel(id){
    return Boolean($(`#model-div-${id}`).length);
}

function update(){
    if(isAtModel('74012')) teachingEval.main();
}

var teachingEval = {};

teachingEval.isAtForm = function(){
    return isAtModel('74012') && Boolean($('#itemFormId').length);
};

teachingEval.main = function(){
    teachingEval.modelObserver = new MutationObserver(function(){
        this.disconnect();
        (new MutationObserver(teachingEval.addButtons))
            .observe($('#itemShowDivId')[0], {childList: true});
    });
    teachingEval.modelObserver.observe($('#model-div-74012')[0], {childList: true});
};

teachingEval.addButtons = function(){

    goback = function(){
        let url = "/oa7/evaluate/stu/list";
        $("#itemShowDivId").load(url);
    };

    if(teachingEval.isAtForm()){

        $('#itemFormId .filter').after(
            `<div style="margin:0px 0px 10px 0px">
                <div class="btn btn-long btn-blue" id="fillButton">一键填写</div>
                <div class="btn btn-long btn-blue" id="autoFillButton">填写全部</div>
            </div>`
        );
        $('#fillButton').click(teachingEval.fill);
        $('#autoFillButton').click(teachingEval.autoFill);

        if(teachingEval.auto) teachingEval.fill();
    }
};

teachingEval.fill = function(){

    for(let i=0;; i++){
        function getItems(name){
            return $(`#itemFormId .table-container [name='resultList[${i}].${name}']`);
        }

        if(!getItems('itemId').length) break;

        switch(getItems('itemType')[0].value){
        case '10':
            getItems('resultId')[0].checked = true;
            break;
        case '11':
            getItems('resultId')[0].checked = true;
            break;
        case '12':
            getItems('result')[0].value = '无';
            break;
        }
    }
    teachingEval.save();
};

teachingEval.autoFill = function(){
    teachingEval.auto = true;
    teachingEval.firstPage();
};

teachingEval.save = function(){
    if(isSubmit) return;

    isSubmit = true;
    layer.load();

    let options = {
        url: "/oa7/evaluate/stu/saveItem",
        dataType: 'json',
        data: {'state': '1'},
        success: function(data){
            isSubmit = false;
            layer.closeAll();

            let jsonO = data;
            if(!jsonO.success)
                layerTipMsg(jsonO.success, "保存失败", jsonO.msg);
            else if(!teachingEval.auto)
                scriptMsg('已自动填写并保存，是否前往下一张问卷？', teachingEval.nextPage)
            else
                teachingEval.nextPage();
        },
        clearForm: false,
        resetForm: false,
        type: 'post',
    };
    $("#itemFormId").ajaxSubmit(options);
};

teachingEval.firstPage = function(){
    if($('#subjectId').length)
        $('#subjectId')[0].value = $('#subjectId :first-child').val();
    doSearch();
};

teachingEval.nextPage = function(){
    layer.closeAll();
    let curVal = $('#subjectId').val();
    let nxtVal = $(`#subjectId [value='${curVal}']`).next().val();
    if(nxtVal == undefined){
        teachingEval.submit(); return;
    }
    $('#subjectId')[0].value = nxtVal;
    doSearch();
};

teachingEval.submit = function(){
    teachingEval.auto = false;
    scriptMsg('已填完，是否提交？', function(){
        layer.closeAll();
        saveItemList('2', '0');
    });
};

var inf = `\
米娜桑：
    Ciallo！
    来自高一７的脚本作者 RsCb Da☆ze！感谢您使用该脚本～
    该脚本旨在使大家得到更舒适的校园 OA 使用体验。目前，该脚本只有自动填写评教调查这一功能，后续可能会加入更多功能，敬请期待吧！
    如果遇到 bug 的话，欢迎 email(<a herf="RsCb9004@163.com">RsCb9004@163.com</a>)！
    但是怎么会有人用这么无聊的东西呢，刚刚只是在和空气讲话吧……
<div style="text-align:right">
RsCb
2023.6.18
</div>
`;

(function(){
    'use strict';
    switch(window.location.pathname){
    case '/oa7/desktop/index/page':{
        scriptMsg(inf.replace(/^\s{4}/gm, '&emsp;&emsp;').replace(/(?<!\>)\n/g, '<br>'));
        (new MutationObserver(update)).observe($('#deskTopContainer')[0], {childList: true});
        break;
    }
    }
})();
