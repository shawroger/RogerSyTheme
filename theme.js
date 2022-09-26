/***js form Morgan***/
/****************************思源API操作**************************/

async function 设置思源块属性(内容块id, 属性对象) {
	let url = "/api/attr/setBlockAttrs";
	return 解析响应体(
		向思源请求数据(url, {
			id: 内容块id,
			attrs: 属性对象,
		})
	);
}
async function 向思源请求数据(url, data) {
	let resData = null;
	await fetch(url, {
		body: JSON.stringify(data),
		method: "POST",
		headers: {
			Authorization: `Token ''`,
		},
	}).then(function (response) {
		resData = response.json();
	});
	return resData;
}
async function 解析响应体(response) {
	let r = await response;
	return r.code === 0 ? r.data : null;
}

/****UI****/
function ViewSelect(selectid, selecttype) {
	let button = document.createElement("button");
	button.id = "viewselect";
	button.className = "b3-menu__item";
	button.innerHTML =
		'<svg class="b3-menu__icon" style="null"><use xlink:href="#iconPreview"></use></svg><span class="b3-menu__label" style="">选择视图</span><svg class="b3-menu__icon b3-menu__icon--arrow" style="null"><use xlink:href="#iconRight"></use></svg></button>';
	button.appendChild(SubMenu(selectid, selecttype));
	return button;
}

function SubMenu(selectid, selecttype, className = "b3-menu__submenu") {
	let node = document.createElement("div");
	node.className = className;
	if (selecttype == "NodeList") {
		node.appendChild(GraphView(selectid));
		node.appendChild(TableView(selectid));
		node.appendChild(kanbanView(selectid));
		node.appendChild(DefaultView(selectid));
	}
	return node;
}

function GraphView(selectid) {
	let button = document.createElement("button");
	button.className = "b3-menu__item";
	button.setAttribute("data-node-id", selectid);
	button.setAttribute("custom-attr-name", "f");
	button.setAttribute("custom-attr-value", "dt");

	button.innerHTML = `<svg class="b3-menu__icon" style=""><use xlink:href="#iconFiles"></use></svg><span class="b3-menu__label">转换为导图</span>`;
	button.onclick = ViewMonitor;
	return button;
}
function TableView(selectid) {
	let button = document.createElement("button");
	button.className = "b3-menu__item";
	button.setAttribute("data-node-id", selectid);
	button.setAttribute("custom-attr-name", "f");
	button.setAttribute("custom-attr-value", "bg");

	button.innerHTML = `<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">转换为表格</span>`;
	button.onclick = ViewMonitor;
	return button;
}
function kanbanView(selectid) {
	let button = document.createElement("button");
	button.className = "b3-menu__item";
	button.setAttribute("data-node-id", selectid);
	button.setAttribute("custom-attr-name", "f");
	button.setAttribute("custom-attr-value", "kb");

	button.innerHTML = `<svg class="b3-menu__icon" style=""><use xlink:href="#iconMenu"></use></svg><span class="b3-menu__label">转换为看板</span>`;
	button.onclick = ViewMonitor;
	return button;
}
function DefaultView(selectid) {
	let button = document.createElement("button");
	button.className = "b3-menu__item";
	button.onclick = ViewMonitor;
	button.setAttribute("data-node-id", selectid);
	button.setAttribute("custom-attr-name", "f");
	button.setAttribute("custom-attr-value", "");

	button.innerHTML = `<svg class="b3-menu__icon" style=""><use xlink:href="#iconList"></use></svg><span class="b3-menu__label">恢复为列表</span>`;
	return button;
}
function MenuSeparator(className = "b3-menu__separator") {
	let node = document.createElement("button");
	node.className = className;
	return node;
}

/* 操作 */

/**
 * 获得所选择的块对应的块 ID
 * @returns {string} 块 ID
 * @returns {
 *     id: string, // 块 ID
 *     type: string, // 块类型
 *     subtype: string, // 块子类型(若没有则为 null)
 * }
 * @returns {null} 没有找到块 ID */
function getBlockSelected() {
	let node_list = document.querySelectorAll(".protyle-wysiwyg--select");
	if (node_list.length === 1 && node_list[0].dataset.nodeId != null)
		return {
			id: node_list[0].dataset.nodeId,
			type: node_list[0].dataset.type,
			subtype: node_list[0].dataset.subtype,
		};
	return null;
}

function ClickMonitor() {
	window.addEventListener("mouseup", MenuShow);
}

function MenuShow() {
	setTimeout(() => {
		let selectinfo = getBlockSelected();
		if (selectinfo) {
			let selecttype = selectinfo.type;
			let selectid = selectinfo.id;
			if (selecttype == "NodeList") {
				setTimeout(() => InsertMenuItem(selectid, selecttype), 0);
			}
		}
	}, 0);
}

function InsertMenuItem(selectid, selecttype) {
	let commonMenu = document.getElementById("commonMenu");
	let readonly = commonMenu.querySelector(".b3-menu__item--readonly");
	let selectview = commonMenu.querySelector('[id="viewselect"]');
	if (readonly) {
		if (!selectview) {
			commonMenu.insertBefore(ViewSelect(selectid, selecttype), readonly);
			commonMenu.insertBefore(MenuSeparator(), readonly);
		}
	}
}

function ViewMonitor(event) {
	let id = event.currentTarget.getAttribute("data-node-id");
	let attrName =
		"custom-" + event.currentTarget.getAttribute("custom-attr-name");
	let attrValue = event.currentTarget.getAttribute("custom-attr-value");
	let blocks = document.querySelectorAll(
		`.protyle-wysiwyg [data-node-id="${id}"]`
	);
	if (blocks) {
		blocks.forEach((block) => block.setAttribute(attrName, attrValue));
	}
	let attrs = {};
	attrs[attrName] = attrValue;
	设置思源块属性(id, attrs);
}

function injectCommentFunc() {
	const script = document.querySelector("#emojiScript");
	const js = document.createElement("script");
	js.setAttribute("src", "./appearance/themes/RogerSyTheme/comment/index.js");
	js.setAttribute("type", "module");
	js.setAttribute("defer", "defer");
	document.head.insertBefore(js, script);
}

injectCommentFunc();

function forceReload() {
	try {
		const { session } = require("@electron/remote");
		session.defaultSession.clearCache().then(() => window.location.reload());
	} catch (err) {
		window.location.reload();
	}
}

function getHPathByPath(data) {
	return request("/api/filetree/getHPathByID", data);
}

function sendSyMsg(msg, timeout) {
	request("/api/notification/pushMsg", {
		msg,
		timeout,
	});
}

function request(url, data, method = "POST") {
	return new Promise((resolve, reject) => {
		if (method.toUpperCase() == "POST") {
			fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
				// body:data
			})
				.then(handleResponse)
				.then((data) => resolve(data))
				.then((error) => reject(error));
		} else {
			fetch(url)
				.then(handleResponse)
				.then((data) => resolve(data))
				.then((error) => reject(error));
		}
	});

	function handleResponse(response) {
		let contentType = response.headers.get("content-type");
		if (contentType.includes("application/json")) {
			return handleJSONResponse(response);
		} else if (contentType.includes("text/html")) {
			return handleTextResponse(response);
		} else {
			throw new Error(`Sorry, content-type ${contentType} not supported`);
		}
	}

	function handleJSONResponse(response) {
		return response.json().then((json) => {
			if (response.ok) {
				return json;
			} else {
				return Promise.reject(
					Object.assign({}, json, {
						status: response.status,
						statusText: response.statusText,
					})
				);
			}
		});
	}
	function handleTextResponse(response) {
		return response.text().then((text) => {
			if (response.ok) {
				return text;
			} else {
				return Promise.reject({
					status: response.status,
					statusText: response.statusText,
					err: text,
				});
			}
		});
	}
}

function addRenderNoteRoute() {
	const checkClassName = "roger-sy-theme-addRenderNoteRoute";
	const list = document.querySelectorAll(
		".render-node .protyle-wysiwyg__embed"
	);

	list.forEach((e, index) => {
		const id = e.dataset.id;
		if (!e.firstChild.className.includes(checkClassName)) {
			getHPathByPath({
				id,
			}).then((res) => {
				const p = document.createElement("p");
				p.className = checkClassName;
				p.innerHTML = `<span style="font-weight:bold;color:orange">#${
					index + 1
				}</span> ${res.data.slice(1)}`;

				e.prepend(p);
			});
		}
	});
}

function hideBars() {
	let display =
		document.querySelector(".toolbar").style.display === "none"
			? "flex"
			: "none";

	[".toolbar", "#dockLeft", "#dockRight"].forEach((item) => {
		const el = document.querySelector(item);
		el.style.display = display;
	});
}

function replaceTitle() {
	const title = document.querySelector("#drag");
	if (title.innerHTML.trim().startsWith("思源笔记 v2.")) {
		title.innerHTML =
			"❤️‍🔥 Roger's note —— on " +
			new Date().toLocaleDateString().split("/").join(".");
	}
}

function abs(n) {
	return n >= 0 ? n : -1 * n;
}

const differDayTime = function (startDate, endDate) {
	return Math.floor(abs(endDate - startDate) / 86400000) + " 天 ";
};

const differHourTime = function (startDate, endDate) {
	return (
		(Math.floor(abs(endDate - startDate - 86400000) / 3600000) % 24) + " 小时 "
	);
};

const differMinuteTime = function (startDate, endDate) {
	return (Math.floor(abs(endDate - startDate) / 60000) % 60) + " 分 ";
};

const differSecondTime = function (startDate, endDate) {
	return (Math.floor((endDate - startDate) / 1000) % 60) + " 秒";
};

function calcTime(time) {
	const start = new Date().getTime();
	const end = new Date(time).getTime();

	let msg = end > start ? "剩余时间 " : "逾期时间";

	const day = differDayTime(start, end);
	const hour = differHourTime(start, end);
	const minu = differMinuteTime(start, end);
	const seco = differSecondTime(start, end);

	return " @" + msg + day + hour + minu + seco;
}

function calloutNoticeEmit(title, content, time) {
	let msg = "发现提醒事项";

	if (title || content) {
		msg += "：";
	}

	if (content) {
		msg += content;
	} else if (title) {
		msg += title;
	}

	if (time) {
		msg += calcTime(time);
	}

	sendSyMsg(msg);
}

function calloutFormEmit() {
	let msg = "发现表单";

	if (cotext || cocontent) {
		msg += "：";
	}

	if (cocontent) {
		msg += cocontent;
	} else if (cotext) {
		msg += cotext;
	}

	sendSyMsg(msg);
}
function calloutEmit() {
	const emitList = [
		{
			cotypes: ["notice", "todo", "plan", "wait", "homework"],
			cb: calloutNoticeEmit,
		},
		{
			cotypes: ["form"],
			cb: calloutFormEmit,
		},
	];
	let emitCount = 0;
	const calloutList = document.querySelectorAll("[custom-co]");

	console.log(calloutList);

	calloutList.forEach((e) => {
		const cotype = e.getAttribute("custom-co");
		const title = e.getAttribute("custom-cot");
		const content = e.getAttribute("custom-coc");
		const time = e.getAttribute("custom-cotime");

		const item = emitList.find(({ cotypes }) => cotypes.includes(cotype));

		if (item && item.cb) {
			item.cb(title, content, time);
			emitCount++;
		}
	});

	if (!emitCount) {
		sendSyMsg("暂无通知事项");
	}
}

function addRightBarIcon(href) {
	return ` 
	<img src="/appearance/themes/RogerSyTheme/src/${href}">
	 `;
}

window.addEventListener("keydown", (event) => {
	const keyBindList = [
		{
			code: ["F5"],
			cb: forceReload,
		},
		{
			code: ["F3"],
			cb: addRenderNoteRoute,
		},
		{
			code: ["F2"],
			cb: calloutEmit,
		},
		{
			code: ["F1"],
			cb: hideBars,
		},
	];

	if (event.ctrlKey) {
		replaceTitle();
		const item = keyBindList.find(({ code }) => code.includes(event.key));

		if (item && item.cb) {
			item.cb();
		}
	}
});

function toggleCalender() {
	const widgetDOM = document.createElement("div");
	widgetDOM.id = "calendar-bar";
	widgetDOM.className = "iframe";
	widgetDOM.innerHTML = `<div class="iframe-content">
	<iframe 
		src="/widgets/calendar-bar"
		data-src="/widgets/calendar-bar"
		data-subtype="widget"
	></iframe>
</div>`;
	const container = document.getElementById("dockRight");

	if (!document.getElementById("calendar-bar")) {
		container.prepend(widgetDOM);
	}

	const widgetDiv = document.getElementById("calendar-bar");

	if (widgetDiv.style.visibility === "visible") {
		widgetDiv.style.visibility = "hidden";
	} else {
		widgetDiv.style.visibility = "visible";
	}
}

function initDOM() {
	const rightDom = document.querySelector("#dockRight > div:nth-child(1)");

	const domList = [
		{
			label: "检查通知页面事项",
			href: "check-notice.svg",
			bindAction: calloutEmit,
		},
		{
			label: "检索笔记 history 信息",
			href: "history-icon.png",
			id: "history",
			bindAction: checkNoteHistory,
		},
		{
			label: "展示 SQL 嵌入块的 hpath",
			href: "show-sql.svg",
			bindAction: addRenderNoteRoute,
		},
		{
			label: "检索 calender 笔记",
			href: "calender-bar.webp",
			bindAction: toggleCalender,
		},
		{
			label: "强制重新加载",
			href: "refresh.svg",
			bindAction: forceReload,
		},
	];

	domList.forEach((item) => {
		const span = document.createElement("span");
		span.ariaLabel = item.label;
		if (item.id) {
			span.id = item.id;
		}
		span.className =
			"dock__item b3-tooltips b3-tooltips__w rg-sy-theme-add-right-bar";
		span.innerHTML = addRightBarIcon(item.href);
		span.addEventListener("click", item.bindAction);
		rightDom.appendChild(span);
	});
}

setTimeout(() => {
	initDOM();
}, 300);

function checkNoteHistory() {
	let myHistory = document.getElementById("myHistory");

	if (myHistory.style.visibility === "hidden") {
		myHistory.style.visibility = "visible";
	}
}

function formatIndex(index) {
	let s = "";
	return (index = index + 1);

	if (index >= 100) {
		s = index;
	} else if (index >= 10) {
		s = "&nbsp;" + index;
	} else {
		s = "&nbsp;&nbsp;" + index;
	}

	return "#" + s;
}

function parseTime(time, onlyEmoji = false) {
	const hourEmojis = [
		"🕐",
		"🕑",
		"🕒",
		"🕓",
		"🕔",
		"🕕",
		"🕖",
		"🕗",
		"🕘",
		"🕙",
		"🕚",
		"🕛",
	];

	if (onlyEmoji) {
		return hourEmojis[(new Date(time).getHours() + 11) % 12] || "⌚";
	}

	return (
		(hourEmojis[(new Date(time).getHours() + 11) % 12] || "⌚") +
		time.replace(/-/g, ".")
	);
}

function initHistoryCheck() {
	Date.prototype.Format = function (fmt) {
		var o = {
			"M+": this.getMonth() + 1,
			"d+": this.getDate(),
			"h+": this.getHours(),
			"m+": this.getMinutes(),
			"s+": this.getSeconds(),
			"q+": Math.floor((this.getMonth() + 3) / 3),
			S: this.getMilliseconds(),
		};
		if (/(y+)/.test(fmt))
			fmt = fmt.replace(
				RegExp.$1,
				(this.getFullYear() + "").substr(4 - RegExp.$1.length)
			);
		for (var k in o)
			if (new RegExp("(" + k + ")").test(fmt))
				fmt = fmt.replace(
					RegExp.$1,
					RegExp.$1.length == 1
						? o[k]
						: ("00" + o[k]).substr(("" + o[k]).length)
				);
		return fmt;
	};

	let historyArr = [];
	if (localStorage.getItem("historyArr")) {
		historyArr = JSON.parse(localStorage.getItem("historyArr"));
	}

	function update_history_tags(newTag) {
		if (!newTag) return;
		let tag = undefined;
		if (newTag.tagName === "DIV") {
			tag = newTag.querySelector("li[data-type='tab-header']");
		} else if (newTag.tagName === "LI") {
			tag = newTag;
		} else {
			return;
		}
		let historyItemIcon = `<use xlink:href="#icon-1f4c4"></use>`;
		let docIcon = tag.querySelector(".item__icon > svg");
		if (docIcon) {
			historyItemIcon = docIcon.innerHTML;
		}

		let nodeText = tag.querySelector("span.item__text").innerText;

		let timeStamp = tag.getAttribute("data-activetime");
		timeStamp = new Date(parseInt(timeStamp)).Format("yyyy-MM-dd hh:mm:ss");
		let data_id = tag.getAttribute("data-id");
		setTimeout(() => {
			let current_doc = document.querySelector(
				`div.fn__flex-1.protyle[data-id="${data_id}"] >div.protyle-content>div.protyle-background`
			);
			if (current_doc) {
				let doc_link =
					"siyuan://blocks/" + current_doc.getAttribute("data-node-id");
				let newTag = `${timeStamp}--${nodeText}--${doc_link}--${historyItemIcon}`;
				if (!historyArr.includes(newTag)) {
					historyArr.push(newTag);
				}

				while (historyArr.length > 200) {
					historyArr.shift();
				}
				localStorage.setItem("historyArr", JSON.stringify(historyArr));
			}
		}, 700);
	}

	let tab_containers = document.querySelectorAll(
		"div[data-type='wnd'] > div.fn__flex ul.fn__flex.layout-tab-bar.fn__flex-1"
	);
	const config = { attributes: false, childList: true, subtree: false };

	const tag_change = function (mutationsList, observer) {
		if (
			mutationsList[0].type === "childList" &&
			mutationsList[0].addedNodes.length
		) {
			update_history_tags(mutationsList[0].addedNodes[0]);
		}
	};

	const tab_container_change = function (mutationsList, observer) {
		if (mutationsList[0].type === "childList") {
			update_history_tags(mutationsList[0].addedNodes[0]);
			updateNode();
		}
	};

	const tabs_observer = new MutationObserver(tag_change);

	const tabs_container_observer = new MutationObserver(tab_container_change);

	for (let tab_container of tab_containers) {
		tabs_observer.observe(tab_container, config);
	}

	function updateNode() {
		tabs_observer.disconnect();

		tab_containers = document.querySelectorAll(
			"div[data-type='wnd'] > div.fn__flex ul.fn__flex.layout-tab-bar.fn__flex-1"
		);

		for (let tab_container of tab_containers) {
			tabs_observer.observe(tab_container, config);
		}
	}

	let parentNode = document.querySelector(
		"div#layouts > div.fn__flex.fn__flex-1 >div.layout__center.fn__flex.fn__flex-1"
	);
	tabs_container_observer.observe(parentNode, config);

	var settingBtn = document.getElementById("dockRight");

	settingBtn.insertAdjacentHTML(
		"afterend",
		`
<div
	id="myHistory"
	style="
		z-index: 1000;
		border-radius: 8px;
		position: absolute;
		bottom: 0.25em;
		max-width: calc(100% - 12px);
		line-height: 1.25em;
		top: 50vh;
		left: 50vw;
		width: 60vw;
		height: 80vh;
		background: white;
		box-shadow: 0px 0px 6px 0px #0000008c;
		visibility: hidden;
		transform: translate(-50%, -50%);
		padding: 0px 27px;
	"
>
	<div
		id="close-icon"
		style="
			width: 25px;
			height: 25px;
			top: 9px;
			right: 8px;
			cursor: pointer;
			z-index: 1001;
			position: absolute;
		"
	>
		<img src="/appearance/themes/RogerSyTheme/src/close-icon.svg" />
	</div>
	<div
		style="
			top: 0px;
			display: flex;
			margin-top: 35px;
			position: sticky;
			margin-bottom: 20px;
			flex-direction: column;
			background-color: white;
		"
		class="topBar"
	>
		<input
			id="history_input"
			type="text"
			placeholder="搜索历史记录"
			style="
				appearance: none;
				text-align: center;
				height: 36px;
				border-radius: 15px;
				border: 0px solid #fff;
				padding: 0 8px;
				outline: 0;
				letter-spacing: 1px;
				color: #202124;
				font-weight: 600;
				margin: 0 20px;
				background: rgba(45, 45, 45, 0.1);
				border: 1px solid rgba(255, 255, 255, 0.15);
				box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1) inset;
			"
		/>
		<div
			style="display: flex; justify-content: space-between; margin-top: 16px;"
		>
			<button
				id="showAllHistory"
				class="b3-button b3-button--small b3-button--cancel"
			>
				检索全部
			</button>
			<button
				id="clearHistory"
				class="b3-button b3-button--small b3-button--cancel"
			>
				清除全部
			</button>
		</div>
	</div>
	<div
		id="historyContainer"
		style="
			height: 60vh;
			overflow: auto;
    		padding-right: 10px;
		"
	></div>
</div>

`
	);

	let showAllHistoryBtn = document.getElementById("showAllHistory");
	let historyInputArea = document.getElementById("history_input");
	var historyDom = document.getElementById("history");
	let myHistory = document.getElementById("myHistory");

	let historyContainer = document.getElementById("historyContainer");

	function openHistoryDoc(e) {
		e.stopPropagation();
		if (e.target.tagName == "SPAN" && e.target.getAttribute("data-href")) {
			try {
				window.open(e.target.getAttribute("data-href"));
			} catch (err) {
				console.error(err);
			}
		}
	}

	myHistory.addEventListener("click", openHistoryDoc, false);

	let clearHistory = document.getElementById("clearHistory");

	function clearAllHistory(e) {
		e.stopPropagation();
		historyArr = [];
		localStorage.setItem("historyArr", JSON.stringify(historyArr));
		historyContainer.innerHTML = "";
		myHistory.style.visibility = "hidden";
	}
	clearHistory.addEventListener("click", clearAllHistory, false);

	function showAllHistoryItems(e) {
		e.stopPropagation();
		document.getElementById("history_input").value = "";
		if (myHistory.style.visibility === "hidden") {
			myHistory.style.visibility = "visible";
		}
		if (
			localStorage.getItem("historyArr") &&
			JSON.parse(localStorage.getItem("historyArr")).length > 0
		) {
			historyArr = JSON.parse(localStorage.getItem("historyArr"));
			const fragment = document.createDocumentFragment();
			historyContainer.innerHTML = "";
			let tempArr = [...historyArr];
			tempArr.reverse();
			tempArr.forEach((value, index) => {
				let [item_time, item_text, href, history_item_icon] = value.split("--");
				const timeEmoji = parseTime(item_time, true);
				item_text = item_text.replace(/</g, "&lt;");
				item_text = item_text.replace(/>/g, "&gt;");
				const elem_div = document.createElement("div");
				elem_div.className = "historyItem";
				elem_div.style.display = "flex";
				elem_div.style.justifyContent = "space-between";
				elem_div.style.marginTop = "10px";
				elem_div.innerHTML = `
<span style="width:40px;color: darkcyan;">${formatIndex(index)}</span>
<span class="historyTimeStamp" style="color:#4c5059;margin-right:2em;flex:1;">
	${timeEmoji}${item_time}
</span>
<span 
	style="color:#3481c5;margin-right:5px;cursor:pointer;"
	data-href="${href}"
	title="${href}"
>
	${item_text}
</span>
				`;
				fragment.appendChild(elem_div);
			});
			historyContainer.appendChild(fragment);
		}
	}

	function debounce(func, wait = 500) {
		let timer = null;
		return function (...args) {
			clearTimeout(timer);
			timer = setTimeout(() => {
				func.apply(this, args);
			}, wait);
		};
	}

	function historyKeySubmit(e) {
		if (historyInputArea.value.trim()) {
			let keyword = historyInputArea.value.trim();
			if (
				localStorage.getItem("historyArr") &&
				JSON.parse(localStorage.getItem("historyArr")).length > 0
			) {
				historyArr = JSON.parse(localStorage.getItem("historyArr"));
				const fragment = document.createDocumentFragment();
				historyContainer.innerHTML = "";
				let tempArr = [...historyArr];
				tempArr.reverse();
				tempArr = tempArr.filter((item) => item.includes(keyword));
				tempArr.forEach((value, index) => {
					let [item_time, item_text, href, history_item_icon] = value.split(
						"--"
					);
					const timeEmoji = parseTime(item_time, true);
					item_time = item_time.replace(/-/g, ".");
					const regExp = new RegExp(`${keyword}`, "g");
					item_text = item_text
						.replace(/</g, "&lt;")
						.replace(/>/g, "&gt;")
						.replace(regExp, function (value) {
							return `<span style="background-color:#ffe955;color:black;">${value}</span>`;
						});
					item_time = item_time.replace(regExp, function (value) {
						return `<span style="background-color:#ffe955;color:black;">${value}</span>`;
					});
					const elem_div = document.createElement("div");
					elem_div.className = "historyItem";
					elem_div.style.marginTop = "10px";
					elem_div.style.display = "flex";
					elem_div.style.justifyContent = "space-between";
					elem_div.innerHTML = `
<span style="width:40px;color: darkcyan;">${formatIndex(index)}</span>
<span class="historyTimeStamp" style="color:#4c5059;margin-right:2em;flex:1;">
	${timeEmoji}${item_time}
</span>
<span
style="color:#3481c5;margin-right:5px;cursor:pointer;"
	data-href="${href}"
	title="${href}"
	>${item_text}</span
>`;
					fragment.appendChild(elem_div);
				});
				historyContainer.appendChild(fragment);
			}
		} else {
			showAllHistoryItems(e);
		}
	}

	historyDom.addEventListener("click", showAllHistoryItems, false);

	showAllHistoryBtn.addEventListener("click", showAllHistoryItems, false);

	historyInputArea.addEventListener("input", debounce(historyKeySubmit), false);

	function hideHistoryPanel() {
		const myHistory = document.getElementById("myHistory");
		if (myHistory.style.visibility !== "hidden") {
			myHistory.style.visibility = "hidden";
		}
	}

	const closeIcon = document.getElementById("close-icon");
	closeIcon.onclick = hideHistoryPanel;
}

window.onload = setTimeout(() => {
	ClickMonitor();
	initHistoryCheck();
}, 1000);
