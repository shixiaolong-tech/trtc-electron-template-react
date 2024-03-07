import TRTCCloud from 'trtc-electron-sdk';

const trtcCloud = TRTCCloud.getTRTCShareInstance();
console.log(`TRTC SDK version:`, trtcCloud.getSDKVersion());

window._trtcCloud = trtcCloud; // for test and debug

export default trtcCloud;