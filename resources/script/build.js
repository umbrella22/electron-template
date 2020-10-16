const fs = require('fs');
const cfg = require('./cfg.json');
const {name} = require('../../package.json');
const config = require('./build.json');

const asar = true; //是否asar打包
const allowToChangeInstallationDirectory = true; //是否允许用户修改安装为位置
config.publish = [{ //更新地址
    provider: 'generic',
    url: 'http://175.24.76.246:3000/'
}]
config.productName = name;
config.nsis.shortcutName = name;
config.appId = `org.${name}`;
config.asar = asar;
config.nsis.allowToChangeInstallationDirectory = allowToChangeInstallationDirectory;
fs.writeFileSync('./resources/script/build.json', JSON.stringify(config, null, 2));

//写入nsis  appData目录
let nsh = "; Script generated by the HM NIS Edit Script Wizard.\n" +
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
fs.writeFileSync('./resources/script/installer.nsh', nsh);


/**  config配置  **/
let nConf = {//基础配置
    "appPort": cfg.port,
    "appUrl": "http://127.0.0.1:3000/", //程序主访问地址
    "socketUrl": "http://127.0.0.1:3000/",// 程序socket访问地址
    "updateUrl": "http://127.0.0.1:3000/", //更新地址
    "updateFileUrl": "http://127.0.0.1:3000/public/kl/", //更新文件地址
    "updateFilePath": `../${name.toLowerCase()}-updater` //更新文件目录
};
fs.writeFileSync('./src/lib/cfg/config.json', JSON.stringify(nConf, null, 2));
