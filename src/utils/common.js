import CryptoJS from 'crypto-js/crypto-js'


/**
 * aes加密
 * @param word
 * @returns {string}
 */
let k =  CryptoJS.enc.Utf8.parse("$this's_aes_key$");
export function encrypt(word) {
    let encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(word),k, {
        iv: k,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return "$"+CryptoJS.enc.Base64.stringify(encrypted.ciphertext)+"$";
}

/***
 * aes解密
 * @param word
 * @returns {string}
 */
export function decrypt(word) {
    if(word.startsWith("$") && word.endsWith("$")){
        word = word.substr(1,word.length-2);
    }
    let base64 = CryptoJS.enc.Base64.parse(word);
    let src = CryptoJS.enc.Base64.stringify(base64);
    let decrypt = CryptoJS.AES.decrypt(src, k, {
        iv: k,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}
/***
 * 时间格式化
 * @param fmt
 * @returns {*}
 */
Date.prototype.format = function (fmt) {
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}