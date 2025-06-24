const { type, name } = $arguments;

const COMPATIBLE_OUTBOUND = {
  tag: 'COMPATIBLE',
  type: 'direct',
};

let config = JSON.parse($files[0]);
let compatibleAdded = false;

const proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
});

// 添加 proxies 到 outbounds
config.outbounds.push(...proxies);

const proxyTags = getTags(proxies);

// 处理每个 outbound
for (const outbound of config.outbounds) {
  if (Array.isArray(outbound.outbounds)) {
    // 添加 proxies 的 tag
    outbound.outbounds.push(...proxyTags);

    // 确保有 "proxy" 标签
    if (outbound.tag !== "proxy" && !outbound.outbounds.includes("proxy")) {
      outbound.outbounds.push("proxy");
    }

    // 若为空，添加兼容标签
    if (outbound.outbounds.length === 0 && !compatibleAdded) {
      config.outbounds.push(COMPATIBLE_OUTBOUND);
      compatibleAdded = true;
      outbound.outbounds.push(COMPATIBLE_OUTBOUND.tag);
    }
  }
}

// 输出结果
$content = JSON.stringify(config, null, 2);

// 工具函数
function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag);
}