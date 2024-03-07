/* config-overrides.js */
const os = require('os');
const path = require('path');

console.log('process.env.NODE_ENV:', process.env.NODE_ENV);

const TARGET_PLATFORM = (function(){
  let target = '';
  for (let i=0; i<process.argv.length; i++) {
    if (process.argv[i].includes('--platform=')) {
      target = process.argv[i].replace('--platform=', '');
      break;
    }
  }
  if (!['win32', 'darwin', 'linux'].includes(target)) target = os.platform();
  return target;
})();

console.log(`TARGET_PLATFORM: ${TARGET_PLATFORM}`);

const getRewritePath = function() {
  console.log('getRewritePath:', process.env.NODE_ENV);
  let rewritePath = '';
  if (process.env.NODE_ENV === 'production') {
    switch (TARGET_PLATFORM) {
      case 'win32':
        rewritePath = './resources';
        break;
      case 'darwin':
        rewritePath = '../Resources';
        break;
      case 'linux':
        rewritePath = './resources';
        break;
      default:
        console.error(`not supported environment ${TARGET_PLATFORM}`);
        break;
    }
  } else { //  if (process.env.NODE_ENV === 'development')
    rewritePath = path.resolve(__dirname, 'node_modules/trtc-electron-sdk/build/Release');
  }

  console.log(`rewritePath: ${rewritePath}`);
  return rewritePath;
};

// 序列化正则表达式
function replacer(key, value) {
  if (value instanceof RegExp)
    return ("__REGEXP " + value.toString());
  else
    return value;
}

// 反序列化正则表达式
function reviver(key, value) {
  if (value.toString().indexOf("__REGEXP ") == 0) {
    const m = value.split("__REGEXP ")[1].match(/\/(.*)\/(.*)?/);
    return new RegExp(m[1], m[2] || "");
  } else
    return value;
}
// // 正则表达式序列化/反序列化示例
// JSON.parse(JSON.stringify({re: /^ss$/gi}, replacer, 2), reviver);


module.exports = {
  // The Webpack config to use when compiling your react app for development or production.
  webpack: function(config, env) {
    // // 以下配置不可行
    // config.module.rules.unshift({
    //   test: /\.node$/,
    //   loader: 'native-ext-loader',
    //   options: {
    //     rewritePath: getRewritePath(),
    //   }
    // });

    // // 以下配置可行
    config.module.rules[1].oneOf.unshift({
      test: /\.node$/,
      loader: 'native-ext-loader',
      options: {
        rewritePath: getRewritePath(),
      }
    });

    config.target = 'electron-renderer';

    // // 以下日志打印，对分析 webpack 配置和加载器很有用
    // console.log(`react webpack config:`, JSON.stringify(config, replacer), env);

    return config;
  },
  // // The function to use to create a webpack dev server configuration when running the development
  // // server with 'npm run start' or 'yarn start'.
  // // Example: set the dev server to use a specific certificate in https.
  // devServer: function(configFunction) {
  //   return function(proxy, allowedHost) {
  //     console.log(`devServer config:`, proxy, allowedHost);
  //     // Create the default config by calling configFunction with the proxy/allowedHost parameters
  //     const config = configFunction(proxy, allowedHost);
  //     // Return your customised Webpack Development Server config.
  //     console.log(`react webpack-dev-server config:`, config);
  //     return config;
  //   };
  // },
  // // The paths config to use when compiling your react app for development or production.
  // paths: function(paths, env) {
  //   // ...add your paths config
  //   return paths;
  // },
};