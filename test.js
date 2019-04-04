const {transImportsToRequire,transRequireToDefine} = require('./dist/index');
const babel= require('@babel/core')
const assert = require('assert')
const fs = require('fs');

function diff(str,str2){
    for(let i=0; i<str.length; i++){
        if(str[i]!==str2[i]){
            return i; // diff index
        }
    }
    return str.length==str2.length? null : Math.min(str.length,str2.length);// diff index
}



// transImportsToRequire
var code = `
import svs from './svs';
import lodash from 'lodash';
import Notify from 'pool/component-notify/src/notify/ui';
import tpl from 'pool/comp/tpl.html';
import res from 'res/base@nej';
foo();
var m = Notify(tpl,res,lodash,baseSvs);
export default m;`

var target = `
import svs from './svs';
import lodash from 'lodash';
var Notify = NEJ_require('pool/component-notify/src/notify/ui');
var tpl = NEJ_require('pool/comp/tpl.html');
var res = NEJ_require('res/base');
foo();
var m = Notify(tpl,res,lodash,baseSvs);
export default m;`


// transRequireToDefine
var codeB =`
var module = (function () {
    var svs = '/*.....*/';
    var lodash = '/*.....*/';
    var Notify = NEJ_require('pool/component-notify/src/notify/ui');
    var tpl = NEJ_require('pool/comp/tpl.html');
    var res = NEJ_require('res/base');
    foo();
    var m = Notify(tpl,res,lodash,baseSvs);
    return m;
}());`

var targetB =`
  define(['pool/component-notify/src/notify/ui','text!pool/comp/tpl.html','res/base'],function(Notify,tpl,res){
    var svs = '/*.....*/';
    var lodash = '/*.....*/';
    foo();
    var m = Notify(tpl,res,lodash,baseSvs);
    return m;
  });`


function format(code){
    return code.replace(/\s*/g,'').replace(/"/g,"'");
}

function report(resultCode,targetCode,output){
    console.log('\n---report of result:')
    console.log(resultCode);

    var $ResultCode = format(resultCode);
    var $TargetCode = format(targetCode);
    var res =  $ResultCode === $TargetCode;
    console.log(res);

    if(!res){
        let i = diff($ResultCode, $TargetCode);
        console.log('diff(result:target)> ',$ResultCode.slice(i,i+20),' : ',$TargetCode.slice(i,i+20))
    }
    assert.strictEqual( format(resultCode), format(targetCode) );
    output && fs.writeFileSync(output,result.code,{flag:'w+'})
}

function test(code,target,plugin){
    babel.transform(code, {plugins:[plugin]}, (err, result)=>{
        if(err){
            return console.log(err)
        }
        report(result.code,target)
    });
}

test(code,target,transImportsToRequire)
test(codeB,targetB,transRequireToDefine)
