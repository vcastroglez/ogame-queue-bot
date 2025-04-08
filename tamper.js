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

function randomReload(locationToGo = null, sleepFactor = 15) {
	const timeout = Math.random() * sleepFactor * 1000;
	clearTimeout(timeoutObj);
	console.log(`Sleeping for ${timeout} as we couldn't build ${locationToGo}`);
	timeoutObj = setTimeout(() => locationToGo ? location.href = locationToGo : location.reload(), timeout);//location.reload()
}

function randomComponentNavigation(component = 'supplies', sleepFactor = 5) {
	let currentUri = location.href;
	if (!currentUri.includes('cp=')) {
		const planet = getPlanet();
		currentUri = `${currentUri}&cp=${planet}`;
	}

	const [host, query] = currentUri.split('?');
	const queryParts = query.replace('#', '').split('&');
	const toJoin = [];
	for (const queryPartsKey in queryParts) {
		const part = queryParts[queryPartsKey];
		if (part.startsWith('component=')) {
			if (part.split('=')[1] === component) {
				console.log("We're already here");//vla
				return true;
			} else {
				toJoin.push(`component=${component}`);
				continue;
			}
		}
		toJoin.push(part);
	}
	const toGo = `${host}?${toJoin.join('&')}`;
	randomReload(toGo, sleepFactor);
}

function initQueueUI() {
	const queue = getQueue();
	if (queue.length && getShouldRun()) {
		const success = buildFromQueue();
		if (!success) {
			const nextIndex = getIndex() + 1;
			setIndex(nextIndex);
			randomReload(null, 20);
		}
	}

	const currentTab = getCurrentTab();
	if (!currentTab) {
		return;
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
			if (!currentUri.includes('cp=')) {
				currentUri = `${currentUri}&cp=${planet}`;
			}
			addToQueue({ selector: queryClass, label: label, uri: currentUri });
			location.reload();
		})
	}
}

function initUI() {
	initQueueUI();
	renderQueueToggle();
	renderQueue();
	initExpeditionUI();
	initGatherResourcesUI();
}

async function initExpeditionUI() {
	const whereName = 'exp-send';
	const currentTab = getCurrentTab();
	if (!currentTab) return;
	const whereNow = where();
	if (whereNow === whereName) {
		if (subWhere() && subWhere() !== currentTab) {
			console.log("a");//vla

			randomComponentNavigation(subWhere());
			return;
		}
	}

	const container = document.getElementById('menuTable');
	const expBtn = document.createElement('li');
	expBtn.innerHTML = `
		<span class="menu_icon">
			<span class="menuImage"></span>
		</span>
		<a class="menubutton ipiHintable" href="#" accesskey="" target="_self" data-ipi-hint="ipiToolbarGatherHere">
			<span class="textlabel">Send expeditions</span>
		</a>
	`
	container.appendChild(expBtn);

	expBtn.addEventListener('click', function () {
		if (where() === whereName) {
			where(null);
			subWhere(null);
			step(null);
			randomComponentNavigation()
			return;
		}

		where(whereName);
		if (!subWhere()) {
			subWhere('galaxy');
			step('send')
			randomComponentNavigation('galaxy');
			return;
		}

		console.log(where(), subWhere(), step());//vla
		location.reload();
	});

	if (!whereNow) {
		console.log('do not do it');//vla
		return;
	}
	if (currentTab === 'galaxy' && step() === 'send') {
		step('fleet')
		subWhere('fleetdispatch');
		document.getElementById('expeditionbutton').click();
	}

	if (currentTab === 'fleetdispatch' && step() === 'fleet') {
		const expLeft = maxExpeditionCount - expeditionCount;
		if(!expLeft){
			//All done
			where(null);
			step(null);
			subWhere(null);
			randomComponentNavigation();
			return;
		}
		
		const divisor = 1 / ( expLeft );
		const totalLarge = Math.floor(parseInt(document.querySelector('.transporterLarge>.amount').dataset.value) * divisor);
		const totalSmall = Math.floor(parseInt(document.querySelector('.transporterSmall>.amount').dataset.value) * divisor);
		let totalProbe = Math.floor(parseInt(document.querySelector('.espionageProbe>.amount').dataset.value) * divisor);
		totalProbe = Math.min(totalProbe, 300);
		const totalExplorer = Math.floor(parseInt(document.querySelector('.explorer>.amount').dataset.value) * divisor);
		console.log(totalLarge, totalSmall, totalProbe, totalExplorer);//vla

		const tlInput = document.querySelector('input[name="transporterLarge"]');
		const tsInput = document.querySelector('input[name="transporterSmall"]');
		const probeInput = document.querySelector('input[name="espionageProbe"]');
		const explorerInput = document.querySelector('input[name="explorer"]');

		await setInputValue(tlInput, totalLarge);
		await setInputValue(tsInput, totalSmall);
		await setInputValue(probeInput, totalProbe);
		await setInputValue(explorerInput, totalExplorer);
		await wait();
		const continueTo2 = document.getElementById('continueToFleet2');
		await clickIt(continueTo2);
		await wait();

		subWhere('galaxy');
		step('send')
		document.getElementById('sendFleet').click();
	}
}

const numberEvents = [
	{
		"key": "0",
		"keyCode": 48,
		"which": 48,
		"code": "Digit0",
		"location": 0,
		"altKey": false,
		"ctrlKey": false,
		"metaKey": false,
		"shiftKey": false,
		"repeat": false
	},
	{
		"key": "1",
		"keyCode": 49,
		"which": 49,
		"code": "Digit1",
		"location": 0,
		"altKey": false,
		"ctrlKey": false,
		"metaKey": false,
		"shiftKey": false,
		"repeat": false
	},
	{
		"key": "2",
		"keyCode": 50,
		"which": 50,
		"code": "Digit2",
		"location": 0,
		"altKey": false,
		"ctrlKey": false,
		"metaKey": false,
		"shiftKey": false,
		"repeat": false
	}, {}, {}, {},
	{
		"key": "6",
		"keyCode": 54,
		"which": 54,
		"code": "Digit6",
		"location": 0,
		"altKey": false,
		"ctrlKey": false,
		"metaKey": false,
		"shiftKey": false,
		"repeat": false
	}
];

async function setInputValue(el, value, slow = false) {
	value = `${value}`;
	await wait(1000);
	el.select();
	if (!slow) {
		await clickIt(el);
		el.setAttribute('value', value);
		return;
	}

	await clickIt(el);
	await funcSimulateTyping(value, el);
	console.log('finish');//vla
}

async function clickIt(el) {
	await wait();

	function eventFire(el, etype = 'click') {
		if (el.fireEvent) {
			el.fireEvent('on' + etype);
			el [etype]();
		} else {
			const evObj = new Event('click', {
				bubbles: true,
				cancelable: false,
				target: el,
				srcElement: el,
			});
			el.dispatchEvent(evObj);
		}
	}

	eventFire(el);
}

async function funcSimulateTyping(strContent, objElement, intSpeed = 100) {
	let intIndex = 0;

	async function funcTypeNextCharacter() {
		let val = "";
		if (intIndex < strContent.length) {
			val += strContent.charAt(intIndex);
			objElement.setAttribute('value', val);
			intIndex++;
			setTimeout(funcTypeNextCharacter, intSpeed);
			return;
		}

		return new Promise((resolve, reject) => {
			resolve();
		})
	}

	await funcTypeNextCharacter();
}

async function wait(time = null) {
	const random = Math.random() * ( 2 - 0.5 ) + 0.5;
	if (!time) {
		time = random;
	} else {
		time = time + random;
	}
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, time);
	})
}

function initGatherResourcesUI() {
	if (where() == 'start-gather') {
		console.log('yep');//vla
	}


	const container = document.getElementById('menuTable');
	const gatherHereBtn = document.createElement('li');
	gatherHereBtn.innerHTML = `
		<span class="menu_icon">
			<span class="menuImage"></span>
		</span>
		<a class="menubutton ipiHintable" href="#" accesskey="" target="_self" data-ipi-hint="ipiToolbarGatherHere">
			<span class="textlabel">Gather here</span>
		</a>
	`
	container.appendChild(gatherHereBtn);

	gatherHereBtn.addEventListener('click', function () {
		if (where() == 'start-gather') {
			where(null);
			return;
		}
		//turn off the queue
		localStorage.setItem('queue-running', "0");
		where('start-gather');
		const planets = getPlanets(true);
		key('planets', JSON.stringify(planets));
		key('current-planet', 0);
		key('target-coords', JSON.stringify(getCurrentCoords()));
		location.href = planets[0];
	});
}

function getCurrentCoords() {
	return document.querySelector('a.planetlink.active .planet-koords').innerText.replace('[', '').replace(']', '').split(':')
}

function key(key, value = undefined) {
	if (value === null) {
		localStorage.removeItem('where');
		return;
	}

	if (value !== undefined) {
		localStorage.setItem(key, value);
		return;
	}

	return localStorage.getItem(key);
}

function where(value = undefined) {
	return key('where', value);
}

function subWhere(value = undefined) {
	return key('where.sub', value);
}

function step(value = undefined) {
	return key('step', value);
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

function getPlanets(ignoreCurrentPlanet = false) {
	const currentPlanet = getPlanet();
	const planetEls = document.querySelectorAll('.planetlink')
	const toReturn = [];
	for (const planetElsKey in planetEls) {
		const link = planetEls[planetElsKey]?.href ?? false;
		if (!link) continue;
		if (ignoreCurrentPlanet && link.includes(`cp=${currentPlanet}`)) continue;
		toReturn.push(link)
	}
	return toReturn;
}

function buildFromQueue() {
	const queue = getQueue();
	const index = getIndex();
	const toBuild = queue[index] ?? null;
	if (!toBuild) {
		console.log("Can't find index to build, resetting it");
		setIndex(0);
		randomReload(null, 10);
		return true;
	}

	console.log(`Trying to build index ${index}`);

	if (toBuild.uri && ( location.href !== toBuild.uri )) {
		randomReload(toBuild.uri, 5)
		return true;
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

	queue[index] = null;
	updateQueue(queue);

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

function setIndex(index = 0) {
	localStorage.setItem('queue-index', index.toString());
}

function getIndex() {
	let index = localStorage.getItem('queue-index') ?? "0";
	return parseInt(index);
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
	if (!currentTabBtn) {
		return null;//Not in a tab
	}

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
