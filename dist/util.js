var t = require("@babel/types");
var NEJ_require = 'NEJ_require';
var NEJ_mark = '@nej';
var NEJ_reg = new RegExp(`^pool\/|${NEJ_mark}$`,'i');
var regMap = { text: /\.html?$/,  json: /\.json$/, css: /\.css$/ };

function isNejImport(path){
    return !!String(path).match(NEJ_reg);
}

function addPrefix(url) {
    Object.keys(regMap).some( type => regMap[type].test(url) && (url=`${type}!${url}`) );
    return url
}

function removeMark(url){
    return url.replace(NEJ_mark,'');
}

function importTrans(statement) {
    let id, url;
    if (!statement.specifiers.length) {
        url = statement.source.value;
    }
    // 获取 import 语句的 name 和 url
    else {
        [id, url] = [statement.specifiers[0].local, statement.source.value];
    }
    return {id, url}
}


// 先转为 NEJ_require(path), 在各文件都编译整合后, 统一合并转为define
function createNejRequire(id,url) {
    url = removeMark(url);
    return t.variableDeclaration(
        'var',
        [
            t.variableDeclarator(
                id || t.identifier( ('_nej_'+Math.random()*10+Date().now()).slice(8) ),
                t.callExpression(
                    t.identifier(NEJ_require),
                    [t.stringLiteral(url)]
                )
            )
        ]
    )
}
 
function isExport(statement) {
    return t.isExportDefaultDeclaration(statement) || t.isExportNamedDeclaration(statement);
}


// 不在每个文件的编译期间就转为define, 这样会造成多个define
function createDefine(urls, names, contents) {
    urls.forEach( literal => literal.value=addPrefix(literal.value) )
    return t.expressionStatement(
        t.callExpression(
            t.Identifier('define'), [
                t.arrayExpression(urls),
                t.functionExpression(null, names, t.blockStatement(contents))
            ]
        )
    )
}

module.exports = {
    t,
    NEJ_require,
    addPrefix,
    removeMark,
    importTrans,
    isExport,
    isNejImport,
    createNejRequire, 
    createDefine
};