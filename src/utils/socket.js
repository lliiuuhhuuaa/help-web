/***
 * socket封装
 * @returns {{}}
 */
let _this = null;
export default function socket(vue,state) {
    if(!state){
        vue.$socket.disconnect();
        return;
    }
    _this = vue;
    let sockets = vue.sockets;
    sockets.unsubscribe("connect");
    sockets.subscribe("connect", data => {
        console.log('连接成功:' + data);
    });
    sockets.unsubscribe("connecting");
    sockets.subscribe("connecting", data => {
        console.log('正在连接:' + data);
    });
    sockets.unsubscribe("disconnect");
    sockets.subscribe("disconnect", data => {
        console.log('断开连接:' + data);
    });
    sockets.unsubscribe("connect_failed");
    sockets.subscribe("connect_failed", data => {
        console.log('连接失败:' + data);
    });
    sockets.unsubscribe("error");
    sockets.subscribe("error", data => {
        console.log('错误发生:' + data);
    });
    sockets.unsubscribe("reconnect_failed");
    sockets.subscribe("reconnect_failed", data => {
        console.log('重连失败:' + data);
    });
    sockets.unsubscribe("reconnect");
    sockets.subscribe("reconnect", data => {
        console.log('成功重连:' + data);
    });
    sockets.unsubscribe("reconnecting");
    sockets.subscribe("reconnecting", data => {
        console.log('正在重连:' + data);
    });
    //添加请求参数
    vue.$socket.io.opts.query = "tk=" + localStorage.getItem("tk");
    //连接
    vue.$socket.open();
    testSpeed();
}
function testSpeed() {
    let start = +new Date();
    _this.$socket.emit("network_speed_test",null,()=>{
        _this.$store.state.socketDelay = +new Date()-start;
        setTimeout(()=>{
            testSpeed();
        },5000);
    })
}