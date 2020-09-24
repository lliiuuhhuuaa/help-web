/***
 * 配置自动上传编辑后代码到阿里云oss
 * @type {WebpackAliyunOss}
 */
const WebpackAliyunOss = require("webpack-aliyun-oss"); // 引入webpack-aliyun-oss
const Oss = require('./oss.config'); // 引入刚刚创建的oss.js文件
module.exports = {
    // webpack 配置秀修改
    configureWebpack: config => {
        let webpackAliyunOss = [
            new WebpackAliyunOss({
                from: "./dist/**", // 上传那个文件或文件夹  可以是字符串或数组
                dist: "web/help",  // 需要上传到oss上的给定文件目录
                region: Oss.region,
                accessKeyId: Oss.accessKeyId,
                accessKeySecret: Oss.accessKeySecret,
                bucket: Oss.bucket,
                // putACL: 'public-read', // **webpack-ali-oss-upload 新增参数 设置oss上传文件读写权限**
                //测试，仅显示要上传的文件，但是不执行上传操作。默认false
                test: process.env.NODE_ENV==='development',
                setOssPath: filePath => {
                    // some operations to filePath
                    let index = filePath.lastIndexOf("dist");
                    let Path = filePath.substring(index + 4, filePath.length);
                    return Path.replace(/\\/g, "/");
                },
                setHeaders: filePath => {
                    // some operations to filePath
                    // return false to use default header
                    return {
                        "Cache-Control": "max-age=31536000"
                    };
                }
            })
        ];
        config.plugins = [...config.plugins, ...webpackAliyunOss];
        //警告 webpack 的性能提示
        config.performance = {
            hints: 'warning',
            //入口起点的最大体积
            maxEntrypointSize: 50000000,
            //生成文件的最大体积
            maxAssetSize: 30000000,
            //只给出 js 文件的性能提示
            assetFilter: function (assetFilename) {
                return assetFilename.endsWith('.js');
            }
        }

    }
}