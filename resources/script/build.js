const fs = require("fs");
const cfg = require("./cfg.json");
const {name} = require("../../package.json");
const config = require("./build.json");
const webpack = require("webpack");
const path = require('path');
const main = require('./webpack.main.config'); //主进程
const renderer = require('./webpack.renderer.config'); //子进程

/** 调试配置 **/
cfg.port = 3345; //本地调试渲染进程端口

/**  config配置  **/
config.productName = name;
config.appId = `org.${name}`;
config.npmRebuild = true; //是否Rebuild编译
config.asar = true;//是否asar打包
let nConf = {
    "appW": 800, //app默认宽
    "appH": 600, //app默认高
    "appPort": cfg.port,
    "appUrl": "http://127.0.0.1:3000/", //程序主访问地址
    "socketUrl": "http://127.0.0.1:3000/",// 程序socket访问地址
    "updateFileUrl": "http://127.0.0.1:3000/public/", //更新文件地址
    "updaterCacheDirName": `${name.toLowerCase()}-updater` //更新文件名称
};

/** win配置 */
config.nsis.displayLanguageSelector = false //安装包语言提示
config.nsis.menuCategory = false; //是否创建开始菜单目录
config.nsis.shortcutName = name; //快捷方式名称(可中文)
config.nsis.allowToChangeInstallationDirectory = true;//是否允许用户修改安装为位置
config.win.requestedExecutionLevel = ["asInvoker", "highestAvailable"][0]; //应用权限
config.win.target = [];
// config.win.target.push({ //单文件
//     "target": "portable"
//     // "arch": ["x64"]
// });
config.win.target.push({ //nsis打包
    "target": "nsis",
    "arch": ["x64"]
});
let nsh = "";
if (config.nsis.allowToChangeInstallationDirectory) {
    nsh = "!macro customHeader\n" +
        "\n" +
        "!macroend\n" +
        "\n" +
        "!macro preInit\n" +
        "\n" +
        "!macroend\n" +
        "\n" +
        "!macro customInit\n" +
        "    ReadRegStr $0 HKLM \"Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\" \"UninstallString\"\n" +
        "    ${If} $0 != \"\"\n" +
        "       # ExecWait $0 $1\n" +
        "    ${EndIf}\n" +
        "!macroend\n" +
        "\n" +
        "!macro customInstall\n" +
        "\n" +
        "!macroend\n" +
        "\n" +
        "!macro customInstallMode\n" +
        "   # set $isForceMachineInstall or $isForceCurrentInstall\n" +
        "   # to enforce one or the other modes.\n" +
        "   #set $isForceMachineInstall\n" +
        "!macroend";
} else {
    nsh = "; Script generated by the HM NIS Edit Script Wizard.\n" +
        "\n" +
        "; HM NIS Edit Wizard helper defines custom install default dir\n" +
        "!macro preInit\n" +
        "    SetRegView 64\n" +
        "    WriteRegExpandStr HKLM \"${INSTALL_REGISTRY_KEY}\" InstallLocation \"$LOCALAPPDATA\\" + name + "\"\n" +
        "    WriteRegExpandStr HKCU \"${INSTALL_REGISTRY_KEY}\" InstallLocation \"$LOCALAPPDATA\\" + name + "\"\n" +
        "    SetRegView 32\n" +
        "    WriteRegExpandStr HKLM \"${INSTALL_REGISTRY_KEY}\" InstallLocation \"$LOCALAPPDATA\\" + name + "\"\n" +
        "    WriteRegExpandStr HKCU \"${INSTALL_REGISTRY_KEY}\" InstallLocation \"$LOCALAPPDATA\\" + name + "\"\n" +
        "!macroend";
}

/** linux配置 **/
config.linux.target = ["AppImage", "snap", "deb", "rpm", "pacman"][4];
config.linux.executableName = name;

fs.writeFileSync("./resources/script/cfg.json", JSON.stringify(cfg));
fs.writeFileSync("./resources/script/build.json", JSON.stringify(config, null, 2));
fs.writeFileSync("./resources/script/installer.nsh", nsh);
fs.writeFileSync("./src/lib/cfg/config.json", JSON.stringify(nConf, null, 2));

function deleteFolderRecursive(url) {
    let files = [];
    if (fs.existsSync(url)) {
        files = fs.readdirSync(url);
        files.forEach(function (file, index) {
            let curPath = path.join(url, file);
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(url);
    } else {
        console.log("...");
    }
}
deleteFolderRecursive(path.resolve('dist'));//清除dist
webpack([
    {...main},
    {...renderer}
], (err, stats) => {
    if (err || stats.hasErrors()) {
        // 在这里处理错误
        throw err;
    }
    console.log('ok')
});