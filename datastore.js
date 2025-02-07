// ==UserScript==
// @name         背包收纳
// @author       青黛
// @version      1.0.0
// @description  收纳，格式 .收纳 <物品>
// @timestamp    2025-02-06
// @license      Apache-2
// @homepageURL  https://github.com/cloudwindw/-/tree/main
// ==/UserScript==


// 先将扩展模块创建出来，如果已创建就直接使用
let ext = seal.ext.find('test');
if (!ext) {
  ext = seal.ext.new('test', '青黛', '1.0.0');
  seal.ext.register(ext);
}

const cmdFeed = seal.ext.newCmdItemInfo();
cmdFeed.name = '收纳';
cmdFeed.help = '收纳系统命令:\n' +
  '.收纳 <物品> [背包名] // 将物品放入指定背包(默认为default)\n' +
  '.收纳 查看 [背包名] // 查看指定背包内容\n' +
  '.收纳 删除 <物品> [背包名] // 从指定背包删除物品\n' +
  '.收纳 清空 <背包名> // 删除指定背包\n' +
  '.收纳 背包 // 查看所有背包列表';


  cmdFeed.solve = (ctx, msg, cmdArgs) => {
    let val = cmdArgs.getArgN(1)
    switch (val) {
      
      case 'help': case '': {// 帮助
        const ret = seal.ext.newCmdExecuteResult(true);// 创建一个结果
        ret.showHelp = true;// 显示帮助
        return ret;// 返回结果
      }

      case '列表': case '查看': case 'list': {
        const data = JSON.parse(ext.storageGet('feedInfo') || '{}');// 获取收纳数据

        const bagName = cmdArgs.getArgN(2) || 'default';// 获取背包名称
        
        if (!data[bagName]) {// 如果背包不存在
          seal.replyToSender(ctx, msg, `背包 ${bagName} 不存在`);// 回复不存在
          return seal.ext.newCmdExecuteResult(true);// 返回true
        }
        
        const lst = [];
        for (let [k, v] of Object.entries(data[bagName])) {
          lst.push(`- ${k}: 数量 ${v}`);
        }
        seal.replyToSender(ctx, msg, `背包 ${bagName} 的收纳记录:\n${lst.join('\n')}`);
        return seal.ext.newCmdExecuteResult(true);
      }
      case '删除': {
        const data = JSON.parse(ext.storageGet('feedInfo') || '{}');
        const itemName = cmdArgs.getArgN(2);
        const bagName = cmdArgs.getArgN(3) || 'default';
        
        if (!itemName) {
          seal.replyToSender(ctx, msg, '请指定要删除的物品名称');
          return seal.ext.newCmdExecuteResult(true);
        }
        
        if (!data[bagName] || !data[bagName][itemName]) {
          seal.replyToSender(ctx, msg, `背包 ${bagName} 中没有 ${itemName}`);
          return seal.ext.newCmdExecuteResult(true);
        }
        
        delete data[bagName][itemName];
        ext.storageSet('feedInfo', JSON.stringify(data));
        seal.replyToSender(ctx, msg, `已从背包 ${bagName} 中删除 ${itemName}`);
        return seal.ext.newCmdExecuteResult(true);
      }
      case '清空': {
        const data = JSON.parse(ext.storageGet('feedInfo') || '{}');
        const bagName = cmdArgs.getArgN(2);
        
        if (!bagName) {
          seal.replyToSender(ctx, msg, '请指定要删除的背包名称');
          return seal.ext.newCmdExecuteResult(true);
        }
        
        if (!data[bagName]) {
          seal.replyToSender(ctx, msg, `背包 ${bagName} 不存在`);
          return seal.ext.newCmdExecuteResult(true);
        }
        
        delete data[bagName];
        ext.storageSet('feedInfo', JSON.stringify(data));
        seal.replyToSender(ctx, msg, `已删除背包 ${bagName}`);
        return seal.ext.newCmdExecuteResult(true);
      }
      case '背包': {
        const data = JSON.parse(ext.storageGet('feedInfo') || '{}');
        const bags = Object.keys(data);
        if (bags.length === 0) {
          seal.replyToSender(ctx, msg, '当前没有任何背包');
        } else {
          seal.replyToSender(ctx, msg, `现有背包列表:\n${bags.join('\n')}`);
        }
        return seal.ext.newCmdExecuteResult(true);
      }
      default: {
        const data = JSON.parse(ext.storageGet('feedInfo') || '{}');
        const name = cmdArgs.getArgN(1) || '空气';
        const bagName = cmdArgs.getArgN(2) || 'default';
        
        if (!data[bagName]) {
          data[bagName] = {};
        }
        if (data[bagName][name] === undefined) {
          data[bagName][name] = 0;
        }
        data[bagName][name] += 1;
        ext.storageSet('feedInfo', JSON.stringify(data))
  
        seal.replyToSender(ctx, msg, `在背包 ${bagName} 中增加了 ${name}`);
        return seal.ext.newCmdExecuteResult(true);
      }
    }
  }
  

// 将命令注册到扩展中
ext.cmdMap['收纳'] = cmdFeed;
ext.cmdMap['feed'] = cmdFeed;
