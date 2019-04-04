const {t, removeMark,createNejRequire,importTrans,isNejImport} = require('./util');

function transImportsToRequire(){
    return {
        visitor:{
            ImportDeclaration:{
                enter(path){ 
                    if (this.stop) {
                        return;
                    }
                    const statement = path.node; 
                    // var type = statement.type;
                    // console.log('--statement.type: ',type);

                    // import Notify from 'pool/notify/src/ui'  这是唯一支持的标准方式, 不要来骚操作
                    let isImport = t.isImportDeclaration(statement);

                    if(isImport) {
                        // console.log('isImportDeclaration')
                        let importObj = importTrans(statement);

                        if ( isNejImport(importObj.url) ) {
                            let { id, url} = importObj;
                           
                            url = removeMark(url);
                   
                            path.replaceWith(
                                createNejRequire(id,url)
                            )             
                        }      
                    }
                }
            }
        }
    }
}

module.exports = transImportsToRequire;