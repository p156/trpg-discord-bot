//定義
const http = require('http');
const querystring = require('querystring');
const discord = require('discord.js');
const client = new discord.Client();

//未解読
http.createServer(function(req, res){
  if (req.method == 'POST'){
    var data = "";
    req.on('data', function(chunk){
      data += chunk;
    });
    req.on('end', function(){
      if(!data){
        res.end("No post data");
        return;
      }
      var dataObject = querystring.parse(data);
      console.log("post:" + dataObject.type);
      if(dataObject.type == "wake"){
        console.log("Woke up in post");
        res.end();
        return;
      }
      res.end();
    });
  }
  else if (req.method == 'GET'){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Discord Bot is active now\n');
  }
}).listen(3000);

//client.on('guildMemberAdd', member => { console.log(member.displayName) })

//ボットのステータス系
client.on('ready', message =>{
  console.log('Bot準備完了～');
  client.user.setActivity('管理用のBot', { type: 'STREAMING' })
});

/*
メンション処理　メンションされたらのトリガー構文
if(message.mentions.has(client.user))
ある単語が含まれたらに発動する構文　下記の場合#help
if (message.content.match(/#help/))
*/

//ここからメッセージシステム
client.on('message', message =>{
  //とりあえず自分の文で無限ループに陥るのを防ぐ構文
  if (message.author.id == client.user.id || message.author.bot){
    return;
  }
  
  //メンション系
  
  //簡単なダイスボット
  /*if(message.mentions.has(client.user) && message.content.match(/1d20/)){
    let text = getRandomInt(20) + 1;
    sendReply(message, text);
  }*/

  
  //トリガー系
  
  //とりあえず生存確認
  if (message.content.match(/hoge/)){
    let text = "hoge";
    sendMsg(message.channel.id, text);
    return;
  }
  
  //取扱説明書
  if (message.content.match(/#help/)){
    let text = "#dice 1d100    :   ダイスを振るコード　数字は半角で入力してください \n"
              +"#choice A,B,C :   チョイスをするコード 例ではABCの中から一つ選んでくれる「,」これは半角で入力してください\n"
    sendMsg(message.channel.id, text);
    return;
  }
  //全角は許さねぇ
  if(message.content.match(/＃/)){
  let text = "zap zap zap!!";
    sendMsg(message.channel.id, text);
    return;
  }
  
  //本格的なダイスボットづくり
  if (message.content.match(/#dice /)){
    let text = message.content
    text = text.replace("#dice ","");　//コマンドを変数から消す
    text = text.split('d');  //ｄを区切り点として、配列を作る
    
    let dice_Q = text[0] //個数
    let dice_S = text[1] //面
    let dice_r = Array(dice_Q)
    dice_r = Roll(dice_Q, dice_S)
    //ダイスが一個の時は計算式をなくす
    if(dice_Q == "1")
    {
      sendReply(message, dice_r);
    }
    else
    {
      //計算式の作成 .join()で配列内の変数と変数の間に+をぶち込む 
      sendReply(message, dice_r.join('+') + "=" + dice_r.reduce(function(a, x){return a + x;}))
    }
    return;
  }
  
  //チョイス的な機能 
  if (message.content.match(/#choice /))
  {
    let text = message.content
    text = text.replace("#choice ","");　//コマンドを変数から消す
    text = text.split(',');　  //,を区切り点として、配列を作る
    let Pick = Roll(1,text.length)
    sendReply(message, text[Pick-1]);
  }
   
  //タイマーの機能
  
  
  
})

//discordのアドレスに接続
if(process.env.DISCORD_BOT_TOKEN == undefined){
 console.log('DISCORD_BOT_TOKENが設定されていません。');
 process.exit(0);
}

client.login( process.env.DISCORD_BOT_TOKEN );


//外部関数
//リブライ
function sendReply(message, text){
  message.reply(text)
    .then(console.log("リプライ送信: " + text ))
    .catch(console.error);
}
//リプライなしのメッセージ
function sendMsg(channelId, text, option={}){
  client.channels.cache.get(channelId).send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}

//ダイスの計算ストック
function Roll(dice_Q, dice_S){
  let dice_r = Array(dice_Q)
  let dice_R = 0 
  for(let step = 0; step < dice_Q; step++){
    dice_r[step] = getRandomInt(dice_S) + 1; 
  }
  return dice_r;
}

//ダイスフル関数
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
