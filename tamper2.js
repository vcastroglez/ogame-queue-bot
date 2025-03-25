let timeoutDuration = 2000;

( function () {
	// If is not in the supplies tab, then open it.
	// If in supplies tab:
	// always - If not enough energy build solar panel (<20)
	// 1 - If metal mine is < 3 levels above crystal mine, then build it
	// 2 - If metal mine is > 3 levels above crystal mine, then build crystal mine
	// 3 - If crystal mine is > 3 levels above deuterium syntetizer then build deuterium
	'use strict';
	actionLoop();
} )();

function actionLoop() {
	ensureInSupplies();
	handleActions();
	setTimeout(actionLoop, timeoutDuration)
}

function canBuild(mineClass) {

}


var metalMineClass = 'metalMine';
var crystalMineClass = 'crystalMine';
var solarPlantClass = 'solarPlant';
var energyResource = 'energy';
var crystalResource = 'crystal';
var metalResource = 'metal';
var deuteriumResource = 'deuterium';

function handleActions() {
	// new Promise(
	//(resolve, reject)=>{
	// if some condition "resolves" the promise you run the resolve function -> resolve(),
	// if some condition "rejects" the promise you run the reject function -> reject() }
	//)

	//A promise class instance has 2 methods
	// promise.then(()=>{}) that runs when resolve() is called (any parameters passed to resolve will get passed to the function inside `then` function parameter
	// promise.catch(()=>{}) thant runs when reject() is called (any parameters passed to reject will get passed to the function inside `catch` function parameter
	// checkIfWeShouldWait().then((timeWeShuoldWait)=>{ timeoutDuration = timeWeShouldWait })
	checkIfWeShouldWait().then((timeWeShouldWait) => {
		timeoutDuration = timeWeShouldWait ?? 2000;
	}).catch(() => {
		canBuildSolarMine().then(
			() => {
				buildMine(solarPlantClass)
			}).catch(() => {

			canBuildMetalMine().then(() => {
				buildMine(metalMineClass);
			}).catch(() => {
				canBuildCrystalMine().then(() => {
					buildMine(crystalMineClass);
				}).catch(() => {
					console.log('catch -> continue checking')
				})
			})
		});
	});
}

//This function needs to resolve if we need to wait, it needs to reject if we don't
function checkIfWeShouldWait() {
	return new Promise((resolve, reject) => {
		//Check if there is a waiting time somewhere.
		const waitingTimeElement = document.querySelector("#countdownbuildingDetails");
		if (waitingTimeElement == null) {
			timeoutDuration = 2000;
			reject();
		} else {
			const nowInSeconds = parseInt(( new Date() ).getTime() / 1000);
			const endAt = parseInt(waitingTimeElement.dataset.end);
			const waitTime = endAt - nowInSeconds;
			resolve(waitTime * 1000);
		}
	});
}

function canBuildCrystalMine() {
	return new Promise((resolve, reject) => {
		const metalMineLevel = getMineLevel(metalMineClass);
		const crystalMineLevel = getMineLevel(crystalMineClass);

		if (metalMineLevel < ( crystalMineLevel * 2 )) {
			reject();
		} else {
			resolve();
		}
	});
}


// 1 - If metal mine is < 3 levels above crystal mine, then build it
function canBuildMetalMine() {
	return new Promise((resolve, reject) => {
		const metalMineLevel = getMineLevel(metalMineClass);
		const crystalMineLevel = getMineLevel(crystalMineClass);

		if (metalMineLevel >= ( crystalMineLevel * 2 )) {
			reject();
		} else {
			resolve();
		}
	});
}

function canBuildSolarMine() {
	return new Promise((resolve, reject) => {
		if (getResourceAmount(energyResource) <= 20) {
			resolve(1);
		} else {
			reject();
		}
	})
}

function getMineLevel(mineCLass) {
	const level = document.querySelector(`span.${mineCLass} > span.level`);
	return parseInt(level.dataset.value);
}

//This function will build a fucking solar panel
function buildMine(mineClass) {
	var mineUpgradeBtn = document.querySelector(`span.${mineClass} > button.upgrade`);
	mineUpgradeBtn.click();
}

//THe purpose of this function is to return true if we need energy so that we build a
//solar fucking panel
//If we don't need energy then the function will return false
function getResourceAmount(resourceName) {
	var energyAmountElem = document.querySelector('#resources_' + resourceName);
	return energyAmountElem.dataset.raw;
}


function ensureInSupplies() {
	var currentTab = getCurrentTab();
	if (currentTab !== 'supplies') {
		navigateToSupplies();
	}
}

function navigateToSupplies() {
	var suppliesBtn = document.querySelector('a.menubutton[data-ipi-hint="ipiToolbarResourcebuildings"]');
	suppliesBtn.click();
}

function getCurrentTab() {
	var currentTabBtn = document.querySelector('a.selected.menubutton');

	var params = currentTabBtn
		.href
		.split('?')[1]
		.split('&');

	var currentTab;
	for (var elemKey in params) {
		var elem = params[elemKey];
		var parts = elem.split('=')
		if (parts[0] === 'component') {
			currentTab = parts[1];
			break;
		}
	}

	return currentTab;
}

function log(...args) {
	console.log(...args)
}
