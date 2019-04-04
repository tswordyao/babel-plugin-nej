const {t,NEJ_require, createDefine} = require('./util');

function transRequireToDefine(){
    var topVar;
    var dps = [];
    var params = [];
    var contents = [];

    // visitor之外的内存要重置
    function reset(){
        topVar=null, dps=[], params=[], contents=[];
    }

    // var returnStatement;
    return {
        // 此为最后一步. 从源入口文件export, 到倒数第二步的编译结果为 var module = IIFE
        visitor:{
            VariableDeclaration:{
                enter(path){
                    var varDec = path.node;
                    var varDecTor = varDec.declarations[0];
                    var init = varDecTor.init;

                    // topVar中的就是函数体
                    if(!topVar){
                        // console.log('---enter topvar')
                        topVar = varDec;
                        let body = init.callee.body.body;
                        contents = body
                        return;
                    }
                    // 那些init为NEJ_require的就是需要集中转为define的依赖项
                    else{
                        // console.log('---enter normal var')
                        if(init && init.callee && init.callee.name===NEJ_require){
                            dps.push(init.arguments[0]);
                            params.push(varDecTor.id);
                            path.remove();
                        }
                    }
                }
            },
            // 无需从export中提取returnStatement, 因为倒数第二步时已经转换为了IIFE return
            // ExportDefaultDeclaration(path){
            //     returnStatement = t.returnStatement(
            //         path.node.declaration
            //     );
            // },
            Program:{
                // 出整个program是最后一步的最后一步, 这里重新组装
                exit(path){
                    // console.log('---exit program')
                    // let define = createDefine(dps,params,contents.concat(returnStatement));
                    let define = createDefine(dps,params,contents);
                    path.node.body=[define];
                    path.stop();  
                    reset();
                }
            }
        }
    }
}

module.exports = transRequireToDefine;