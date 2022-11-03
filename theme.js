async function setSyAttr(id, attrs) {
	return parseResponse(
		fetchRequest("/api/attr/setBlockAttrs", {
			id,
			attrs,
		})
	);
}
async function fetchRequest(url, data) {
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
async function parseResponse(response) {
	let r = await response;
	return r.code === 0 ? r.data : null;
}

function selectView(selectid, selecttype) {
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
			commonMenu.insertBefore(selectView(selectid, selecttype), readonly);
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
	setSyAttr(id, attrs);
}

function forceReload() {
	try {
		const { session } = require("@electron/remote");
		session.defaultSession.clearCache().then(() => window.location.reload());
	} catch (err) {
		window.location.reload();
	}
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

const differDayTime = function (startDate, endDate) {
	return Math.floor(Math.abs(endDate - startDate) / 86400000) + "D";
};

const differHourTime = function (startDate, endDate) {
	return (
		(Math.floor(Math.abs(endDate - startDate - 86400000) / 3600000) % 24) + "H"
	);
};

const differMinuteTime = function (startDate, endDate) {
	return (Math.floor(Math.abs(endDate - startDate) / 60000) % 60) + "M";
};

const differSecondTime = function (startDate, endDate) {
	return (Math.floor(Math.abs(endDate - startDate) / 1000) % 60) + "S";
};

function calcuteTimeOffset(time) {
	const start = new Date().getTime();
	const end = new Date(time).getTime();

	let msg = " @" + end > start ? "due-to" : "overdue";

	const day = differDayTime(start, end);
	const hour = differHourTime(start, end);
	const minu = differMinuteTime(start, end);
	const seco = differSecondTime(start, end);

	return msg + " {" + day + hour + minu + seco + "}";
}

function sendInfoMessage(content) {
	const list = content.split("|");

	if (list.length < 2) {
		return sendSyMsg(content);
	}

	if (list.length === 2) {
		if (list[1].startsWith("20") && list[1].includes(".")) {
			return sendSyMsg(list[0] + calcuteTimeOffset(list[1]));
		} else {
			return sendSyMsg(list[0] + "：" + list[1]);
		}
	}

	return sendSyMsg(list[0] + "：" + list[1] + calcuteTimeOffset(list[2]));
}

function checkInfoAttrs() {
	let count = 0;
	const attr = "info";
	const selector = "[custom-" + attr + "]";
	const list = document.querySelectorAll(selector);

	list.forEach((e) => {
		sendInfoMessage(e.getAttribute(selector));
		count++;
	});

	if (!count) {
		sendSyMsg("暂无通知事项");
	}
}

function toggleCalender() {
	const widgetDOM = document.createElement("div");
	widgetDOM.id = "calendar-bar";
	widgetDOM.className = "iframe";
	widgetDOM.innerHTML = `<div class="iframe-content">
	<iframe 
		src="/widgets/calendar-bar"
		data-src="/widgets/calendar-bar"
		data-subtype="widget"
		frameborder=0
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
			label: "检查页面提醒事项",
			href: "check-notice.svg",
			bindAction: checkInfoAttrs,
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
		span.innerHTML = `<img src="/appearance/themes/RogerSyTheme/src/${item.href}">`;
		span.addEventListener("click", item.bindAction);
		rightDom.appendChild(span);
	});
}

setTimeout(() => {
	initDOM();
}, 300);

window.onload = setTimeout(() => {
	ClickMonitor();
}, 1000);

function includeJs(file, target) {
	var js;
	if (target == undefined) {
		target = self;
	}
	var html_doc = target.document.getElementsByTagName("head")[0];
	js = target.document.createElement("script");
	js.setAttribute("type", "text/javascript");
	js.setAttribute("src", file);
	html_doc.appendChild(js);
}

function exportToJsonString(idbDatabase, cb) {
	const exportObject = {};
	const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
	const size = objectStoreNamesSet.size;
	if (size === 0) {
		cb(null, JSON.stringify(exportObject));
	} else {
		const objectStoreNames = Array.from(objectStoreNamesSet);
		const transaction = idbDatabase.transaction(objectStoreNames, "readonly");
		transaction.onerror = (event) => cb(event, null);

		objectStoreNames.forEach((storeName) => {
			const allObjects = [];
			transaction.objectStore(storeName).openCursor().onsuccess = (event) => {
				const cursor = event.target.result;
				if (cursor) {
					allObjects.push(cursor.value);
					cursor.continue();
				} else {
					exportObject[storeName] = allObjects;
					if (objectStoreNames.length === Object.keys(exportObject).length) {
						cb(null, JSON.stringify(exportObject));
					}
				}
			};
		});
	}
}

function importFromJsonString(idbDatabase, data, cb) {
	const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
	const size = objectStoreNamesSet.size;
	if (size === 0) {
		cb(null);
	} else {
		const objectStoreNames = Array.from(objectStoreNamesSet);
		const transaction = idbDatabase.transaction(objectStoreNames, "readwrite");
		transaction.onerror = (event) => cb(event);

		const importObject = data;

		// Delete keys present in JSON that are not present in database
		Object.keys(importObject).forEach((storeName) => {
			if (!objectStoreNames.includes(storeName)) {
				delete importObject[storeName];
			}
		});

		if (Object.keys(importObject).length === 0) {
			// no object stores exist to import for
			cb(null);
		}

		objectStoreNames.forEach((storeName) => {
			let count = 0;

			const aux = Array.from(importObject[storeName] || []);

			if (importObject[storeName] && aux.length > 0) {
				aux.forEach((toAdd) => {
					const request = transaction.objectStore(storeName).add(toAdd);
					request.onsuccess = () => {
						count++;
						if (count === importObject[storeName].length) {
							// added all objects for this store
							delete importObject[storeName];
							if (Object.keys(importObject).length === 0) {
								// added all object stores
								cb(null);
							}
						}
					};
					request.onerror = (event) => {
						console.log(event);
					};
				});
			} else {
				if (importObject[storeName]) {
					delete importObject[storeName];
					if (Object.keys(importObject).length === 0) {
						// added all object stores
						cb(null);
					}
				}
			}
		});
	}
}

function clearDatabase(idbDatabase, cb) {
	const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
	const size = objectStoreNamesSet.size;
	if (size === 0) {
		cb(null);
	} else {
		const objectStoreNames = Array.from(objectStoreNamesSet);
		const transaction = idbDatabase.transaction(objectStoreNames, "readwrite");
		transaction.onerror = (event) => cb(event);

		let count = 0;
		objectStoreNames.forEach(function (storeName) {
			transaction.objectStore(storeName).clear().onsuccess = () => {
				count++;
				if (count === size) {
					// cleared all object stores
					cb(null);
				}
			};
		});
	}
}

function downloadString(content, filename) {
	var eleLink = document.createElement("a");
	eleLink.download = filename;
	eleLink.style.display = "none";
	var blob = new Blob([content]);
	eleLink.href = URL.createObjectURL(blob);
	document.body.appendChild(eleLink);
	eleLink.click();
	document.body.removeChild(eleLink);
}

// includeJs("/appearance/themes/RogerSyTheme/indexeddb.js");
// includeJs("https://unpkg.com/dexie@3.2.2/dist/dexie.js");

/*
const db = new Dexie("NoteViews");

db.open()
	.then(function () {
		const idbDatabase = db.backendDB();

		exportToJsonString(idbDatabase, function (err, data) {
			if (err) {
				console.error(err);
			} else {
				const uid = new Date().getTime();
				downloadString(
					"var noteViewsData = " + data,
					"noteviews-data-" + uid + ".js"
				);
			}
		});
	})
	.catch(function (e) {
		console.error("Could not connect. " + e);
	});



db.open()
	.then(function () {
		const idbDatabase = db.backendDB();
		clearDatabase(idbDatabase, function (err) {
			if (!err) {
				importFromJsonString(idbDatabase, noteViewsData, function (err) {
					if (!err) {
						console.log("Imported data successfully");
					}
				});
			}
		});
	})
	.catch(function (e) {
		console.error("Could not connect. " + e);
	});
*/
