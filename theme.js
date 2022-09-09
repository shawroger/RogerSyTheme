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

setTimeout(() => ClickMonitor(), 1000);
/* inject local script */
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

window["roger_custom_state"] = {
	renderNotes: 0,
};

function addRenderNoteRoute() {
	const checkClassName = "roger-sy-theme-addRenderNoteRoute";
	const list = document.querySelectorAll(
		".render-node .protyle-wysiwyg__embed"
	);

	list.forEach((e) => {
		const id = e.dataset.id;
		if (!e.firstChild.className.includes(checkClassName)) {
			getHPathByPath({
				id,
			}).then((res) => {
				const p = document.createElement("p");
				p.className = checkClassName;
				p.innerText = "🎯 " + res.data.slice(1);
				e.prepend(p);
			});
		}
	});
}

window.addEventListener("keydown", (event) => {
	const keycode = event.key;
	const ctrlKeyCode = event.ctrlKey;
	if (keycode === "F5" && ctrlKeyCode) {
		forceReload();
	}

	if (keycode === "F4" && ctrlKeyCode) {
		injectCommentFunc();
	}

	if (keycode === "F3" && ctrlKeyCode) {
		addRenderNoteRoute();
	}

	if (keycode === "F1" && ctrlKeyCode) {
		const style = document.querySelector(".toolbar").style.display;
		if (style !== "none") {
			document.querySelector(".toolbar").style.display = "none";
		} else {
			document.querySelector(".toolbar").style.display = "flex";
		}
	}

	if (keycode === "F2" && ctrlKeyCode) {
		const style = document.querySelector("#dockLeft").style.display;
		if (style !== "none") {
			document.querySelector("#dockLeft").style.display = "none";
		} else {
			dockRight;
			document.querySelector("#dockLeft").style.display = "flex";
		}

		document.querySelector("#dockRight").style.display = document.querySelector(
			"#dockLeft"
		).style.display;
	}
});

function hideTitle() {
	const title = document.querySelector("#drag");
	if (title.innerHTML.trim().startsWith("思源笔记 v2.")) {
		title.innerHTML = "❤️‍🔥Roger's note —— " + new Date().toLocaleDateString();
	}
}
