const fs = require("fs");
const URL = require("url");
const path = require("path");
const favicon = require("favicon");
const download = require("download");






const url = `






https://www.ztxz.org.cn/canger/549.html

















`;


















const info = URL.parse(url.trim(), true);

const hostname = info.hostname;
const cssFile = path.resolve(__dirname, "extra-icon.css");

function appendCSS(hostname, filename) {
	const tpl = `.protyle-wysiwyg
	[data-node-id]
	span[data-type="a"][data-href*="${hostname}"]:not(:empty)::before,
.b3-typography a[href*="${hostname}"]::before {
	content: "";
	background-image: url("./extra-icon/${filename}");
}

`;

	fs.appendFileSync(cssFile, tpl);
}

function pureExt(ext) {
	if (ext.includes("?")) {
		return ext.split("?")[0];
	}
	return ext;
}

favicon(url, function (err, faviconUrl) {
	if (err != null) {
		throw err;
	}

	const ext = path.extname(faviconUrl);
	const filename = hostname + pureExt(ext);
	const savePath = path.resolve(__dirname, "extra-icon", filename);

	if (!fs.existsSync(savePath)) {
		download(faviconUrl).pipe(fs.createWriteStream(savePath));
		appendCSS(hostname, filename);
		console.log("解析成功：" + hostname);
	} else {
		console.log("图标文件 " + savePath + " 已存在");
	}
});
