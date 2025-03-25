let timeoutDuration = 2000;

( function () {
	// If is not in the supplies tab, then open it.
	// If in supplies tab:
	// always - If not enough energy build solar panel (<20)
	// 1 - If metal mine is < 3 levels above crystal mine, then build it
	// 2 - If metal mine is > 3 levels above crystal mine, then build crystal mine
	// 3 - If crystal mine is > 3 levels above deuterium syntetizer then build deuterium
	'use strict';

	initUI();

} )();
var timeoutObj = {};

function randomReload() {
	const timeout = Math.random() * 30 * 1000;
	clearTimeout(timeoutObj);
	console.log(`Sleeping for ${timeout} as we couldn't build`);
	timeoutObj = setTimeout(() => location.reload(), timeout);//location.reload()
}

function initUI() {
	const currentTab = getCurrentTab();
	const queue = getQueue();
	if (queue.length && getShouldRun()) {
		buildFromQueue();
		randomReload();
	}
	let producers = document.querySelectorAll(`#${currentTab} > #technologies ul > li`);

	for (let i = 0; i < producers.length; i++) {
		const el = producers[i];
		const label = el.ariaLabel;
		let queryClass = "";
		el.classList.forEach((oneClass) => {
			queryClass = queryClass + `.${oneClass}`;
		});

		const button = document.createElement('button');
		button.setAttribute('style', 'position: absolute;\n' +
			'    left: 50px;\n' +
			'    top: 0;\n' +
			'    padding: 0;\n' +
			'    width: 22px;\n' +
			'    height: 14px;\n' +
			'    border-bottom-right-radius: 4px;\n' +
			'    background: linear-gradient(#53a423, #2f6c04);\n' +
			'    color: #2b6303;\n' +
			'    text-align: center;\n' +
			'    z-index: 3;');
		button.setAttribute('class', 'tooltip js_hideTipOnMobile add-to-queue');
		button.innerText = "+";
		el.appendChild(button);

		button.addEventListener('click', function () {
			const planet = getPlanet();
			let currentUri = location.href;
			if(!currentUri.includes('cp=')){
				currentUri = `${currentUri}&cp=${planet}`;
			}
			addToQueue({ selector: queryClass, label: label, uri: currentUri });
			location.reload();
		})
	}

	renderQueueToggle();
	renderQueue();
}

//https://s261-es.ogame.gameforge.com/game/index.php?page=ingame&component=lfbuildings
function moveFirstToBack() {
	let queue = getQueue();
	const first = queue.shift();
	queue.push(first);
	updateQueue(queue);
}

function renderQueueToggle() {
	let status = getShouldRun();
	const container = document.querySelector('#myWorlds');
	const toggler = document.createElement('button');
	toggler.setAttribute('style', 'width: 100%; background-color: white; color: black;')
	toggler.innerText = `Toggle ${status ? 'off' : 'on'} the queue`;

	toggler.addEventListener('click', function () {
		status = status ? "0" : "1";
		localStorage.setItem('queue-running', status);
		location.reload();
	});
	container.appendChild(toggler);
}

function getShouldRun() {
	let status = localStorage.getItem('queue-running');
	if (status === undefined) {
		status = 0;
	} else {
		status = parseInt(status);
	}
	return status;
}

function getPlanet() {
	const activePlanet = document.querySelector('.planetlink.active')
	if (!activePlanet) return 0;
	return activePlanet.href.split('&').find(x => x.includes("cp=")).split('=')[1];
}

function buildFromQueue() {
	const queue = getQueue();
	const toBuild = queue.shift();

	if (toBuild.uri && (location.href !== toBuild.uri)) {
		location.href = toBuild.uri;
	}

	const el = document.querySelector(toBuild.selector);
	if (!el) {
		console.log('Cannot find the element');
		return false;
	}
	const upgradeBtn = el.querySelector('.upgrade');
	if (!upgradeBtn) {
		console.log('Cannot find the upgrade btn');
		return false;
	}
	upgradeBtn.click();

	localStorage.setItem(getQName(), JSON.stringify(queue.filter(x => x)));

	return true;
}

function renderQueue() {
	const container = document.querySelector('#myWorlds');
	const list = document.createElement('ul');
	list.setAttribute('style', 'background-color: lightgray; color: black;');
	const queue = getQueue();
	for (let i = 0; i < queue.length; i++) {
		const el = queue[i];
		const elementList = document.createElement('li');
		elementList.setAttribute('style', 'padding: 3px; border-bottom: 1px dashed black; width: 100%; cursor: pointer;')
		elementList.setAttribute('class', 'technology')
		elementList.innerText = el.label;
		list.appendChild(elementList);
		elementList.addEventListener('click', function () {
			delete queue[i];
			updateQueue(queue);
			location.reload();
		});
	}

	container.appendChild(list);
}

function updateQueue(queue) {
	localStorage.setItem(getQName(), JSON.stringify(queue.filter(x => x)));
}

function getQName() {
	return `the-queue`;
}

function getQueue() {
	let queue = localStorage.getItem(getQName()) ?? "[]";
	queue = JSON.parse(queue);
	return queue;
}

function addToQueue(queryClass) {
	let queue = getQueue();
	queue.push(queryClass);
	localStorage.setItem(getQName(), JSON.stringify(queue));
}

function getCurrentTab() {
	const currentTabBtn = document.querySelector('a.selected.menubutton');

	const params = currentTabBtn
		.href
		.split('?')[1]
		.split('&');

	let currentTab;
	for (const elemKey in params) {
		const elem = params[elemKey];
		const parts = elem.split('=');
		if (parts[0] === 'component') {
			currentTab = parts[1];
			break;
		}
	}

	return currentTab;
}
